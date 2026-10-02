// 记忆体检：记忆状态、积压的总结、异常向量、错误日志
Views.health = async () => {
  const pid = activePid();
  screen().innerHTML = topbar('记忆体检') + '<div class="body"><p class="empty">检查中…</p></div>';

  const mems = (await DB.all('mems')).filter(m => m.personaId === pid);
  const useApi = !!S.settings.embed.url;
  let curDim = null, embErr = '';
  if (useApi) {
    try { curDim = (await Memory.apiEmbed('体检'))?.length || null; } catch (e) { embErr = e.message; }
  }
  // 配了接口时：本地向量、接口失败的、维度不符的都算需要修复
  const needFix = m => useApi && (m.vecType !== 'api' || m.vecErr || (curDim && m.vec?.length !== curDim));
  const bad = mems.filter(needFix);

  const pend = [];
  for (const id of Memory.convIds(pid)) {
    const n = await Memory.pendingCount(id);
    if (!n) continue;
    const st = await Memory.state(id);
    pend.push({ label: Conv.label(id, pid), n, st });
  }

  let usage = '';
  try {
    const est = await navigator.storage?.estimate?.();
    if (est) usage = `已用 ${(est.usage / 1048576).toFixed(1)} MB`;
  } catch { /* 部分浏览器不支持 */ }

  screen().innerHTML = topbar('记忆体检') + `<div class="body">
    <h3>向量接口</h3><div class="card">
      ${!useApi ? '<p>未配置，全部使用本地匹配。</p>'
        : embErr ? `<p>❌ 当前连不上：${esc(embErr)}</p><p class="empty">连不上时召回会自动改用本地匹配，不会完全失效。</p>`
        : `<p>✅ 正常，当前维度 ${curDim}</p>`}
    </div>

    <h3>记忆（${esc(persona(pid).name)}）</h3><div class="card">
      ${S.chars.map(c => {
        const ms = mems.filter(m => m.charId === c.id);
        const b = ms.filter(needFix).length;
        return `<div class="row"><span>${esc(c.name)}</span><span>${ms.length} 条 · ★${ms.filter(m => m.level === 'important').length}${b ? ` · <b>⚠ ${b} 条待修复</b>` : ''}</span></div>`;
      }).join('') || '<p class="empty">还没有角色</p>'}
      ${bad.length ? `<button class="btn" data-act="fix" style="margin-top:8px" ${embErr ? 'disabled' : ''}>修复异常向量（${bad.length} 条）</button>` : ''}
    </div>

    <h3>等待总结的消息</h3><div class="card">
      ${pend.length ? pend.map(p => `<div class="row"><span>${esc(p.label)}</span><span>${p.n} 条</span></div>
        ${p.st.fails ? `<p class="empty">⚠ 已连续失败 ${p.st.fails} 次：${esc(p.st.lastError)}</p>` : ''}`).join('')
        + '<button class="btn" data-act="sum" style="margin-top:8px">立即全部总结</button>'
        : '<p class="empty">没有积压</p>'}
      <p class="empty">没攒够轮数的消息也会显示在这里，属于正常现象。</p>
    </div>

    <h3>存储</h3><div class="card">
      <p>${Log.persisted ? '✅ 已开启持久存储' : '⚠ 未开启持久存储，系统空间紧张时可能清理数据'}${usage ? ' · ' + usage : ''}</p>
      <p class="empty">无论哪种状态都建议定期导出备份。</p>
    </div>

    <h3>错误日志</h3><div class="card">
      ${Log.list.length ? Log.list.slice(0, 50).map(l => `<div style="margin-bottom:8px">
        <small>${new Date(l.ts).toLocaleString('zh-CN')}${l.n > 1 ? ` · ×${l.n}` : ''}</small>
        <div><b>${esc(l.title)}</b></div>${l.detail ? `<small>${esc(l.detail)}</small>` : ''}</div>`).join('')
        + '<button class="btn ghost" data-act="clear">清空日志</button>'
        : '<p class="empty">没有错误</p>'}
    </div>
  </div>`;

  let running = false;
  screen().onclick = async e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (!a || running) return;
    if (a === 'clear') { await Log.clear(); return Router.render(); }
    running = true;
    try {
      if (a === 'fix') {
        let ok = 0;
        for (let i = 0; i < bad.length; i++) {
          Object.assign(bad[i], await Memory.vectorize(bad[i].text));
          await DB.put('mems', bad[i]);
          if (bad[i].vecType === 'api') ok++;
          if ((i + 1) % 10 === 0) toast(`进度 ${i + 1}/${bad.length}`, 1500);
        }
        Memory._q = { text: null, vec: null };
        toast(`修复成功 ${ok} 条${ok < bad.length ? `，失败 ${bad.length - ok} 条` : ''}`, 3000);
      }
      if (a === 'sum') {
        toast('总结中，别关网页…', 3000);
        const n = await Memory.summarizeAll(pid, t => toast(`已新增 ${t} 条记忆`, 1500));
        toast(`完成，新增 ${n} 条记忆`, 3000);
      }
    } finally {
      running = false;
      Router.render();
    }
  };
};
