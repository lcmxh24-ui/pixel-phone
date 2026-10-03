// ===== 生成：单聊 / 群聊 / 角色间私聊 =====
const Gen = {
  busy: new Set(),

  typing(convId, on) {
    document.dispatchEvent(new CustomEvent('pp:typing', { detail: { convId, on } }));
  },

  // 逐条发出。at 有值时是离线补发，时间落在过去；否则模拟打字延迟实时发出
         async post(convId, items, { at = null, batch = uid() } = {}) {
    const ci = Conv.parse(convId);
        let quoted = 0, posted = 0;
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
      // 引用：编号找原消息。引用紧挨着的上一条没意义，一轮最多两次
      if (items[i].quote && it.type !== 'sys') {
        const all = await getMsgs(convId), q = all.find(x => x.id.endsWith(items[i].quote));
        if (q && q.id !== all.at(-1)?.id && quoted < 2) { extra.quote = q.id; quoted++; }
      }
      if (ts) extra.ts = ts;
      else await sleep(Math.min(500 + it.content.length * 60, 2500));
            await addMsg(convId, it.sender, it.content, it.type, extra);
      posted++;
    }
    return posted;
  },

  async run(convId, at, fn) {
    if (this.busy.has(convId)) return null;
    this.busy.add(convId);
    if (!at) this.typing(convId, true);
    try { return await fn(); }
        catch (e) { console.error(e); Log.add('生成失败', e.message); return null; }
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
      // 角色拉黑了你：不会主动找你；你发消息时，TA 看完决定要不要解除
      const blocked = getRel(pid, ch.id).theyBlock;
      if (blocked && proactive) return null;
      const { system, messages } = await Prompt.buildDM(ch, convId, { hint: blocked ? Prompt.blockedHint() : hint, at });
      const raw = await API.claude(system, messages);
      const r = Prompt.parseDM(raw, ch);
      // 留一个可以点开看原因的小条。主动找人时没开口就什么都不留
      const noReply = (content, kind) => proactive ? null
        : this.post(convId, [{ sender: ch.id, type: 'ignore', content, extra: { kind } }], { at });
      if (blocked) {
        if (!r.unblock) { await noReply(r.skipWhy || r.ignore || '看到了，但还没消气', 'blocked'); return r; }
        await setRel(pid, ch.id, { theyBlock: false });
        Log.add(`${ch.name} 解除了对你的拉黑`, '');
      }
      if (r.skip) { await noReply(r.skipWhy || '没注意到手机', 'unseen'); return r; }
      if (r.ignore) {
        await noReply(r.ignore, r.ignoreKind);
      } else {
        const n = await this.post(convId, r.msgs.map(m => ({ sender: ch.id, ...m })), { at });
        if (!n) Log.add(`${ch.name} 的回复没有显示出来（解析后为空）`, raw.slice(0, 300));
      }
      if (r.block) {
        await setRel(pid, ch.id, { theyBlock: true });
        Log.add(`${ch.name} 把你拉黑了`, '');
      }
      // 私聊里答应拉你进群
      const gs = S.groups.filter(g => g.personaId === pid && g.userIn === false && g.members.includes(ch.id));
      for (const raw of r.invites) {
        const gname = Prompt.matchName(gs.map(g => g.name), raw);
        const g = gs.find(x => x.name === gname);
        if (!g) continue;
        const t = await GroupAdmin.apply(Conv.g(g.id), ch.id, { k: '拉人', arg: persona(pid).name });
        if (t) await addMsg(Conv.g(g.id), ch.id, t, 'sys');
      }
      for (const it of r.intents) await Social.queueIntent(pid, ch.id, it.to, it.reason);
      return r;
    });
  },

    group(gid, { at = null, hint = '' } = {}) {
    const convId = Conv.g(gid);
    return this.run(convId, at, async () => {
      const g = S.groups.find(x => x.id === gid);
      const members = (g?.members || []).map(charById).filter(Boolean);
      if (!members.length) throw new Error('群里还没有角色');
      // 把主动提示和补发时间传给提示词
      const { system, messages } = await Prompt.buildGroup(g, convId, { hint, at });
            const raw = await API.claude(system, messages, { maxTokens: 1500 });
      const r = Prompt.parseLines(raw, members.map(c => c.name), { cmds: true });
      const byName = n => members.find(c => c.name === n);
      const n = await this.post(convId, r.msgs.filter(m => byName(m.name)).map(m => ({ sender: byName(m.name).id, type: m.type, content: m.content, cmd: m.cmd, quote: m.quote })), { at });
      if (!n) Log.add(`群「${g.name}」的回复没有显示出来`, raw.slice(0, 300));
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
            const raw = await API.claude(system, messages, { maxTokens: 1500 });
      const r = Prompt.parseLines(raw, [a.name, b.name]);
      const n = await this.post(convId, r.msgs.map(m => ({ sender: m.name === a.name ? a.id : b.id, type: m.type, content: m.content, quote: m.quote })), { at });
      if (!n) Log.add(`${a.name}和${b.name}的私聊没有显示出来`, raw.slice(0, 300));
      const byName = n => [a, b].find(c => c.name === n);
      // 被朋友劝动了：解除对你的拉黑，然后主动来找你
      for (const n of r.unblocks) {
        const c = byName(n);
        if (!c || !getRel(i.pid, c.id).theyBlock) continue;
        await setRel(i.pid, c.id, { theyBlock: false });
        Log.add(`${c.name} 解除了对你的拉黑`, '');
        await Social.queueIntent(i.pid, c.id, persona(i.pid).name, '刚解除了对你的拉黑，想跟你说点什么');
      }
      // 聊完想去找别人（比如帮忙说情）
      for (const it of r.intents) {
        const f = byName(it.from);
        if (f) await Social.queueIntent(i.pid, f.id, it.to, it.reason);
      }
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
  quoting: null,
  selecting: null, // 多选转发时是选中的消息 ID 集合，平时为 null
  // 更新底部"已选 n 条"的条
  syncSel() {
    const b = $('#selbar');
    if (!b) return;
    b.hidden = !this.selecting;
    if (this.selecting) $('span', b).textContent = `已选 ${this.selecting.size} 条`;
  },
  // 输入框上方的引用条，m 为 null 时收起
  setQuote(m) {
    this.quoting = m;
    const b = $('#quotebar');
    if (!b) return;
    b.hidden = !m;
    if (!m) return;
    const pid = this.ctx(this.convId).pid;
    $('span', b).textContent = `引用 ${senderName(m, pid)}：${preview(m, false, pid).slice(0, 30)}`;
    $('#inp')?.focus();
  },
  // 点引用跳到原消息
  jump(id) {
    const el = $(`#msgs [data-id="${CSS.escape(id)}"]`);
    if (!el) return toast('原消息不在了');
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 1200);
  },

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
      const kind = { read: '已读没回', unseen: '没看消息', blocked: '拉黑中' }[m.kind] || '已读没回';
      return sep + `<div class="ignore" data-ign role="button" tabindex="0" aria-label="${esc(who.name)}没有回复，点开看原因"><span>💤 ${esc(who.name)} ▾</span><div class="why">${kind}：${esc(m.content)}</div></div>`;
    }
    if (m.type === 'sys') return sep + `<div class="tsep">${esc(m.content)}</div>`;
        if (m.type === 'offline') {
      const ns = (m.members || []).map(id => charById(id)?.name).filter(Boolean);
      return sep + `<div class="offline" data-id="${m.id}">
        <div class="off-h">📍 线下 · ${this.timeLabel(m.ts)}${ns.length > 1 ? ' · 在场：' + esc(ns.join('、')) : ''}${m.by === 'user' ? ' · 我写的' : ''}</div>
        <div class="off-b" data-bubble role="button" tabindex="0">${esc(m.content).replace(/\n/g, '<br>')}</div></div>`;
    }
    const mine = m.sender === meId;
    const sec = Math.max(1, Math.ceil(m.content.length / 4));
    const body = m.type === 'voice'
      ? `<button class="voice" data-voice="${m.id}" aria-label="语音消息 ${sec} 秒">▶ ${'▮'.repeat(Math.min(8, Math.ceil(sec / 3)))} ${sec}"</button><div class="vtext">${esc(m.content)}</div>`
           : m.type === 'transfer' || m.type === 'redpacket' ? Wallet.render(m, pid)
            : m.type === 'petinvite' ? Pet.renderInvite(m)
      : m.type === 'forward' ? Forward.render(m)
      : ['image', 'sticker'].includes(m.type) ? Media.render(m) : this.fmt(m.content, pid);
    // 译文：放在 body 整个表达式结束之后
    const tr = m.trans && S.settings.translate?.show !== false ? `<div class="tr">${esc(m.trans)}</div>` : '';
    const q = m.quote && this.list?.find(x => x.id === m.quote);
    const qt = m.quote ? `<div class="qt" data-jump="${m.quote}">${q ? esc(senderName(q, pid)) + '：' + esc(preview(q, false, pid).slice(0, 40)) : '原消息已删除'}</div>` : '';
        return sep + `<div class="msg ${mine ? 'me' : 'them'}${this.selecting?.has(m.id) ? ' sel' : ''}" data-id="${m.id}">
      ${avatar(who.avatar, who.name)}
      <div class="col">${showName && !mine ? `<div class="sender">${esc(who.name)}</div>` : ''}
                <div class="bubble${m.keepRaw ? ' raw' : ''}" data-bubble ${m.keepRaw ? 'title="这条在对方看来是原文"' : ''}>${qt}${body}${tr}</div></div></div>`;
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
    const shown = list.filter(m => m.type !== 'offline');
    box.innerHTML = shown.map((m, k) => this.html(m, pid, meId, showName, shown[k - 1]?.ts)).join('')
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
  else if (i.type === 'g') title = i.group && `${i.group.name}（${i.group.members.length + (i.group.userIn === false ? 0 : 1)}）`;
  else title = `${charById(i.a)?.name || '?'} & ${charById(i.b)?.name || '?'}`;
  if (!title) return Router.back();

      const isG = i.type === 'g', isCC = i.type === 'cc';
  const away = isG && i.group.userIn === false; // 你不在这个群里
  const iBlock = i.type === 'dm' && getRel(pid, i.charId).iBlock; // 你拉黑了对方
  // 单聊 / 群聊：我发的消息在对方看来是哪种语言
  const langOpts = (i.type === 'dm' || (isG && !away)) ? Lang.choices(convId, pid) : [];
  let autoLang = S.settings.autoLang?.[convId] || '';
  if (autoLang === true) autoLang = langOpts[0] || ''; // 兼容上一版存的 true
  if (!langOpts.includes(autoLang)) autoLang = '';
  const langBtn = langOpts.length
    ? `<button class="btn ${autoLang ? '' : 'ghost'}" data-act="autolang" aria-pressed="${!!autoLang}" aria-label="我的消息在对方看来的语言">译${autoLang ? '✓' : ''}</button>` : '';
      const offBtn = i.type === 'dm' ? '<button class="btn ghost" data-act="offline" aria-label="查看线下剧情">📍线下</button>' : '';
    const ccDelBtn = isCC ? '<button class="btn ghost" data-act="ccclear" aria-label="删除这段私聊">🗑</button>' : '';
  const right = (langBtn || isG || offBtn || ccDelBtn)
    ? `<span class="flex" style="gap:4px;flex-wrap:nowrap">${offBtn}${langBtn}${ccDelBtn}${isG ? '<button class="btn ghost" data-act="gset" aria-label="群设置">⚙</button>' : ''}</span>` : '';
  const typingText = isCC ? '他们正在聊…' : isG ? '有人正在输入…' : '对方正在输入…';
    const bottom = isCC
    ? `<div class="peekbar"><span>👀 你在偷看，他们不知道</span><button class="btn" data-act="more">让他们继续聊</button></div>`
    : away ? `<div class="peekbar"><span>${i.group.byChar ? '👀 你不在这个群，他们不知道你在看' : '你已退出群聊，只能看不能说'}</span><button class="btn" data-act="gmore">让他们继续聊</button></div>`
    : iBlock ? `<div class="peekbar"><span>🚫 你拉黑了${esc(title)}，TA 的消息你还能看到</span><button class="btn" data-act="unblock">解除拉黑</button></div>`
       : `<div class="inputbar">
        <button class="btn ghost" data-act="media" aria-label="发图片、表情或转账">＋</button>
        ${isG ? '<button class="btn ghost" data-act="at" aria-label="艾特">@</button>' : ''}
        <textarea id="inp" rows="1" placeholder="发消息…" aria-label="输入消息"></textarea>
        <button class="btn ghost" data-act="send">发送</button>
        <button class="btn" data-act="reply" aria-label="让对方回复">回复</button></div>`;

  screen().innerHTML = topbar(title, right) +
    `<div class="cv"><div class="cv-msgs" id="msgs"></div>
          <div class="typing" id="typing" ${Gen.busy.has(convId) ? '' : 'hidden'}>${typingText}</div>
          <div class="quotebar" id="quotebar" hidden><span></span><button class="btn ghost sm" data-act="unquote" aria-label="取消引用">✕</button></div>
     <div class="selbar" id="selbar" hidden><span></span>
       <button class="btn" data-act="fwd">转发</button>
       <button class="btn ghost" data-act="unsel">取消</button></div>${bottom}</div>`;
  ChatUI.convId = convId;
  ChatUI.quoting = null;
  ChatUI.selecting = null;
  await ChatUI.refresh();

  screen().onclick = async e => {
    // 多选模式：点消息就是勾选 / 取消
    if (ChatUI.selecting && !e.target.closest('[data-act]')) {
      const row = e.target.closest('#msgs [data-id]');
      if (row) {
        const id = row.dataset.id;
        ChatUI.selecting.has(id) ? ChatUI.selecting.delete(id) : ChatUI.selecting.add(id);
        row.classList.toggle('sel');
        return ChatUI.syncSel();
      }
    }
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
    const jp = e.target.closest('[data-jump]');
    if (jp) return ChatUI.jump(jp.dataset.jump);
    const bub = e.target.closest('[data-bubble]');
    if (bub) return msgActions(ChatUI.list.find(x => x.id === bub.closest('[data-id]').dataset.id));

    const a = e.target.closest('[data-act]')?.dataset.act;
       if (a === 'unquote') return ChatUI.setQuote(null);
    if (a === 'unsel') { ChatUI.selecting = null; ChatUI.syncSel(); return ChatUI.refresh(); }
    if (a === 'fwd') {
      const to = await Forward.send(convId, ChatUI.selecting || new Set());
      if (!to) return;
      ChatUI.selecting = null;
      toast('已转发，点「回复」让对方看');
      const ti = Conv.parse(to);
      return ti.type === 'g' ? Router.go('group', { gid: ti.gid }) : Router.go('chat', { convId: to });
    }
        if (a === 'ccclear') {
      if (Gen.busy.has(convId)) return toast('他们正在聊，等一下');
      const k = await actionSheet([
        { label: '只删聊天记录', value: 'msg', danger: true },
        { label: '聊天记录和从中总结的记忆一起删', value: 'all', danger: true },
      ]);
      if (!k || !await confirmBox('确定删除（删了找不回来）')) return;
      for (const m of await getMsgs(convId)) await DB.del('msgs', m.id);
      await DB.del('kv', 'memstate_' + convId); // 总结进度一起重置
      if (k === 'all') {
        // 总结时记忆的 source 记的就是会话 ID
        for (const cid of [i.a, i.b]) {
          for (const x of await DB.byIndex('mems', 'charId', cid)) if (x.source === convId) await DB.del('mems', x.id);
        }
        Memory._q = { text: null, vec: null };
      }
      toast('已删除');
      return Router.back();
    }
    if (a === 'media') return Media.pick(convId);
    if (a === 'gset') return Router.go('groupEdit', { gid: i.gid });
       if (a === 'offline') return Offline.panel(convId);
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
    if (a === 'gmore') return Gen.group(i.gid);
        if (a === 'unblock') {
      await setBlock(pid, i.charId, false);
      toast('已解除拉黑');
      return Router.render();
    }
    if (a === 'at') {
      const names = [...i.group.members.map(charById).filter(Boolean).map(c => c.name), '全体成员'];
      const n = await actionSheet(names.map(x => ({ label: '@' + x, value: x })));
      if (n) { const inp = $('#inp'); inp.value += `@${n} `; inp.focus(); }
    }
        if (a === 'send') {
      const inp = $('#inp'), text = inp.value.trim();
      if (!text) return;
      inp.value = '';
            const extra = { ...(autoLang ? { asLang: autoLang } : {}), ...(ChatUI.quoting ? { quote: ChatUI.quoting.id } : {}) };
      ChatUI.setQuote(null);
      await addMsg(convId, 'user', text, 'text', extra);
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
  if (Conv.parse(m.convId).type !== 'cc') items.unshift({ label: '引用', value: 'quote' });
    if (m.trans) items.splice(1, 0, { label: '复制译文', value: 'copytr' });
  // 文字和语音可以改译文，没有译文的可以补一条
  if (['text', 'voice'].includes(m.type)) items.splice(items.findIndex(x => x.value === 'edit') + 1, 0, { label: m.trans ? '编辑译文' : '添加译文', value: 'edittr' });
  if (m.type === 'forward') {
    items.splice(items.findIndex(x => x.value === 'edit'), 1); // 转发卡片不用编辑
    items.unshift({ label: '查看聊天记录', value: 'fwdview' });
  }
  items.push({ label: '多选转发', value: 'select' });
    const ci = Conv.parse(m.convId);
  const lopts = m.sender === 'user' && m.type === 'text' && ['dm', 'g'].includes(ci.type) ? Lang.choices(m.convId, ci.pid) : [];
  if (lopts.length) {
    if (Lang.sentAs(m)) items.splice(1, 0, { label: '这条在对方看来改回原文', value: 'raw' });
    else lopts.forEach(L => items.splice(1, 0, { label: `这条在对方看来是${L}`, value: 'as:' + L }));
  }
   if (m.sender !== 'user' && m.type !== 'offline') items.push({ label: '重新生成这一轮', value: 'regen' });
  items.push({ label: '删除', value: 'del', danger: true });
    if (m.url) items.unshift(...Media.actions(m));
  const a = await actionSheet(items);
  if (await Media.doAction(a, m)) return;
  if (a === 'quote') return ChatUI.setQuote(m);
  if (a === 'copy') { await navigator.clipboard?.writeText(m.content); toast('已复制'); }
    if (a === 'copytr') { await navigator.clipboard?.writeText(m.trans); toast('已复制'); }
  if (a === 'edittr') {
    const t = await editText(m.trans ? '编辑译文（清空 = 删除译文）' : '添加译文', m.trans || '');
    if (t === null) return;
    if (t.trim()) m.trans = t.trim(); else delete m.trans;
    await DB.put('msgs', m);
    ChatUI.refresh();
  }
  if (a === 'fwdview') return Forward.view(m);
  if (a === 'select') {
    ChatUI.selecting = new Set([m.id]);
    ChatUI.setQuote(null);
    await ChatUI.refresh();
    return ChatUI.syncSel();
  }
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
// ===== 转发聊天记录 =====
const Forward = {
  // 让转发消息在列表预览、给 AI 的上下文里都能正常显示。启动时调用一次
  install() {
    if (Media._fwdPatched) return;
    const pv = Media.preview, bd = Media.body;
    Media.preview = function (m, ...r) {
      return m.type === 'forward' ? `[聊天记录] ${m.title || m.content}` : pv.call(this, m, ...r);
    };
    Media.body = function (m, ...r) {
      return m.type === 'forward' ? Forward.text(m) : bd.call(this, m, ...r);
    };
    Media._fwdPatched = true;
  },

  // 给 AI 看的文字
  text(m) {
        const lines = (m.items || []).map(x => `${x.name}：${x.text}${x.as ? `（实际是用${x.as}发的）` : ''}`).join('\n');
    return `[转发的聊天记录：${m.title || '聊天记录'}]\n${lines}\n[聊天记录结束]`;
  },

  // 气泡里的卡片：标题 + 前三条 + 条数
  render(m) {
    const it = m.items || [];
    return `<div class="fwd"><div class="fwd-h">${esc(m.title || '聊天记录')}</div>
      ${it.slice(0, 3).map(x => `<div class="fwd-l">${esc(x.name)}：${esc(String(x.text).slice(0, 30))}</div>`).join('')}
      <div class="fwd-f">共 ${it.length} 条 · 点开查看</div></div>`;
  },

  // 弹窗看全部
  view(m) {
    const { el, mask, close } = modal(`<h3>${esc(m.title || '聊天记录')}</h3>
      <div class="fwd-all">${(m.items || []).map(x => `<div class="fwd-row">
        <small>${esc(x.name)} · ${ChatUI.timeLabel(x.ts)}</small>
        <div>${esc(x.text).replace(/\n/g, '<br>')}</div></div>`).join('')}</div>
      <button class="btn" data-a="close" style="width:100%;margin-top:8px">关闭</button>`);
    mask.onclick = e => { if (e.target === mask) close(); };
    el.onclick = e => { if (e.target.closest('[data-a="close"]')) close(); };
  },

  // 可以转发到：认识且没被你拉黑的角色私聊、你在里面的群
  async pickTarget(pid, from) {
    const opts = [];
    for (const c of S.chars) {
      if (!knows(pid, c.id) || getRel(pid, c.id).iBlock) continue;
      const id = Conv.dm(pid, c.id);
      if (id !== from) opts.push({ label: '👤 ' + c.name, value: id });
    }
    for (const g of S.groups) {
      if (g.personaId !== pid || g.userIn === false) continue;
      const id = Conv.g(g.id);
      if (id !== from) opts.push({ label: '👥 ' + g.name, value: id });
    }
    if (!opts.length) { toast('没有可以转发的对象'); return null; }
    return actionSheet(opts);
  },

  // 把选中的消息打包发出去，返回目标会话 ID
  async send(fromConv, ids) {
    const { pid } = ChatUI.ctx(fromConv);
    const list = (ChatUI.list || []).filter(m => ids.has(m.id));
    if (!list.length) { toast('还没选消息'); return null; }
    const to = await this.pickTarget(pid, fromConv);
    if (!to) return null;
        const items = list.map(x => ({
      name: senderName(x, pid),
      text: preview(x, false, pid) + (x.trans ? ` [译]${x.trans}` : ''),
      ts: x.ts,
      // 你发的消息如果设了"在对方看来是某语言"，转发时一起带上
      as: Lang.sentAs(x) || '',
    }));
    const title = Conv.label(fromConv, pid).replace(/的私聊$/, '') + '的聊天记录';
    await addMsg(to, 'user', title, 'forward', { items, title });
    return to;
  },
};

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
  const inG = g.userIn !== false;
  const me = inG ? GA.role(g, 'user') : 'out', isOwner = me === 'owner', isBoss = me === 'owner' || me === 'admin';
  const who = id => GA.name(g, id);
  const people = ['user', ...g.members];
  const charOwner = GA.owner(g) !== 'user' && charById(GA.owner(g));
  screen().innerHTML = topbar('群设置') + `<div class="body">
    ${inG ? '' : `<div class="card"><p class="empty">${g.byChar ? `这个群是 ${esc(who(GA.owner(g)))} 建的，你不在里面。` : '你已经退出了这个群。'}群主或管理员把你拉进来之后才能说话。</p></div>`}
    <div class="card">
      <div class="row"><span>群主</span><span>${esc(who(GA.owner(g)))}</span></div>
      <div class="row"><span>管理员</span><span>${esc(GA.admins(g).map(who).join('、') || '无')}</span></div>
      <div class="row"><span>成员</span><span>${esc(g.members.map(who).join('、') || '无')}</span></div>
    </div>

    <h3>修正（不发通知，群里的人不知道）</h3>
    <p class="empty">AI 起的名字或头像不对劲时用。</p>
    <div class="card">
      <label class="field"><span>群名</span><input data-g="name" value="${esc(g.name)}"></label>
      <label class="field"><span>群头像链接</span><input data-g="avatar" value="${esc(g.avatar)}" autocapitalize="off"></label>
      ${charOwner ? `<div class="flex" style="gap:6px;flex-wrap:wrap;margin-top:8px">
        <button class="btn ghost" data-act="rename">让 ${esc(charOwner.name)} 重新起群名</button>
        ${S.settings.image.url ? `<button class="btn ghost" data-act="reavatar">让 ${esc(charOwner.name)} 重新生成群头像</button>` : ''}
      </div>` : ''}
    </div>

    ${isOwner ? `<h3>初始设定（你是群主才能改，不发通知）</h3>
    <div class="card">
      <label class="field"><span>群主</span><select id="g-owner">${people.map(id =>
        `<option value="${id}" ${GA.owner(g) === id ? 'selected' : ''}>${esc(who(id))}</option>`).join('')}</select></label>
      ${people.filter(id => id !== GA.owner(g)).map(id => `<label class="row"><span>${esc(who(id))} 是管理员</span>
        <input type="checkbox" data-adm="${id}" ${GA.admins(g).includes(id) ? 'checked' : ''}></label>`).join('')}
    </div>
    <h3>成员（不发通知）</h3><div class="card">${memberChecks(g.members, pid)}</div>` : ''}

    ${isBoss ? `<h3>群管理（会发通知）</h3><div class="card flex" style="gap:6px;flex-wrap:wrap">
      <button class="btn ghost" data-act="gname">改群名</button>
      <button class="btn ghost" data-act="gav">换群头像</button>
      <button class="btn ghost" data-act="invite">拉人进群</button>
      <button class="btn ghost" data-act="kick">踢人</button>
      ${isOwner ? '<button class="btn ghost" data-act="setadm">设 / 撤管理员</button><button class="btn ghost" data-act="transfer">转让群主</button>' : ''}
    </div>` : ''}

    <div class="card flex" style="gap:8px;flex-wrap:wrap">
      ${inG ? '<button class="btn ghost" data-act="leave">退出群聊</button>' : ''}
      ${isOwner ? '<button class="btn danger" data-act="del">解散群聊</button>' : ''}
      ${inG ? '' : '<button class="btn danger" data-act="del">从手机里删掉这个群</button>'}
    </div>
  </div>`;

  const save = () => DB.put('groups', g);
  $$('[data-g]').forEach(el => el.onchange = () => { g[el.dataset.g] = el.value.trim(); save(); });
  $$('[data-mem]').forEach(el => el.onchange = async () => {
    g.members = checkedMembers();
    g.admins = GA.admins(g).filter(x => x === 'user' || g.members.includes(x));
    if (GA.owner(g) !== 'user' && !g.members.includes(g.owner)) g.owner = 'user';
    await save();
    Router.render();
  });
  const os = $('#g-owner');
  if (os) os.onchange = async e => {
    g.owner = e.target.value;
    g.admins = GA.admins(g).filter(x => x !== g.owner);
    await save();
    Router.render();
  };
  $$('[data-adm]').forEach(el => el.onchange = async () => {
    g.admins = $$('[data-adm]').filter(x => x.checked).map(x => x.dataset.adm);
    await save();
  });

  // 群里发了通知后，让大家有反应
  const notify = async t => {
    await addMsg(convId, 'user', t, 'sys');
    Router.render();
    Gen.group(gid);
  };
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
    if (a === 'reavatar') {
      toast('生成中，可能要等十几秒…', 4000);
      if (await GA.autoAvatar(g)) { toast('已换头像'); Router.render(); }
      else toast('生成失败，详情见「记忆体检」');
      return;
    }
    if (a === 'gname') {
      const n = (await editText('新群名', g.name, false))?.trim();
      if (!n) return;
      const t = await GA.apply(convId, 'user', { k: '改群名', arg: n });
      return t ? notify(t) : toast('不能这样操作');
    }
    if (a === 'gav') {
      const u = (await editText('新群头像链接', '', false))?.trim();
      if (!u) return;
      if (!safeUrl(u)) return toast('链接要以 http 开头');
      g.avatar = u;
      await save();
      return notify(`${who('user')} 更换了群头像`);
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
    if (a === 'leave') {
      if (!g.members.length) return toast('群里只剩你了，直接解散吧');
      if (!await confirmBox(`退出「${g.name}」${isOwner ? '（群主会自动转给别人）' : ''}`)) return;
      await GA.leave(g);
      return Router.render();
    }
    if (a !== 'del') return;
    if (!await confirmBox(`${inG ? '解散' : '删掉'}「${g.name}」（聊天记录一起删除）`)) return;
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
    if (actor === 'user' && g.userIn === false) return null;
    const r = this.role(g, actor), boss = r !== 'member', who = this.name(g, actor);
    const t = this.idByName(g, arg), tn = t ? this.name(g, t) : '';
    let text = null;
    switch (k) {
      case '改群名':
        if (!boss) return null;
        g.name = arg.slice(0, 30);
        text = `${who} 修改群名为「${g.name}」`;
        break;
      case '换群头像': {
                if (!boss || !S.settings.image.url) return null;
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
        if (!boss || !t) return null;
        if (t === 'user') {
          // 把你拉回群：你得不在群里，对方认识你，而且没拉黑你
          if (g.userIn !== false || !knows(g.personaId, actor) || getRel(g.personaId, actor).theyBlock) return null;
          g.userIn = true;
        } else {
          if (!this.invitable(g, actor).some(c => c.id === t)) return null;
          g.members.push(t);
        }
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
    const bosses = members.filter(c => this.role(g, c.id) !== 'member');
    if (!bosses.length) return out.join('\n');
    const bn = bosses.map(c => c.name).join('、');
    out.push(`- 下面的群操作只有${bn}能用，每条单独一行，符合性格和剧情时才用。普通成员不能改群名和头像，只能在群里吐槽。`);
    out.push(`- 改群名：名字：[改群名]新群名`);
    if (S.settings.image.url) out.push(`- 换群头像：名字：[换群头像]画面描述`);
    out.push(`- 有人改了群名或头像时（聊天记录里会有系统提示），${bn}可以改回去，也可以顺着气氛接着整活改。没人动的时候很少主动改。`);
    out.push(`- 拉人 / 踢人：名字：[拉人]对方名字 / 名字：[踢人]对方名字。管理员不能踢群主和其他管理员，谁都不能踢${pname}。`);
    const away = g.userIn === false;
    for (const c of bosses) {
      const inv = this.invitable(g, c.id).map(x => x.name);
      if (away && knows(g.personaId, c.id) && !getRel(g.personaId, c.id).theyBlock) inv.unshift(pname);
      if (inv.length) out.push(`  ${c.name}可以拉进群的人：${inv.join('、')}`);
    }
    if (away) out.push(`- ${pname}现在不在群里。群主或管理员可以用 [拉人]${pname} 把${pname}拉进来，要符合剧情。`);
    const oc = members.find(c => c.id === o);
    if (oc) out.push(`- 群主${oc.name}还可以：名字：[设管理]名字 / 名字：[撤管理]名字 / 名字：[转让群主]名字`);
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
  // 让群主按自己的审美重新生成群头像。静默修改，不发通知
  async autoAvatar(g) {
    const o = charById(this.owner(g));
    if (!o || !S.settings.claude.key || !S.settings.image.url) return false;
    const system = `你在扮演${o.name}，要给自己当群主的群「${g.name}」换一个群头像。
【${o.name}的设定】
${o.persona || '（无）'}
【群成员】${g.members.map(id => charById(id)?.name).filter(Boolean).join('、')}
只输出一行：[图片]类型|画面描述。要符合${o.name}的审美和这个群的气氛。`;
    try {
      const out = await API.claude(system, [{ role: 'user', content: '换头像吧。' }], { maxTokens: 200 });
      const line = out.split('\n').map(s => s.trim()).find(l => /^\[图片\]/.test(l)) || out.trim();
      const { style, desc } = Media.parseStyle(line.replace(/^\[图片\]\s*/, ''));
      const url = await Media.genImage(await Media.makePrompt(desc, style, o));
      if (!url) return false;
      g.avatar = url;
      await DB.put('groups', g);
      return true;
    } catch (e) {
      Log.add('群头像生成失败', e.message);
      return false;
    }
  },

  // 你退出群聊。你是群主时自动转给管理员，没有管理员就转给第一个成员
  async leave(g) {
    if (this.owner(g) === 'user') g.owner = this.admins(g).find(id => id !== 'user' && g.members.includes(id)) || g.members[0];
    g.admins = this.admins(g).filter(id => id !== 'user');
    g.userIn = false;
    await DB.put('groups', g);
    await addMsg(Conv.g(g.id), 'user', `${persona(g.personaId).name} 退出了群聊`, 'sys');
  },

  // 角色自己建群（没有你）。每个人设最多 3 个，至少拉两个人
  async charCreate(pid, at = null) {
    if (S.groups.filter(g => g.personaId === pid && g.byChar).length >= 3) return null;
    const knownOf = c => S.chars.filter(o => o.id !== c.id && knows(c.id, o.id));
    const cands = S.chars.filter(c => c.proactive !== false && knownOf(c).length >= 2);
    if (!cands.length) return null;
    const o = pick(cands), known = knownOf(o);
    const mine = S.groups.filter(g => g.personaId === pid && g.members.includes(o.id))
      .map(g => `${g.name}（${g.members.map(id => charById(id)?.name).filter(Boolean).join('、')}）`);
    const system = [
      `你在扮演${o.name}，判断${o.name}此刻会不会建一个手机群聊。`,
      `【${o.name}的设定】\n${o.persona || '（无）'}`,
      `【${o.name}认识的人】\n${known.map(c => `${c.name}（${getRel(o.id, c.id).desc || '认识'}）`).join('\n')}`,
      mine.length && `【${o.name}已经在的群】\n${mine.join('\n')}`,
      `【要求】
- 真人建群需要理由：一起做某件事、组织活动、几个朋友的小圈子、吐槽某人等。没有理由就别建，已经有差不多的群也别建。
- 群名用${o.name}的母语${Lang.of(o)}写，符合性格，不超过 15 个字。
- 只能拉上面认识的人，至少 2 个。不要拉${persona(pid).name}。
- 只输出 JSON：{"name":"群名","members":["名字"],"reason":"建群原因"}。不建就只输出 [不建]`,
    ].filter(Boolean).join('\n\n');
    let out;
    try { out = await API.claude(system, [{ role: 'user', content: `现在是${nowText(at || Date.now())}。` }], { maxTokens: 300 }); }
    catch (e) { Log.add('角色建群失败', e.message); return null; }
    if (/\[不建\]/.test(out)) return null;
    let obj;
    try { obj = Memory.parseJSON(out); } catch (e) { Log.add('角色建群失败', e.message); return null; }
    const names = known.map(c => c.name);
    const ids = [...new Set((obj.members || []).map(n => Prompt.matchName(names, n)).filter(Boolean))]
      .map(n => known.find(c => c.name === n).id);
    if (ids.length < 2) return null;
    const name = String(obj.name || '').trim().slice(0, 30) || '群聊';
    const g = { id: uid(), name, avatar: '', members: [o.id, ...ids], personaId: pid, owner: o.id, admins: [], byChar: true, userIn: false, created: at || Date.now() };
    await DB.put('groups', g);
    S.groups.push(g);
    await addMsg(Conv.g(g.id), o.id, `${o.name} 创建了群聊「${name}」`, 'sys', at ? { ts: at } : {});
    return { g, owner: o, reason: String(obj.reason || '') };
  },
};

// ===== 线下模式：在某个时间点插入一段线下剧情（AI 写或自己写），可以多人在场 =====
const Offline = {
  open(convId) {
    const { pid, charId } = Conv.parse(convId);
    const main = charById(charId);
    if (!main) return;
    const others = S.chars.filter(c => c.id !== main.id);
    const d = new Date();
    const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        const tip = { ai: '剧情方向（可以留空，AI 会参考聊天记录）', me: '发生了什么（可以加手机消息：[消息]14:30 名字：内容，自己发的写 我）' };
    const { el, close } = modal(`<h3>线下 · 和${esc(main.name)}</h3>
      <label class="field"><span>今天几点发生的</span><input type="time" id="off-t" value="${hm}"></label>
      <div class="field"><span>还有谁在场（可多选，不选就是只有你们俩）</span>
        ${others.length ? `<input type="search" id="off-q" placeholder="搜索名字" aria-label="搜索角色">
        <div class="flex" style="gap:6px;margin:6px 0">
          <button class="btn ghost sm" data-s="all">全选结果</button>
          <button class="btn ghost sm" data-s="none">清除</button>
          <small id="off-n" class="grow" style="text-align:right">已选 0 人</small></div>
        <div class="off-list">${others.map(c => `<label class="row" data-name="${esc(c.name.toLowerCase())}">
          <span class="flex" style="gap:6px">${avatar(c.avatar, c.name, 'sm')}${esc(c.name)}${knows(pid, c.id) ? '' : '<small>（和你不认识）</small>'}</span>
          <input type="checkbox" data-pc="${c.id}" aria-label="${esc(c.name)}在场"></label>`).join('')}</div>`
        : '<small>没有其他角色</small>'}
      </div>
      <div class="flex" style="gap:6px;margin:6px 0">
        <button class="btn" data-m="ai" aria-pressed="true">AI 写</button>
        <button class="btn ghost" data-m="me" aria-pressed="false">我自己写</button></div>
      <label class="field"><span id="off-l">${tip.ai}</span>
        <textarea id="off-c" rows="6" placeholder="比如：一起去吃了之前说的那家火锅"></textarea></label>
      <div class="flex" style="justify-content:flex-end;gap:6px;margin-top:10px">
        <button class="btn ghost" data-a="no">取消</button><button class="btn" data-a="ok">确定</button></div>`);

    const rows = $$('[data-name]', el);
    const picked = () => $$('[data-pc]', el).filter(x => x.checked).map(x => x.dataset.pc);
    const sync = () => { const n = $('#off-n', el); if (n) n.textContent = `已选 ${picked().length} 人`; };
    // 搜索只是筛选显示，已勾选的人即使被筛掉也保留
    const q = $('#off-q', el);
    if (q) q.oninput = () => {
      const terms = q.value.toLowerCase().split(/\s+/).filter(Boolean);
      rows.forEach(r => { r.hidden = !terms.every(t => r.dataset.name.includes(t)); });
    };
    el.onchange = e => { if (e.target.matches('[data-pc]')) sync(); };

    let mode = 'ai';
    el.onclick = e => {
      const s = e.target.closest('[data-s]')?.dataset.s;
      if (s === 'all') { rows.filter(r => !r.hidden).forEach(r => { $('[data-pc]', r).checked = true; }); return sync(); }
      if (s === 'none') { $$('[data-pc]', el).forEach(x => { x.checked = false; }); return sync(); }
      const mb = e.target.closest('[data-m]');
      if (mb) {
        mode = mb.dataset.m;
        $$('[data-m]', el).forEach(b => {
          const on = b.dataset.m === mode;
          b.classList.toggle('ghost', !on);
          b.setAttribute('aria-pressed', on);
        });
        $('#off-l', el).textContent = tip[mode];
        return;
      }
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (a === 'no') return close();
      if (a !== 'ok') return;
      const t = $('#off-t', el).value, text = $('#off-c', el).value.trim();
      if (!t) return toast('选一下时间');
      const [h, mi] = t.split(':').map(Number);
      const ts = new Date().setHours(h, mi, 0, 0);
      if (ts > Date.now()) return toast('这个时间还没到');
      if (mode === 'me' && !text) return toast('写一下发生了什么');
      const ids = [main.id, ...picked()];
      close();
      if (mode === 'me') return this.save(convId, 'user', text, ts, 'user', ids);
      this.gen(convId, ids.map(charById).filter(Boolean), ts, text);
    };
  },
 
  // 一次调用给所有在场角色写记忆，记忆来源标上 scene，方便之后一起改、一起删
  async remember(pid, ids, text, ts, scene) {
    const chars = ids.map(charById).filter(Boolean);
    if (!chars.length || !S.settings.claude.key) return;
    const names = chars.map(c => c.name), pname = persona(pid).name;
    const system = `你是记忆整理助手。下面是一段线下见面的经过（在场：${[pname, ...names].join('、')}）。分别从 ${names.join('、')} 各自的视角，提炼值得长期记住的信息。
要求：
1. 每条记忆是一句完整、独立的陈述，写清楚在场的人和发生了什么，不用指代不明的代词。
2. 分级：important（关系变化、约定、重要事件、强烈情绪）；normal（一般细节）。
3. 每人 1 到 4 条，只写这个人亲身经历、看到听到的。
4. 只输出 JSON，键名必须是：${names.join('、')}。格式：{"名字":[{"text":"...","level":"normal"}]}`;
    const out = await API.claude(system, [{ role: 'user', content: `时间：${nowText(ts)}\n\n${text}` }],
      { temperature: 0.3, maxTokens: Math.min(4000, 400 + 400 * chars.length) });
    const obj = Memory.parseJSON(out);
    for (const c of chars) {
      for (const it of (obj[c.name] || [])) {
        if (it?.text) await Memory.add(c.id, pid, it.text, it.level === 'important' ? 'important' : 'normal', 'offline:' + scene);
      }
    }
  },
  // 拆出正文和 [消息]时:分 名字：内容。名字是"我"或你的人设名时算你发的，放进当前私聊
  parseOut(text, ids, pid, ts) {
    const pname = persona(pid).name, chars = ids.map(charById).filter(Boolean), names = chars.map(c => c.name);
    const story = [], msgs = [];
    for (const l of String(text).split('\n')) {
      const m = l.trim().match(/^\[消息\]\s*(\d{1,2})\s*[:：]\s*(\d{2})\s*(.+?)\s*[:：]\s*(.+)$/);
      if (!m) { story.push(l); continue; }
      const who = m[3].trim(), isMe = who === '我' || who === pname;
      const cn = isMe ? null : Prompt.matchName(names, who);
      if (!isMe && !cn) { story.push(l); continue; }
      // 消息时间：剧情那天的这个时刻，不合理就用剧情时间
      let t = new Date(ts).setHours(Number(m[1]), Number(m[2]), 0, 0);
      if (isNaN(t) || t > Date.now()) t = ts;
      const c = cn && chars.find(x => x.name === cn);
      const it = Media.parseItem(m[4]);
      msgs.push({
        conv: Conv.dm(pid, c ? c.id : ids[0]), sender: c ? c.id : 'user', name: c ? c.name : pname,
        type: it.type === 'voice' ? 'voice' : 'text', content: it.type === 'voice' ? it.content : m[4].trim(), ts: t,
      });
    }
    // 同一分钟的几条错开 1 毫秒，保证顺序
    msgs.sort((a, b) => a.ts - b.ts).forEach((x, k) => { x.ts += k; });
    return { story: story.join('\n').replace(/\n{3,}/g, '\n\n').trim(), msgs };
  },

  // 剧情每个在场角色各存一份（scene 相同），手机消息按剧情时间插进私聊（sceneOf 指向剧情）
  async save(convId, sender, raw, ts, by, ids) {
    const pid = Conv.parse(convId).pid, scene = uid(), now = Date.now();
    const { story, msgs } = this.parseOut(raw, ids, pid, ts);
    if (!story && !msgs.length) return toast('没有内容');
    const text = story || '（只有手机消息）';
    const extra = { ts, savedAt: now, by, members: ids, scene, memDone: true };
    for (const id of ids) await addMsg(Conv.dm(pid, id), sender, text, 'offline', extra);
    for (const x of msgs) await addMsg(x.conv, x.sender, x.content, x.type, { ts: x.ts, savedAt: now, sceneOf: scene, memDone: true });
    const memText = text + (msgs.length ? '\n\n【当时的手机消息】\n' + msgs.map(x => `${ChatUI.timeLabel(x.ts)} ${x.name}：${x.content}`).join('\n') : '');
    this.remember(pid, ids, memText, ts, scene).catch(e => Log.add('线下剧情写入记忆失败', e.message));
    toast(msgs.length ? `线下剧情已保存，带了 ${msgs.length} 条消息。点右上角 📍 查看` : '线下剧情已保存，点右上角 📍 查看', 3000);
  },

  gen(convId, chars, ts, hint) {
    if (Gen.busy.has(convId)) return toast('正在生成中');
    toast('正在写线下剧情…', 3000);
    return Gen.run(convId, null, async () => {
      const { system, messages } = await Prompt.buildOffline(chars, convId, ts, hint);
      const text = await API.claude(system, messages, { maxTokens: 1500 + 300 * (chars.length - 1) });
      if (!text) throw new Error('AI 没有写出线下剧情');
      await this.save(convId, chars[0].id, text, ts, 'ai', chars.map(c => c.id));
    });
  },

  // 同一段剧情相关的所有东西：每个人那里的剧情副本 + 剧情里的手机消息
  async related(m) {
    if (!m.scene) return [m];
    const pid = Conv.parse(m.convId).pid, out = [];
    for (const id of m.members || []) {
      out.push(...(await getMsgs(Conv.dm(pid, id))).filter(x => x.scene === m.scene || x.sceneOf === m.scene));
    }
    return out;
  },
  async forget(m) {
    if (!m.scene) return;
    for (const id of m.members || []) {
      for (const x of await DB.byIndex('mems', 'charId', id)) if (x.source === 'offline:' + m.scene) await DB.del('mems', x.id);
    }
  },
  async edit(m) {
    const t = (await editText('编辑线下剧情', m.content))?.trim();
    if (!t) return false;
    for (const x of (await this.related(m)).filter(x => x.type === 'offline')) { x.content = t; await DB.put('msgs', x); }
    await this.forget(m);
    if (m.scene) this.remember(Conv.parse(m.convId).pid, m.members, t, m.ts, m.scene).catch(e => Log.add('线下剧情写入记忆失败', e.message));
    return true;
  },
  async del(m) {
    for (const x of await this.related(m)) await DB.del('msgs', x.id);
    await this.forget(m);
  },

  // 悬浮面板：一条一条缩略显示，点开看全文
  async panel(convId) {
    const ch = charById(Conv.parse(convId).charId);
    if (!ch) return;
    const list = (await getMsgs(convId)).filter(m => m.type === 'offline').reverse();
    const names = m => (m.members || []).map(id => charById(id)?.name).filter(Boolean);
    const { el, mask, close } = modal(`<h3>📍 和${esc(ch.name)}的线下</h3>
      <button class="btn" data-a="new" style="width:100%">＋ 新的线下剧情</button>
      <div class="off-panel">${list.map(m => `<div class="off-item" data-id="${m.id}">
        <button class="off-sum" data-a="open" aria-expanded="false">
          <span class="off-time">${ChatUI.timeLabel(m.ts)}${names(m).length > 1 ? ' · ' + esc(names(m).join('、')) : ''}${m.by === 'user' ? ' · 我写的' : ''}</span>
          <span class="ellipsis">${esc(m.content.replace(/\s+/g, ' ').slice(0, 40))}</span></button>
        <div class="off-full" hidden>${esc(m.content).replace(/\n/g, '<br>')}
          <div class="flex" style="justify-content:flex-end;gap:6px;margin-top:8px">
            <button class="btn ghost sm" data-a="copy">复制</button>
            <button class="btn ghost sm" data-a="edit">编辑</button>
            <button class="btn danger sm" data-a="del">删除</button></div></div>
      </div>`).join('') || '<p class="empty">还没有线下剧情</p>'}</div>
      <button class="btn ghost" data-a="close" style="width:100%;margin-top:8px">关闭</button>`);
    mask.onclick = e => { if (e.target === mask) close(); };
    el.onclick = async e => {
      const btn = e.target.closest('[data-a]'), a = btn?.dataset.a;
      if (!a) return;
      if (a === 'close') return close();
      if (a === 'new') { close(); return this.open(convId); }
      const item = btn.closest('[data-id]'), m = list.find(x => x.id === item?.dataset.id);
      if (!m) return;
      if (a === 'open') {
        const f = $('.off-full', item);
        f.hidden = !f.hidden;
        btn.setAttribute('aria-expanded', String(!f.hidden));
        return;
      }
      if (a === 'copy') { await navigator.clipboard?.writeText(m.content); return toast('已复制'); }
      // 编辑和确认框会占用弹窗，操作完再把面板打开
      if (a === 'edit') { if (await this.edit(m)) toast('已修改'); return this.panel(convId); }
      if (a === 'del') {
        const n = (await this.related(m)).filter(x => x.type !== 'offline').length;
        if (await confirmBox(`删除这段线下剧情${n ? `和其中的 ${n} 条消息` : ''}（相关记忆一起删除）`)) {
          await this.del(m);
          ChatUI.refresh();
          toast('已删除');
        }
        return this.panel(convId);
      }
    };
  },
};

