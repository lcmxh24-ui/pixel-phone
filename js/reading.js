// 一起看书：书架 / 共读房间 / 主动讨论
const Reading = {
  books: [],
  rooms: [],
  _pages: {},

  async init() {
    this.books = (await DB.get('kv', 'books'))?.value || [];
    this.rooms = (await DB.get('kv', 'readRooms'))?.value || [];
    S.settings.reading = { flipChance: 0.5, idle: 120, idleChance: 0.3, ...(S.settings.reading || {}) };
  },
  saveBooks() { return DB.put('kv', { id: 'books', value: this.books }); },
  saveRooms() { return DB.put('kv', { id: 'readRooms', value: this.rooms }); },
  book: id => Reading.books.find(b => b.id === id),
  room: id => Reading.rooms.find(r => r.id === id),

  async pages(bookId) {
    if (!this._pages[bookId]) this._pages[bookId] = (await DB.get('kv', 'bookpages_' + bookId))?.value || [];
    return this._pages[bookId];
  },

  // UTF-8 解码出现大量乱码时改用 GBK
  async readFile(file) {
    const buf = await file.arrayBuffer();
    let t = new TextDecoder('utf-8').decode(buf);
    if ((t.match(/\uFFFD/g) || []).length > t.length / 1000 + 5) t = new TextDecoder('gb18030').decode(buf);
    return t;
  },

  paginate(text, size = 600) {
    const paras = String(text).replace(/\r/g, '').split('\n').map(s => s.trim()).filter(Boolean);
    const pages = [];
    let cur = '';
    for (let p of paras) {
      while (p.length > size) { if (cur) { pages.push(cur); cur = ''; } pages.push(p.slice(0, size)); p = p.slice(size); }
      if (cur.length + p.length > size && cur) { pages.push(cur); cur = ''; }
      cur += (cur ? '\n' : '') + p;
    }
    if (cur) pages.push(cur);
    return pages;
  },

  async addBook(title, text) {
    const pages = this.paginate(text);
    if (!pages.length) throw new Error('内容是空的');
    const b = { id: uid(), title: title || '未命名', pages: pages.length, added: Date.now() };
    await DB.put('kv', { id: 'bookpages_' + b.id, value: pages });
    this._pages[b.id] = pages;
    this.books.push(b);
    await this.saveBooks();
    return b;
  },

  async delBook(id) {
    this.books = this.books.filter(b => b.id !== id);
    await DB.del('kv', 'bookpages_' + id);
    delete this._pages[id];
    await this.saveBooks();
  },

  // 翻页提示：连续翻页只保留一条
  async markFlip(convId, page) {
    const last = await lastMsg(convId), text = `📖 翻到了第 ${page + 1} 页`;
    if (last?.type === 'sys' && last.flip) {
      last.content = text;
      last.ts = Date.now();
      await DB.put('msgs', last);
      ChatUI.refresh();
    } else await addMsg(convId, 'user', text, 'sys', { flip: true });
  },

  async buildPrompt(room, convId, auto) {
    const pid = room.personaId, p = persona(pid);
    const members = room.members.map(charById).filter(Boolean), names = members.map(c => c.name);
    const book = this.book(room.bookId), pages = await this.pages(room.bookId);
    const cur = pages[room.page] || '', prev = room.page > 0 ? (pages[room.page - 1] || '').slice(-300) : '';
    const all = await getMsgs(convId), hist = Prompt.window(all);
    const query = [cur.slice(0, 200), ...hist.slice(-6).map(m => m.content)].join('\n');
    const mem = [];
    for (const c of members) { const t = await Memory.retrieveText(c.id, pid, query, c.name); if (t) mem.push(t); }
    const wb = WB.build(room.members, WB.scan(all) + '\n' + cur);

    const spoil = room.spoiler
      ? `${names.join('、')}之前看过这本书，知道后面的剧情，偶尔会忍不住暗示或剧透，但会顾及${p.name}的感受。`
      : '大家都是第一次看，只知道看到当前页为止的内容，不知道后面会发生什么，可以猜测。';
    const rules = `【输出格式】（必须遵守）
- 每行一条消息，格式：名字：内容。名字只能是：${names.join('、')}。绝对不要替${p.name}发言。
- 像一起看书的朋友在手机上聊天：吐槽剧情、猜后面、心疼或讨厌书里的人物、联系自己的经历、互相接话、问${p.name}的看法。保持各自的性格和阅读口味，可以有分歧。
- ${spoil}
- 多数是短句，偶尔有长一点的感想。不是每个人都要说话。一共 1 到 6 条。
- 发语音：名字：[语音]语音里说的话
${Media.rules(true, p.name)}
${Lang.groupRule(members, p)}
- @某人：在内容里写 @名字
- 如果看书或聊天让某个成员想私下找人聊，另起一行写：[私聊]成员名→对方名字：原因。偶尔使用。
- 不写旁白、动作和心理描写。`;
    const st = [
      `这是手机上的"一起看书"房间。${p.name}和${names.join('、')}在同步阅读《${book?.title || '?'}》，边看边在房间里聊天。`,
      `【成员设定】\n${members.map(c => `· ${c.name}：${c.persona || '（无）'}`).join('\n\n')}`,
      p.persona && `【${p.name}的设定】\n${p.persona}`,
      `【人际关系】\n${Prompt.relationsText(members, pid)}`,
      wb.constant && `【世界设定】\n${wb.constant}`,
      rules,
    ];
    const dy = [
      await Geo.placeText(members, pid),
      mem.join('\n\n'),
      wb.triggered && `【相关设定】\n${wb.triggered}`,
      `现在是${nowText()}。${Weather.text()}`,
      `【大家正在看】第 ${room.page + 1}/${pages.length} 页\n${prev ? '（上一页结尾）…' + prev + '\n\n' : ''}${cur}`,
    ];
    const system = Prompt.sysBlocks(st, dy);

    let i = hist.length;
    while (i > 0 && hist[i - 1].sender === 'user') i--;
    const batch = hist.slice(i);
    const ats = names.filter(n => batch.some(m => m.content.includes('@' + n)));
    let tail = auto
      ? `（${p.name}正在安静地看第 ${room.page + 1} 页，没有说话。成员可以自然地聊聊这页的内容、互相讨论，或者问问${p.name}看到哪了。没人想说话就只输出 [无]）`
      : `（接着${p.name}的话聊）`;
    if (!auto && ats.length) tail = `（${p.name}@了${ats.join('、')}，被@的人要回应。）`;

    const lines = hist.map(m => Prompt.line(m, pid));
    const cut = S.settings.cache?.enabled ? Math.floor(lines.length / 10) * 10 : 0;
    const head = lines.slice(0, cut).join('\n'), rest = lines.slice(cut).join('\n');
    const content = [];
    if (head) content.push({ type: 'text', text: '【房间聊天记录】\n' + head, cache_control: { type: 'ephemeral' } });
    content.push({ type: 'text', text: [(head ? rest : '【房间聊天记录】\n' + (rest || '（还没人说话）')), tail].filter(Boolean).join('\n\n') });
    return { system, messages: [{ role: 'user', content }] };
  },

  // 一直没人说话时，隔一段时间可能有人开口
  startAuto(rid) {
    clearInterval(this._iv);
    this._iv = setInterval(async () => {
      const c = Router.cur();
      if (c?.name !== 'readRoom' || c.params.rid !== rid) return clearInterval(this._iv);
      const cfg = S.settings.reading, convId = Conv.r(rid);
      if (document.hidden || !S.settings.claude.key || Gen.busy.has(convId)) return;
      const last = await lastMsg(convId);
      if (last && Date.now() - last.ts < Number(cfg.idle) * 1000) return;
      if (Math.random() < Number(cfg.idleChance)) Gen.read(rid, { auto: true });
    }, 20e3);
  },

  onFlip(rid) {
    clearTimeout(this._ft);
    if (!S.settings.claude.key || Math.random() >= Number(S.settings.reading.flipChance)) return;
    const page = this.room(rid).page;
    this._ft = setTimeout(() => {
      const c = Router.cur();
      if (c?.name === 'readRoom' && c.params.rid === rid && this.room(rid)?.page === page) Gen.read(rid, { auto: true });
    }, 8e3 + Math.random() * 12e3);
  },
};

Gen.read = function (rid, { auto = false } = {}) {
  const convId = Conv.r(rid);
  return this.run(convId, null, async () => {
    const room = Reading.room(rid);
    const members = (room?.members || []).map(charById).filter(Boolean);
    if (!members.length) throw new Error('房间里还没有角色');
    const { system, messages } = await Reading.buildPrompt(room, convId, auto);
    const r = Prompt.parseLines(await API.claude(system, messages, { maxTokens: 1200 }), members.map(c => c.name));
    const byName = n => members.find(c => c.name === n);
    await this.post(convId, r.msgs.map(m => ({ sender: byName(m.name).id, type: m.type, content: m.content })));
    for (const it of r.intents) {
      const f = byName(it.from);
      if (f) await Social.queueIntent(room.personaId, f.id, it.to, it.reason);
    }
    return r;
  });
};

CHAT_VIEWS.push('readRoom');

// ===== 书架 + 房间列表 =====
Views.books = async () => {
  const pid = activePid();
  const rooms = Reading.rooms.filter(r => r.personaId === pid);
  const rows = [];
  for (const r of rooms) rows.push({ r, b: Reading.book(r.bookId), last: await lastMsg(Conv.r(r.id)) });
  rows.sort((x, y) => (y.last?.ts || 0) - (x.last?.ts || 0));
  screen().innerHTML = topbar('共读') + `<div class="body">
    <h3>共读房间（${esc(persona(pid).name)}）</h3>
    <div class="list">${rows.map(({ r, b, last }) => `<button class="item" data-room="${r.id}">
      <div class="pair">${r.members.slice(0, 3).map(id => { const c = charById(id); return c ? avatar(c.avatar, c.name, 'sm') : ''; }).join('')}</div>
      <div class="grow"><b>《${esc(b?.title || '已删除的书')}》</b>
      <small class="ellipsis">第 ${r.page + 1}/${b?.pages || '?'} 页 · ${esc(r.members.map(id => charById(id)?.name).filter(Boolean).join('、'))}</small>
      <small class="ellipsis">${last ? esc(preview(last, true, pid)) : '（还没有聊天）'}</small></div></button>`).join('')
      || '<p class="empty">还没有房间。在下面的书架点一本书开始共读。</p>'}</div>
    <h3>书架（所有人设共用）</h3>
    <div class="card flex" style="gap:6px;flex-wrap:wrap">
      <button class="btn" data-act="file">导入 txt</button><button class="btn ghost" data-act="paste">粘贴文字</button>
      <input type="file" accept=".txt,text/plain" id="bk-f" hidden></div>
    <div class="list">${Reading.books.map(b => `<button class="item" data-book="${b.id}"><div class="icon">📕</div>
      <div class="grow"><b>${esc(b.title)}</b><small>${b.pages} 页</small></div></button>`).join('') || '<p class="empty">书架是空的</p>'}</div>
    <h3>主动讨论</h3><div class="card">
      ${field('翻页后有人发言的概率（0~1）', 'reading.flipChance', { type: 'number', step: '0.05' })}
      ${field('多久没人说话算冷场（秒）', 'reading.idle', { type: 'number' })}
      ${field('冷场时有人开口的概率（每 20 秒，0~1）', 'reading.idleChance', { type: 'number', step: '0.05' })}
    </div>
  </div>`;
  bindFields(screen());
  $('#bk-f').onchange = async e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      toast('导入中…');
      const b = await Reading.addBook(f.name.replace(/\.txt$/i, ''), await Reading.readFile(f));
      toast(`导入成功，共 ${b.pages} 页`);
      Router.render();
    } catch (err) { toast('导入失败：' + err.message); }
  };
  screen().onclick = async e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'file') return $('#bk-f').click();
    if (a === 'paste') {
      const title = (await editText('书名', '', false))?.trim();
      if (title == null) return;
      const text = await editText('粘贴正文');
      if (!text?.trim()) return;
      try { await Reading.addBook(title, text); Router.render(); } catch (err) { toast(err.message); }
      return;
    }
    const room = e.target.closest('[data-room]');
    if (room) return Router.go('readRoom', { rid: room.dataset.room });
    const bk = e.target.closest('[data-book]');
    if (!bk) return;
    const b = Reading.book(bk.dataset.book);
    const act = await actionSheet([{ label: '开一个共读房间', value: 'room' }, { label: '删除这本书', value: 'del', danger: true }]);
    if (act === 'room') Router.go('roomEdit', { bookId: b.id });
    if (act === 'del' && await confirmBox(`删除《${b.title}》（相关房间会失效）`)) { await Reading.delBook(b.id); Router.render(); }
  };
};

// ===== 新建 / 编辑房间 =====
Views.roomEdit = async ({ rid, bookId }) => {
  const room = rid ? Reading.room(rid) : null;
  const pid = room?.personaId || activePid();
  const b = Reading.book(room?.bookId || bookId);
  if (!b) return Router.back();
  const cs = S.chars.filter(c => knows(pid, c.id));
  screen().innerHTML = topbar(room ? '房间设置' : '新建共读') + `<div class="body">
    <div class="card"><b>《${esc(b.title)}》</b> · ${b.pages} 页</div>
    <h3>一起看的人</h3><div class="card">${cs.map(c => `<label class="row"><span class="flex" style="gap:6px">${avatar(c.avatar, c.name, 'sm')}${esc(c.name)}</span>
      <input type="checkbox" data-mem="${c.id}" ${room?.members.includes(c.id) ? 'checked' : ''}></label>`).join('') || '<p class="empty">当前人设还没有认识的角色</p>'}</div>
    <div class="card"><label class="row"><span>角色之前看过这本书（可能剧透）</span><input type="checkbox" id="rm-sp" ${room?.spoiler ? 'checked' : ''}></label></div>
    <button class="btn" data-act="save">${room ? '保存' : '开始共读'}</button>
    ${room ? '<button class="btn danger" data-act="del" style="margin-top:8px">删除房间（聊天记录一起删除）</button>' : ''}
  </div>`;
  screen().onclick = async e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'save') {
      const members = $$('[data-mem]').filter(x => x.checked).map(x => x.dataset.mem);
      if (!members.length) return toast('至少选一个人');
      const spoiler = $('#rm-sp').checked;
      if (room) { Object.assign(room, { members, spoiler }); await Reading.saveRooms(); return Router.back(); }
      const r = { id: uid(), bookId: b.id, personaId: pid, members, spoiler, page: 0, created: Date.now() };
      Reading.rooms.push(r);
      await Reading.saveRooms();
      return Router.replace('readRoom', { rid: r.id });
    }
    if (a === 'del' && await confirmBox('删除这个共读房间')) {
      for (const m of await getMsgs(Conv.r(room.id))) await DB.del('msgs', m.id);
      Reading.rooms = Reading.rooms.filter(x => x.id !== room.id);
      await Reading.saveRooms();
      Router.home();
      Router.go('books');
    }
  };
};

// ===== 共读房间 =====
Views.readRoom = async ({ rid }) => {
  const room = Reading.room(rid), b = room && Reading.book(room.bookId);
  if (!b) return Router.back();
  const pages = await Reading.pages(b.id), convId = Conv.r(rid);
  screen().innerHTML = topbar(`《${b.title}》`, '<button class="btn ghost" data-act="set" aria-label="房间设置">⚙</button>') + `<div class="cv">
    <div class="rd-page" id="pg" tabindex="0" aria-label="书页内容"></div>
    <div class="rd-nav">
      <button class="btn ghost" data-act="prev" aria-label="上一页">◀</button>
      <button class="btn ghost" data-act="jump" id="pn" aria-label="跳转页码"></button>
      <button class="btn ghost" data-act="fold" aria-label="收起或展开书页">⇕</button>
      <button class="btn ghost" data-act="next" aria-label="下一页">▶</button></div>
    <div class="cv-msgs" id="msgs"></div>
    <div class="typing" id="typing" ${Gen.busy.has(convId) ? '' : 'hidden'}>有人正在输入…</div>
    <div class="inputbar">
      <button class="btn ghost" data-act="media" aria-label="发图片或表情">＋</button>
      <button class="btn ghost" data-act="at" aria-label="艾特">@</button>
      <textarea id="inp" rows="1" placeholder="聊聊这一页…" aria-label="输入消息"></textarea>
      <button class="btn ghost" data-act="send">发送</button>
      <button class="btn" data-act="reply">回复</button></div></div>`;
  const draw = () => {
    $('#pg').textContent = pages[room.page] || '（这一页是空的）';
    $('#pg').scrollTop = 0;
    $('#pn').textContent = `${room.page + 1} / ${pages.length}`;
  };
  const flip = async to => {
    to = Math.max(0, Math.min(pages.length - 1, to));
    if (to === room.page) return;
    room.page = to;
    await Reading.saveRooms();
    draw();
    await Reading.markFlip(convId, to);
    Reading.onFlip(rid);
  };
  draw();
  ChatUI.convId = convId;
  await ChatUI.refresh();
  Reading.startAuto(rid);

  screen().onclick = async e => {
    const ign = e.target.closest('[data-ign]');
    if (ign) return ign.classList.toggle('open');
    const v = e.target.closest('[data-voice]');
    if (v) {
      v.nextElementSibling.classList.toggle('open');
      const m = ChatUI.list.find(x => x.id === v.dataset.voice);
      try { await API.speak(m.content); } catch (err) { toast(err.message); }
      return;
    }
    const bub = e.target.closest('[data-bubble]');
    if (bub) return msgActions(ChatUI.list.find(x => x.id === bub.closest('[data-id]').dataset.id));

    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'set') return Router.go('roomEdit', { rid });
    if (a === 'prev') return flip(room.page - 1);
    if (a === 'next') return flip(room.page + 1);
    if (a === 'fold') return $('#pg').classList.toggle('folded');
    if (a === 'jump') {
      const n = parseInt(await editText(`跳到第几页（1~${pages.length}）`, String(room.page + 1), false), 10);
      if (n) flip(n - 1);
    }
    if (a === 'media') return Media.pick(convId);
    if (a === 'at') {
      const names = room.members.map(charById).filter(Boolean).map(c => c.name);
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
      if (Gen.busy.has(convId)) return toast('有人正在输入…');
      Gen.read(rid);
    }
  };
};
