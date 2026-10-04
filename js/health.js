// 记忆体检：记忆状态、积压的总结、异常向量、错误日志
Views.health = async () => {
  const pid = activePid();
  screen().innerHTML = topbar('记忆体检') + '<div class="body"><p class="empty">检查中…</p></div>';

  const mems = (await DB.all('mems')).filter(m => m.personaId === pid);
  const useApi = !!S.settings.embed.url;
    // 不自动测，点「测试连接」才测，结果在这次打开页面期间保留
  const curDim = Views.health._dim || null, embErr = Views.health._err || '';
  // 配了接口时：本地向量、接口失败的、维度不符的都算需要修复
  const needFix = m => useApi && (m.vecType !== 'api' || m.vecErr || (curDim && m.vec?.length !== curDim));
  const bad = mems.filter(needFix);

  const pend = [];
  for (const id of Memory.convIds(pid)) {
    const n = await Memory.pendingCount(id);
    if (!n) continue;
    const st = await Memory.state(id);
        pend.push({ id, label: Conv.label(id, pid), n, st });
  }

  let usage = '';
  try {
    const est = await navigator.storage?.estimate?.();
    if (est) usage = `已用 ${(est.usage / 1048576).toFixed(1)} MB`;
  } catch { /* 部分浏览器不支持 */ }

  screen().innerHTML = topbar('记忆体检') + `<div class="body">
        <h3>向量接口</h3><div class="card">
      ${!useApi ? '<p>未配置，全部使用本地匹配。</p>'
        : embErr ? `<p>❌ 连不上：${esc(embErr)}</p><p class="empty">连不上时召回会自动改用本地匹配，不会完全失效。</p>`
        : curDim ? `<p>✅ 正常，当前维度 ${curDim}</p>`
        : '<p class="empty">还没测试。点下面的按钮检查连接和维度。</p>'}
      ${useApi ? '<button class="btn ghost" data-act="ping">测试连接</button>' : ''}
    </div>

    <h3>记忆（${esc(persona(pid).name)}）</h3><div class="card">
      ${S.chars.map(c => {
        const ms = mems.filter(m => m.charId === c.id);
        const b = ms.filter(needFix).length;
        return `<div class="row"><span>${esc(c.name)}</span><span>${ms.length} 条 · ★${ms.filter(m => m.level === 'important').length}${b ? ` · <b>⚠ ${b} 条待修复</b>` : ''}</span></div>`;
      }).join('') || '<p class="empty">还没有角色</p>'}
      ${bad.length ? `<button class="btn" data-act="fix" style="margin-top:8px" ${embErr ? 'disabled' : ''}>修复异常向量（${bad.length} 条）</button>` : ''}
  <button class="btn ghost" data-act="compact" style="margin-top:8px">整理旧记忆</button>
      <p class="empty">把 3 个月前的零碎普通记忆按月合并成大概印象，重要记忆不受影响。原记忆会被删除，建议先导出备份。</p>
    </div>

    <h3>等待总结的消息</h3><div class="card">
      ${pend.length ? pend.map(p => `<button class="row" data-act="open" data-conv="${esc(p.id)}"><span class="grow">${esc(p.label)}</span><span>${p.n} 条 ▸</span></button>
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
    if (a === 'open') return Router.go('pending', { convId: e.target.closest('[data-conv]').dataset.conv });
    if (a === 'clear') { await Log.clear(); return Router.render(); }
    if (a === 'ping') {
      toast('测试中…');
      Views.health._dim = null; Views.health._err = '';
      try { Views.health._dim = (await Memory.apiEmbed('体检'))?.length || null; }
      catch (err) { Views.health._err = err.message; }
      return Router.render();
    }
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
      if (a === 'compact') {
        if (!confirm('会把 3 个月前的零碎普通记忆合并成印象，原记忆删除后不能恢复。\n\n建议先导出备份。确定继续吗？')) return;
        toast('整理中，别关网页…', 3000);
        let merged = 0, made = 0;
        for (const c of S.chars) {
          const r = await Memory.compact(c.id, pid);
          merged += r.merged; made += r.made;
          if (r.merged) toast(`${c.name}：${r.merged} 条合并成 ${r.made} 条`, 1500);
        }
        toast(merged ? `完成，${merged} 条旧记忆合并成了 ${made} 条印象` : '没有需要整理的旧记忆', 3000);
      }
  };
};
