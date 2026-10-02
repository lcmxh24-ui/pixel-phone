// ===== 生成：单聊 / 群聊 / 角色间私聊 =====
const Gen = {
  busy: new Set(),

  typing(convId, on) {
    document.dispatchEvent(new CustomEvent('pp:typing', { detail: { convId, on } }));
  },

  // 逐条发出。at 有值时是离线补发，时间落在过去；否则模拟打字延迟实时发出
        async post(convId, items, { at = null, batch = uid() } = {}) {
    for (let i = 0; i < items.length; i++) {
      // 先拆出 [译] 后面的译文，再交给 Media.prepare 处理图片、表情、转账等
      const sp = Lang.split(items[i].content);
      const it = await Media.prepare({ ...items[i], content: sp.content }, convId);
      if (!it) continue;
      const extra = { ...(it.extra || {}), batch };
      // 只有文字和语音带译文，转账、系统提示这类不带
      if (sp.trans && ['text', 'voice'].includes(it.type)) extra.trans = sp.trans;
      if (at) {
        extra.ts = Math.min(at + i * 15e3, Date.now() - (items.length - i) * 1000);
      } else {
        await sleep(Math.min(500 + it.content.length * 60, 2500));
      }
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
      const r = Prompt.parseLines(await API.claude(system, messages, { maxTokens: 1500 }), members.map(c => c.name));
      const byName = n => members.find(c => c.name === n);
      await this.post(convId, r.msgs.map(m => ({ sender: byName(m.name).id, type: m.type, content: m.content })), { at });
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
      : ['image', 'sticker'].includes(m.type) ? Media.render(m) : this.fmt(m.content, pid);
    // 译文：放在 body 整个表达式结束之后
    const tr = m.trans && S.settings.translate?.show !== false ? `<div class="tr">${esc(m.trans)}</div>` : '';
    return sep + `<div class="msg ${mine ? 'me' : 'them'}" data-id="${m.id}">
      ${avatar(who.avatar, who.name)}
      <div class="col">${showName && !mine ? `<div class="sender">${esc(who.name)}</div>` : ''}
        <div class="bubble" data-bubble>${body}${tr}</div></div></div>`;
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
  const right = isG ? '<button class="btn ghost" data-act="gset" aria-label="群设置">⚙</button>' : '';
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
      await addMsg(convId, 'user', text);
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
  const items = [{ label: '复制', value: 'copy' }, { label: '编辑', value: 'edit' }];
  if (m.trans) items.splice(1, 0, { label: '复制译文', value: 'copytr' });
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
    <p class="empty">群属于当前人设「${esc(persona(pid).name)}」。</p>
    <button class="btn" data-act="create">创建</button></div>`;
  screen().onclick = async e => {
    if (e.target.closest('[data-act]')?.dataset.act !== 'create') return;
    const members = checkedMembers();
    if (!members.length) return toast('至少选一个角色');
    const g = { id: uid(), name: $('#gname').value.trim() || '群聊', avatar: $('#gav').value.trim(), members, personaId: pid, created: Date.now() };
    await DB.put('groups', g);
    S.groups.push(g);
    Router.replace('group', { gid: g.id });
  };
};

Views.groupEdit = async ({ gid }) => {
  const g = S.groups.find(x => x.id === gid);
  if (!g) return Router.home();
  screen().innerHTML = topbar('群设置') + `<div class="body">
    <div class="card">
      <label class="field"><span>群名</span><input data-g="name" value="${esc(g.name)}"></label>
      <label class="field"><span>群头像链接</span><input data-g="avatar" value="${esc(g.avatar)}" autocapitalize="off"></label>
    </div>
    <h3>成员</h3><div class="card">${memberChecks(g.members, g.personaId)}</div>
    <button class="btn danger" data-act="del">解散群聊</button></div>`;
  const save = () => DB.put('groups', g);
  $$('[data-g]').forEach(el => el.onchange = () => { g[el.dataset.g] = el.value.trim(); save(); });
  $$('[data-mem]').forEach(el => el.onchange = () => { g.members = checkedMembers(); save(); });
  screen().onclick = async e => {
    if (e.target.closest('[data-act]')?.dataset.act !== 'del') return;
    if (!await confirmBox(`解散「${g.name}」（聊天记录一起删除）`)) return;
    for (const m of await getMsgs(Conv.g(gid))) await DB.del('msgs', m.id);
    await DB.del('groups', gid);
    S.groups = S.groups.filter(x => x.id !== gid);
    Router.home();
    Router.go('chats');
  };
};
