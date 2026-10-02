// ===== 生成：单聊 / 群聊 / 角色间私聊 =====
const Gen = {
  busy: new Set(),

  typing(convId, on) {
    document.dispatchEvent(new CustomEvent('pp:typing', { detail: { convId, on } }));
  },

  // 逐条发出。at 有值时是离线补发，时间落在过去；否则模拟打字延迟实时发出
         async post(convId, items, { at = null, batch = uid() } = {}) {
    const ci = Conv.parse(convId);
    for (let i = 0; i < items.length; i++) {
      const ts = at ? Math.min(at + i * 15e3, Date.now() - (items.length - i) * 1000) : null;
      // 群里刚被踢出去的人，后面的话不再发出
      if (ci.type === 'g' && items[i].sender !== 'user' && !ci.group?.members.includes(items[i].sender)) continue;
      // 群管理操作：执行成功才显示一条系统提示
      if (items[i].cmd) {
        const t = await GroupAdmin.apply(convId, items[i].sender, items[i].cmd);
        if (t) await addMsg(convId, items[i].sender, t, 'sys', { batch, ...(ts ? { ts } : {}) });
        continue;
      }
      // 先拆出 [译] 后面的译文，再交给 Media.prepare 处理图片、表情、转账等
      const sp = Lang.split(items[i].content);
      const it = await Media.prepare({ ...items[i], content: sp.content }, convId);
      if (!it) continue;
      const extra = { ...(it.extra || {}), batch };
      // 只有文字和语音带译文，转账、系统提示这类不带
      if (sp.trans && ['text', 'voice'].includes(it.type)) extra.trans = sp.trans;
      if (ts) extra.ts = ts;
      else await sleep(Math.min(500 + it.content.length * 60, 2500));
      await addMsg(convId, it.sender, it.content, it.type, extra);
    }
  },

  async run(convId, at, fn) {
    if (this.busy.has(convId)) return null;
    this.busy.add(convId);
    if (!at) this.typing(convId, true);
    try { return await fn(); }
    catch (e) { console.error(e); toast('生成失败：' + e.message, 4000); return null; }
    finally {
      this.busy.delete(convId);
      this.typing(convId, false);
      Memory.maybeSummarize(convId).catch(e => Log.add('记忆总结出错', e.message));
    }
  },

  dm(convId, { hint = '', at = null, proactive = false } = {}) {
    return this.run(convId, at, async () => {
      const { pid, charId } = Conv.parse(convId);
      const ch = charById(charId);
      if (!ch) return null;
      const { system, messages } = await Prompt.buildDM(ch, convId, { hint, at });
      const r = Prompt.parseDM(await API.claude(system, messages), ch);
      if (r.skip) return r;
      if (r.ignore) {
        // 主动找人时不会"已读不回"
        if (!proactive) await this.post(convId, [{ sender: ch.id, type: 'ignore', content: r.ignore }], { at });
      } else {
        await this.post(convId, r.msgs.map(m => ({ sender: ch.id, ...m })), { at });
      }
      for (const it of r.intents) await Social.queueIntent(pid, ch.id, it.to, it.reason);
      return r;
    });
  },

  group(gid, { at = null } = {}) {
    const convId = Conv.g(gid);
    return this.run(convId, at, async () => {
      const g = S.groups.find(x => x.id === gid);
      const members = (g?.members || []).map(charById).filter(Boolean);
      if (!members.length) throw new Error('群里还没有角色');
      const { system, messages } = await Prompt.buildGroup(g, convId);
            const r = Prompt.parseLines(await API.claude(system, messages, { maxTokens: 1500 }), members.map(c => c.name), { cmds: true });
      const byName = n => members.find(c => c.name === n);
      await this.post(convId, r.msgs.map(m => ({ sender: byName(m.name).id, type: m.type, content: m.content, cmd: m.cmd })), { at });
      for (const it of r.intents) {
        const f = byName(it.from);
        if (f) await Social.queueIntent(g.personaId, f.id, it.to, it.reason);
      }
      return r;
    });
  },

  cc(convId, { reason = '', from = null, at = null } = {}) {
    return this.run(convId, at, async () => {
      const i = Conv.parse(convId);
      let a = charById(i.a), b = charById(i.b);
      if (!a || !b) return null;
      // a 是发起人
      if (from === b.id || (!from && Math.random() < 0.5)) [a, b] = [b, a];
      const { system, messages } = await Prompt.buildCC(a, b, convId, { reason, at });
      const r = Prompt.parseLines(await API.claude(system, messages, { maxTokens: 1500 }), [a.name, b.name]);
      await this.post(convId, r.msgs.map(m => ({ sender: m.name === a.name ? a.id : b.id, type: m.type, content: m.content })), { at });
      return r;
    });
  },

  // 按会话类型触发回复
  reply(convId) {
    const i = Conv.parse(convId);
    if (i.type === 'dm') return this.dm(convId);
    if (i.type === 'g') return this.group(i.gid);
    if (i.type === 'r') return this.read(i.rid);
    if (i.type === 'cc') return this.cc(convId);
  },
};

// ===== 聊天界面 =====
const ChatUI = {
  convId: null,

  timeLabel(ts) {
    const d = new Date(ts), t = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
    return d.toDateString() === new Date().toDateString() ? t : `${d.getMonth() + 1}/${d.getDate()} ${t}`;
  },

  // 转义后高亮 @名字
  fmt(text, pid) {
    let h = esc(text);
    for (const n of [...S.chars.map(c => c.name), persona(pid).name, '全体成员']) {
      if (n) h = h.split(esc('@' + n)).join(`<span class="at">@${esc(n)}</span>`);
    }
    return h.replace(/\n/g, '<br>');
  },

   html(m, pid, meId, showName, prevTs) {
    const sep = !prevTs || m.ts - prevTs > 5 * 60e3 ? `<div class="tsep">${this.timeLabel(m.ts)}</div>` : '';
    const who = m.sender === 'user' ? persona(pid) : (charById(m.sender) || { name: '?' });
    if (m.type === 'ignore') {
      return sep + `<div class="ignore" data-ign><span>💤 ${esc(who.name)} 已读未回</span><div class="why">${esc(m.content)}</div></div>`;
    }
    if (m.type === 'sys') return sep + `<div class="tsep">${esc(m.content)}</div>`;
    const mine = m.sender === meId;
    const sec = Math.max(1, Math.ceil(m.content.length / 4));
    const body = m.type === 'voice'
      ? `<button class="voice" data-voice="${m.id}" aria-label="语音消息 ${sec} 秒">▶ ${'▮'.repeat(Math.min(8, Math.ceil(sec / 3)))} ${sec}"</button><div class="vtext">${esc(m.content)}</div>`
      : m.type === 'transfer' ? Wallet.render(m, pid)
      : m.type === 'petinvite' ? Pet.renderInvite(m)
      : ['image', 'sticker'].includes(m.type) ? Media.render(m) : this.fmt(m.content, pid);
    // 译文：放在 body 整个表达式结束之后
    const tr = m.trans && S.settings.translate?.show !== false ? `<div class="tr">${esc(m.trans)}</div>` : '';
    return sep + `<div class="msg ${mine ? 'me' : 'them'}" data-id="${m.id}">
      ${avatar(who.avatar, who.name)}
      <div class="col">${showName && !mine ? `<div class="sender">${esc(who.name)}</div>` : ''}
                <div class="bubble${m.keepRaw ? ' raw' : ''}" data-bubble ${m.keepRaw ? 'title="这条在对方看来是原文"' : ''}>${body}${tr}</div></div></div>`;
  },
     ctx(convId) {
    const i = Conv.parse(convId);
    return {
      i,
      pid: i.type === 'g' ? i.group?.personaId : i.pid,
      meId: i.type === 'cc' ? i.b : 'user',
      showName: i.type !== 'dm',
    };
  },

  async refresh() {
    const box = $('#msgs');
    if (!box || !this.convId) return;
    const { i, pid, meId, showName } = this.ctx(this.convId);
    const list = await getMsgs(this.convId);
    this.list = list;
    box.innerHTML = list.map((m, k) => this.html(m, pid, meId, showName, list[k - 1]?.ts)).join('')
      || `<p class="empty">${i.type === 'cc' ? '他们还没聊过' : '打个招呼吧'}</p>`;
    box.scrollTop = box.scrollHeight;
    if (i.type !== 'cc') await markRead(this.convId);
  },
};

const CHAT_VIEWS = ['chat', 'group', 'peekView'];
document.addEventListener('pp:msg', e => {
  if (e.detail.convId === ChatUI.convId && CHAT_VIEWS.includes(Router.cur()?.name)) ChatUI.refresh();
});
document.addEventListener('pp:typing', e => {
  if (e.detail.convId !== ChatUI.convId) return;
  const t = $('#typing');
  if (t) t.hidden = !e.detail.on;
});

// 连续发几条时等你停下再回复
Views.chat = async ({ convId }) => {
  const { i, pid } = ChatUI.ctx(convId);
  let title;
  if (i.type === 'dm') title = charById(i.charId)?.name;
  else if (i.type === 'g') title = i.group && `${i.group.name}（${i.group.members.length + 1}）`;
  else title = `${charById(i.a)?.name || '?'} & ${charById(i.b)?.name || '?'}`;
  if (!title) return Router.back();

    const isG = i.type === 'g', isCC = i.type === 'cc';
    // 单聊 / 群聊：我发的消息在对方看来是哪种语言
  const langOpts = (i.type === 'dm' || isG) ? Lang.choices(convId, pid) : [];
  let autoLang = S.settings.autoLang?.[convId] || '';
  if (autoLang === true) autoLang = langOpts[0] || ''; // 兼容上一版存的 true
  if (!langOpts.includes(autoLang)) autoLang = '';
  const langBtn = langOpts.length
    ? `<button class="btn ${autoLang ? '' : 'ghost'}" data-act="autolang" aria-pressed="${!!autoLang}" aria-label="我的消息在对方看来的语言">译${autoLang ? '✓' : ''}</button>` : '';
  const right = (langBtn || isG)
    ? `<span class="flex" style="gap:4px;flex-wrap:nowrap">${langBtn}${isG ? '<button class="btn ghost" data-act="gset" aria-label="群设置">⚙</button>' : ''}</span>` : '';
  const typingText = isCC ? '他们正在聊…' : isG ? '有人正在输入…' : '对方正在输入…';
  const bottom = isCC
    ? `<div class="peekbar"><span>👀 你在偷看，他们不知道</span><button class="btn" data-act="more">让他们继续聊</button></div>`
       : `<div class="inputbar">
        <button class="btn ghost" data-act="media" aria-label="发图片、表情或转账">＋</button>
        ${isG ? '<button class="btn ghost" data-act="at" aria-label="艾特">@</button>' : ''}
        <textarea id="inp" rows="1" placeholder="发消息…" aria-label="输入消息"></textarea>
        <button class="btn ghost" data-act="send">发送</button>
        <button class="btn" data-act="reply" aria-label="让对方回复">回复</button></div>`;

  screen().innerHTML = topbar(title, right) +
    `<div class="cv"><div class="cv-msgs" id="msgs"></div>
     <div class="typing" id="typing" ${Gen.busy.has(convId) ? '' : 'hidden'}>${typingText}</div>${bottom}</div>`;
  ChatUI.convId = convId;
  await ChatUI.refresh();

  screen().onclick = async e => {
    const ign = e.target.closest('[data-ign]');
    if (ign) return ign.classList.toggle('open');

    const v = e.target.closest('[data-voice]');
    if (v) {
      const txt = v.nextElementSibling;
      txt.classList.toggle('open');
      const m = ChatUI.list.find(x => x.id === v.dataset.voice);
      try { await API.speak(m.content); } catch (err) { toast(err.message); }
      return;
    }

    const bub = e.target.closest('[data-bubble]');
    if (bub) return msgActions(ChatUI.list.find(x => x.id === bub.closest('[data-id]').dataset.id));

    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'media') return Media.pick(convId);
    if (a === 'gset') return Router.go('groupEdit', { gid: i.gid });
       if (a === 'autolang') {
      let next = '';
      if (!isG && langOpts.length === 1) next = autoLang ? '' : langOpts[0];
      else {
        next = await actionSheet([
          ...langOpts.map(L => ({ label: (autoLang === L ? '✓ ' : '') + `我的消息在他们看来是${L}`, value: L })),
          ...(autoLang ? [{ label: '关闭', value: 'off' }] : []),
        ]);
        if (!next) return;
        if (next === 'off') next = '';
      }
      S.settings.autoLang = { ...(S.settings.autoLang || {}), [convId]: next };
      await saveSettings();
      toast(next ? `已开启：你发的消息在对方看来是${next}` : '已关闭');
      return Router.render();
    }
    if (a === 'more') return Gen.cc(convId);
    if (a === 'at') {
      const names = [...i.group.members.map(charById).filter(Boolean).map(c => c.name), '全体成员'];
      const n = await actionSheet(names.map(x => ({ label: '@' + x, value: x })));
      if (n) { const inp = $('#inp'); inp.value += `@${n} `; inp.focus(); }
    }
        if (a === 'send') {
      const inp = $('#inp'), text = inp.value.trim();
      if (!text) return;
      inp.value = '';
      await addMsg(convId, 'user', text, 'text', autoLang ? { asLang: autoLang } : {});
      inp.focus();
    }
    if (a === 'reply') {
      if (Gen.busy.has(convId)) return toast(typingText);
      Gen.reply(convId);
    }
  };
};
Views.group = ({ gid }) => Views.chat({ convId: Conv.g(gid) });
Views.peekView = p => Views.chat(p);

async function msgActions(m) {
  if (!m) return;
  if (await Wallet.tap(m)) return;
  if (await Pet.tapInvite(m)) return;
  const items = [{ label: '复制', value: 'copy' }, { label: '编辑', value: 'edit' }];
  if (m.trans) items.splice(1, 0, { label: '复制译文', value: 'copytr' });
    const ci = Conv.parse(m.convId);
  const lopts = m.sender === 'user' && m.type === 'text' && ['dm', 'g'].includes(ci.type) ? Lang.choices(m.convId, ci.pid) : [];
  if (lopts.length) {
    if (Lang.sentAs(m)) items.splice(1, 0, { label: '这条在对方看来改回原文', value: 'raw' });
    else lopts.forEach(L => items.splice(1, 0, { label: `这条在对方看来是${L}`, value: 'as:' + L }));
  }
  if (m.sender !== 'user') items.push({ label: '重新生成这一轮', value: 'regen' });
  items.push({ label: '删除', value: 'del', danger: true });
    if (m.url) items.unshift(...Media.actions(m));
  const a = await actionSheet(items);
  if (await Media.doAction(a, m)) return;
  if (a === 'copy') { await navigator.clipboard?.writeText(m.content); toast('已复制'); }
  if (a === 'copytr') { await navigator.clipboard?.writeText(m.trans); toast('已复制'); }
  if (a === 'edit') {
    const t = await editText('编辑消息', m.content);
    if (t?.trim()) { m.content = t.trim(); await DB.put('msgs', m); ChatUI.refresh(); }
  }
   if (a === 'raw') {
    delete m.asLang; delete m.asNative; m.keepRaw = true;
    await DB.put('msgs', m); ChatUI.refresh();
  }
  if (typeof a === 'string' && a.startsWith('as:')) {
    m.asLang = a.slice(3); delete m.asNative; delete m.keepRaw;
    await DB.put('msgs', m); ChatUI.refresh();
  }

  if (a === 'del') { await DB.del('msgs', m.id); ChatUI.refresh(); }
  if (a === 'regen') await regenerate(m);
}

// 删掉同一轮生成的消息再重新生成。旧消息没有 batch，就删它之后所有非用户消息
async function regenerate(m) {
  if (Gen.busy.has(m.convId)) return toast('正在生成中');
  const all = await getMsgs(m.convId);
  const del = m.batch
    ? all.filter(x => x.batch === m.batch)
    : all.slice(all.findIndex(x => x.id === m.id)).filter(x => x.sender !== 'user');
  for (const x of del) await DB.del('msgs', x.id);
  await ChatUI.refresh();
  Gen.reply(m.convId);
}

// ===== 群聊管理 =====
function memberChecks(selected, pid) {
  if (!S.chars.length) return '<p class="empty">还没有角色</p>';
  return S.chars.map(c => `<label class="row"><span class="flex" style="gap:6px">${avatar(c.avatar, c.name, 'sm')}${esc(c.name)}
    ${knows(pid, c.id) ? '' : '<small>（和你不认识）</small>'}</span>
    <input type="checkbox" data-mem="${c.id}" ${selected.includes(c.id) ? 'checked' : ''}></label>`).join('');
}
const checkedMembers = () => $$('[data-mem]').filter(x => x.checked).map(x => x.dataset.mem);

Views.newGroup = async () => {
  const pid = activePid();
  screen().innerHTML = topbar('新建群聊') + `<div class="body">
    <div class="card">
      <label class="field"><span>群名</span><input id="gname" value="新群聊"></label>
      <label class="field"><span>群头像链接</span><input id="gav" placeholder="https://..." autocapitalize="off"></label>
    </div>
    <h3>选择成员</h3><div class="card">${memberChecks([], pid)}</div>
    <h3>群主</h3><div class="card">
      <label class="field"><span>谁建的这个群</span><select id="gowner"><option value="user">${esc(persona(pid).name)}（我）</option></select></label>
      <label class="row"><span>让群主自己起群名（会覆盖上面填的）</span><input type="checkbox" id="gauto" checked></label>
      ${S.settings.image.url ? '<label class="row"><span>顺便让群主生成群头像</span><input type="checkbox" id="gautoav"></label>' : ''}
      <p class="empty">群主选角色时才生效。角色会以为群是他自己建的。</p>
    </div>
    <p class="empty">群属于当前人设「${esc(persona(pid).name)}」。</p>
    <button class="btn" data-act="create">创建</button></div>`;

  // 勾选成员后，群主下拉框跟着更新
  const ownerSel = $('#gowner');
  const syncOwner = () => {
    const cur = ownerSel.value;
    ownerSel.innerHTML = `<option value="user">${esc(persona(pid).name)}（我）</option>` +
      checkedMembers().map(id => `<option value="${id}">${esc(charById(id)?.name || '?')}</option>`).join('');
    ownerSel.value = [...ownerSel.options].some(o => o.value === cur) ? cur : 'user';
  };
  $$('[data-mem]').forEach(el => el.onchange = syncOwner);

  let creating = false;
  screen().onclick = async e => {
    if (e.target.closest('[data-act]')?.dataset.act !== 'create' || creating) return;
    const members = checkedMembers();
    if (!members.length) return toast('至少选一个角色');
    creating = true;
    const owner = ownerSel.value;
    const g = { id: uid(), name: $('#gname').value.trim() || '群聊', avatar: $('#gav').value.trim(), members, personaId: pid, owner, admins: [], created: Date.now() };
    await DB.put('groups', g);
    S.groups.push(g);
    if (owner !== 'user' && $('#gauto').checked) {
      toast(`${charById(owner).name} 在起群名…`, 3000);
      await GroupAdmin.autoName(g, !!$('#gautoav')?.checked);
    }
    Router.replace('group', { gid: g.id });
  };
};

Views.groupEdit = async ({ gid }) => {
  const g = S.groups.find(x => x.id === gid);
  if (!g) return Router.home();
  const GA = GroupAdmin, convId = Conv.g(gid), pid = g.personaId;
  const me = GA.role(g, 'user'), who = id => GA.name(g, id);
  const people = ['user', ...g.members];
  screen().innerHTML = topbar('群设置') + `<div class="body">
    <div class="card">
      <label class="field"><span>群名</span><input data-g="name" value="${esc(g.name)}"></label>
      <label class="field"><span>群头像链接</span><input data-g="avatar" value="${esc(g.avatar)}" autocapitalize="off"></label>
    </div>
    <h3>群主和管理员</h3>
    <p class="empty">这里改的算"本来就是这样"，群里不会通知，角色会以为群一开始就是群主建的。</p>
    <div class="card">
      <label class="field"><span>群主</span><select id="g-owner">${people.map(id =>
        `<option value="${id}" ${GA.owner(g) === id ? 'selected' : ''}>${esc(who(id))}</option>`).join('')}</select></label>
            ${people.filter(id => id !== GA.owner(g)).map(id => `<label class="row"><span>${esc(who(id))} 是管理员</span>
        <input type="checkbox" data-adm="${id}" ${GA.admins(g).includes(id) ? 'checked' : ''}></label>`).join('')}
      ${GA.owner(g) !== 'user' ? `<button class="btn ghost" data-act="rename" style="margin-top:8px">让 ${esc(who(GA.owner(g)))} 重新起群名（不通知）</button>` : ''}
    </div>
    ${me !== 'member' ? `<h3>在群里操作（会发通知）</h3><div class="card flex" style="gap:6px;flex-wrap:wrap">
      <button class="btn ghost" data-act="invite">拉人进群</button>
      <button class="btn ghost" data-act="kick">踢人</button>
      ${me === 'owner' ? '<button class="btn ghost" data-act="setadm">设 / 撤管理员</button><button class="btn ghost" data-act="transfer">转让群主</button>' : ''}
    </div>` : ''}
    <h3>成员（直接编辑，不发通知）</h3><div class="card">${memberChecks(g.members, pid)}</div>
    <button class="btn danger" data-act="del">解散群聊</button></div>`;

  const save = () => DB.put('groups', g);
  $$('[data-g]').forEach(el => el.onchange = () => { g[el.dataset.g] = el.value.trim(); save(); });
  $$('[data-mem]').forEach(el => el.onchange = async () => {
    g.members = checkedMembers();
    // 不在群里的人不能再当群主或管理员
    g.admins = GA.admins(g).filter(x => x === 'user' || g.members.includes(x));
    if (GA.owner(g) !== 'user' && !g.members.includes(g.owner)) g.owner = 'user';
    await save();
    Router.render();
  });
  $('#g-owner').onchange = async e => {
    g.owner = e.target.value;
    g.admins = GA.admins(g).filter(x => x !== g.owner);
    await save();
    Router.render();
  };
  $$('[data-adm]').forEach(el => el.onchange = async () => {
    g.admins = $$('[data-adm]').filter(x => x.checked).map(x => x.dataset.adm);
    await save();
  });

  // 选一个人，执行群操作，并在群里发通知
  const doAct = async (k, ids) => {
    if (!ids.length) return toast('没有可选的人');
    const id = await actionSheet(ids.map(x => ({ label: who(x), value: x })));
    if (!id) return;
    const t = await GA.apply(convId, 'user', { k, arg: who(id) });
    if (!t) return toast('不能这样操作');
    await addMsg(convId, 'user', t, 'sys');
    Router.render();
  };

  screen().onclick = async e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'rename') {
      toast('起名中…', 3000);
      if (await GA.autoName(g, false)) { toast('新群名：' + g.name); Router.render(); }
      else toast('起名失败，详情见「记忆体检」');
      return;
    }
    if (a === 'invite') return doAct('拉人', GA.invitable(g, 'user').map(c => c.id));
    if (a === 'kick') return doAct('踢人', g.members.filter(id => me === 'owner' || GA.role(g, id) === 'member'));
    if (a === 'transfer') return doAct('转让群主', g.members);
    if (a === 'setadm') {
      const id = await actionSheet(g.members.map(x => ({ label: (GA.admins(g).includes(x) ? '撤销管理员：' : '设为管理员：') + who(x), value: x })));
      if (!id) return;
      const t = await GA.apply(convId, 'user', { k: GA.admins(g).includes(id) ? '撤管理' : '设管理', arg: who(id) });
      if (t) { await addMsg(convId, 'user', t, 'sys'); Router.render(); }
      return;
    }
    if (a !== 'del') return;
    if (!await confirmBox(`解散「${g.name}」（聊天记录一起删除）`)) return;
    for (const m of await getMsgs(convId)) await DB.del('msgs', m.id);
    await DB.del('groups', gid);
    S.groups = S.groups.filter(x => x.id !== gid);
    Router.home();
    Router.go('chats');
  };
};

// ===== 群主 / 管理员 / 群管理操作 =====
const GroupAdmin = {
  owner: g => g.owner || 'user',
  admins: g => g.admins || [],
  role(g, id) { return id === this.owner(g) ? 'owner' : this.admins(g).includes(id) ? 'admin' : 'member'; },
  name(g, id) { return id === 'user' ? persona(g.personaId).name : charById(id)?.name || '?'; },
  idByName(g, n) {
    n = String(n).trim().replace(/^@/, '');
    if (n === persona(g.personaId).name) return 'user';
    return S.chars.find(c => c.name === n)?.id;
  },
  CMD: /^\[(改群名|换群头像|拉人|踢人|设管理|撤管理|转让群主)\]\s*(.*)$/,
  parse(s) { const m = String(s).trim().match(this.CMD); return m ? { k: m[1], arg: m[2].trim() } : null; },
  // 不在群里、而且被 id 认识的角色
  invitable(g, id) {
    return S.chars.filter(c => !g.members.includes(c.id) && (id === 'user' ? knows(g.personaId, c.id) : knows(id, c.id)));
  },

  // 执行一个群操作。成功返回系统提示文字，不允许就返回 null
  async apply(convId, actor, { k, arg }) {
    const g = Conv.parse(convId).group;
    if (!g || !arg) return null;
    const r = this.role(g, actor), boss = r !== 'member', who = this.name(g, actor);
    const t = this.idByName(g, arg), tn = t ? this.name(g, t) : '';
    let text = null;
    switch (k) {
      case '改群名':
        g.name = arg.slice(0, 30);
        text = `${who} 修改群名为「${g.name}」`;
        break;
      case '换群头像': {
        if (!S.settings.image.url) return null;
        try {
          const { style, desc } = Media.parseStyle(arg);
          const url = await Media.genImage(await Media.makePrompt(desc, style, charById(actor)));
          if (!url) return null;
          g.avatar = url;
        } catch (e) { Log.add('群头像生成失败', e.message); return null; }
        text = `${who} 更换了群头像`;
        break;
      }
      case '拉人':
        if (!boss || !t || t === 'user' || !this.invitable(g, actor).some(c => c.id === t)) return null;
        g.members.push(t);
        text = `${who} 邀请 ${tn} 加入了群聊`;
        break;
      case '踢人':
        if (!boss || !t || t === 'user' || !g.members.includes(t) || this.role(g, t) === 'owner') return null;
        if (r === 'admin' && this.role(g, t) === 'admin') return null;
        g.members = g.members.filter(x => x !== t);
        g.admins = this.admins(g).filter(x => x !== t);
        text = `${tn} 被 ${who} 移出了群聊`;
        break;
      case '设管理':
        if (r !== 'owner' || !t || t === actor || this.admins(g).includes(t)) return null;
        if (t !== 'user' && !g.members.includes(t)) return null;
        g.admins = [...this.admins(g), t];
        text = `${who} 将 ${tn} 设为管理员`;
        break;
      case '撤管理':
        if (r !== 'owner' || !this.admins(g).includes(t)) return null;
        g.admins = this.admins(g).filter(x => x !== t);
        text = `${who} 取消了 ${tn} 的管理员`;
        break;
      case '转让群主':
        if (r !== 'owner' || !t || t === actor) return null;
        if (t !== 'user' && !g.members.includes(t)) return null;
        g.owner = t;
        g.admins = this.admins(g).filter(x => x !== t);
        text = `${who} 将群主转让给 ${tn}`;
        break;
    }
    if (text) await DB.put('groups', g);
    return text;
  },

  // 写进群聊提示词的群信息和操作格式
  rules(g, members) {
    const o = this.owner(g), on = this.name(g, o), pname = persona(g.personaId).name;
    const adm = this.admins(g).map(id => this.name(g, id));
    const out = [`【群信息】群主是${on}（这个群就是${on}建的）${adm.length ? '，管理员：' + adm.join('、') : '，没有管理员'}。`];
    out.push(`- 改群名（任何人都可以，很少用）：单独一行 名字：[改群名]新群名`);
    if (S.settings.image.url) out.push(`- 换群头像（任何人都可以，很少用）：单独一行 名字：[换群头像]画面描述`);
    const bosses = members.filter(c => this.role(g, c.id) !== 'member');
    if (bosses.length) {
      out.push(`- 群管理（只有群主和管理员能用，单独一行，符合性格和剧情时才用，很少用）：名字：[拉人]对方名字 / 名字：[踢人]对方名字。管理员不能踢群主和其他管理员，谁都不能踢${pname}。`);
      for (const c of bosses) {
        const inv = this.invitable(g, c.id).map(x => x.name);
        if (inv.length) out.push(`  ${c.name}可以拉进群的人：${inv.join('、')}`);
      }
      const oc = members.find(c => c.id === o);
      if (oc) out.push(`- 群主${oc.name}还可以：名字：[设管理]名字 / 名字：[撤管理]名字 / 名字：[转让群主]名字`);
    }
    return out.join('\n');
  },
  // 让群主按自己的性格给群起名，可选顺便生成头像。静默修改，不发通知
  async autoName(g, withAvatar = false) {
    const o = charById(this.owner(g));
    if (!o || !S.settings.claude.key) return false;
    const pid = g.personaId, pname = persona(pid).name;
    const others = g.members.filter(id => id !== o.id).map(charById).filter(Boolean);
    const rel = c => getRel(o.id, c.id).desc || (knows(o.id, c.id) ? '认识' : '不熟');
    const wb = WB.build([o.id, ...g.members], '');
    const system = [
      `你在扮演${o.name}。${o.name}刚建了一个手机群聊，要给群起名字。`,
      `【${o.name}的设定】\n${o.persona || '（无）'}`,
      wb.constant && `【世界设定】\n${wb.constant}`,
      `【群成员】\n${pname}（${getRel(pid, o.id).desc || '认识'}）\n${others.map(c => `${c.name}（${rel(c)}）`).join('\n') || '（暂时没有别人）'}`,
      `【要求】
- 起一个符合${o.name}性格、语言习惯和这群人关系的群名。可以正经、随便、搞笑或者用梗，像真人建群时会起的名字。
- 群名用${o.name}的母语${Lang.of(o)}写。
- 第一行只写群名，不超过 15 个字，不加引号和解释。${withAvatar ? '\n- 第二行写群头像的画面描述，格式：[图片]类型|画面描述' : ''}`,
    ].filter(Boolean).join('\n\n');
    let out;
    try { out = await API.claude(system, [{ role: 'user', content: '起名吧。' }], { maxTokens: 200 }); }
    catch (e) { Log.add('群主起名失败', e.message); return false; }
    const lines = out.split('\n').map(s => s.trim()).filter(Boolean);
    const name = (lines.find(l => !l.startsWith('[')) || '').replace(/^["“「『]|["”」』]$/g, '').slice(0, 30);
    if (name) g.name = name;
    const img = lines.find(l => /^\[图片\]/.test(l));
    if (withAvatar && img && S.settings.image.url) {
      try {
        const { style, desc } = Media.parseStyle(img.replace(/^\[图片\]\s*/, ''));
        const url = await Media.genImage(await Media.makePrompt(desc, style, o));
        if (url) g.avatar = url;
      } catch (e) { Log.add('群头像生成失败', e.message); }
    }
    await DB.put('groups', g);
    return !!name;
  },
};

