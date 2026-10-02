// 主动行为：定时主动发消息、离线补发、"想私聊某人"队列、偷看
const Social = {
  _running: false,

  async kv(k, d) { return (await DB.get('kv', k))?.value ?? d; },
  setKv(k, v) { return DB.put('kv', { id: k, value: v }); },

  start() {
    this.tick();
    setInterval(() => this.tick(), 15e3);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.setKv('lastActive', Date.now());
      else this.tick();
    });
  },

  async tick() {
    if (this._running) return;
    this._running = true;
    try {
      const now = Date.now(), last = await this.kv('lastActive', now);
      // 超过 2 分钟没心跳，说明网页被关了或在后台，先补发
      if (now - last > 120e3) await this.catchup(last, now);
      await this.setKv('lastActive', Date.now());
      await this.runIntents();

      const p = S.settings.proactive;
      if (!p.enabled || !S.settings.claude.key) return;
      const lp = await this.kv('lastProactive', 0);
      if (Date.now() - lp < Math.max(1, Number(p.interval)) * 60e3) return;
      await this.setKv('lastProactive', Date.now());
      if (Math.random() < Number(p.chance)) await this.act();
       } catch (e) {
      Log.add('主动消息出错', e.message);
    } finally {
      this._running = false;
    }
  },

  async catchup(last, now) {
    const p = S.settings.proactive;
    if (!p.enabled || !S.settings.claude.key) return;
    const gap = now - last, iv = Math.max(1, Number(p.interval)) * 60e3;
    const n = Math.min(Number(p.catchup) || 0, Math.floor(gap / iv));
    for (let k = 0; k < n; k++) {
      if (Math.random() >= Number(p.chance)) continue;
      await this.act(Math.round(last + gap * (k + Math.random() * 0.8) / n));
    }
    await this.setKv('lastProactive', now);
  },

  knownPairs() {
    const out = [];
    for (let i = 0; i < S.chars.length; i++) for (let j = i + 1; j < S.chars.length; j++) {
      if (knows(S.chars[i].id, S.chars[j].id)) out.push([S.chars[i], S.chars[j]]);
    }
    return out;
  },

    // 随机一次主动行为：朋友圈 / 角色建群 / 群里说话 / 角色互聊 / 角色找你。只针对当前人设
  async act(at = null) {
    const pid = activePid(), p = S.settings.proactive;
    const ref = at || Date.now();
    // 角色编辑页里关掉「会主动」的不参与。没设置过的默认开启
    const active = c => c.proactive !== false;
    const posters = S.chars.filter(c => knows(pid, c.id) && active(c));
    if (posters.length && Math.random() < Number(p.momentRate ?? 0.2)) return Moments.post(pick(posters).id, pid, at);

    // 角色自己建群，没有你
    if (Math.random() < Number(p.groupCreateRate ?? 0.05)) {
      const made = await GroupAdmin.charCreate(pid, at);
      if (made) return Gen.group(made.g.id, { at, hint: `（${made.owner.name}刚建了这个群${made.reason ? '，原因：' + made.reason : ''}。由${made.owner.name}先开口，其他人自然接话。2 到 6 条。）` });
    }

    // 群里主动说话（包括你退出的、你不在的群）。10 分钟内有人说过话的不算
    const groups = [];
    for (const g of S.groups) {
      if (g.personaId !== pid) continue;
      const starters = g.members.map(charById).filter(c => c && active(c));
      if (!starters.length) continue;
      const last = await lastMsg(Conv.g(g.id));
      if (!last || ref - last.ts > 10 * 60e3) groups.push({ g, starters });
    }
    if (groups.length && Math.random() < Number(p.groupRate ?? 0.25)) {
      const { g, starters } = pick(groups);
      return Gen.group(g.id, { at, hint: Prompt.groupProactiveHint(starters.map(c => c.name), g.userIn === false) });
    }

    const dms = [];
    for (const c of S.chars) {
      // 拉黑了你的角色不会主动找你
      if (!knows(pid, c.id) || !active(c) || getRel(pid, c.id).theyBlock) continue;
      const last = await lastMsg(Conv.dm(pid, c.id));
      // 10 分钟内聊过的不主动找
      if (!last || ref - last.ts > 10 * 60e3) dms.push(c);
    }
    // 两个人里至少有一个会主动，才可能聊起来；由会主动的那个发起
    const pairs = this.knownPairs().filter(([a, b]) => active(a) || active(b));
    if (pairs.length && (Math.random() < Number(p.ccRate) || !dms.length)) {
      const [a, b] = pick(pairs);
      const from = active(a) && active(b) ? null : active(a) ? a.id : b.id;
      return Gen.cc(Conv.cc(pid, a.id, b.id), { at, from });
    }
    if (dms.length) {
      const c = pick(dms);
      return Gen.dm(Conv.dm(pid, c.id), { hint: Prompt.proactiveHint(), at, proactive: true });
    }
  },

  // 聊天里冒出的"想私聊某人"：先检查认不认识，20 秒到 2 分钟后执行
  async queueIntent(pid, fromId, toName, reason) {
    if (!S.settings.proactive.intents) return;
    toName = String(toName).trim();
    let it = null;
    if (toName === persona(pid).name) {
    if (knows(pid, fromId) && !getRel(pid, fromId).theyBlock) it = { kind: 'dm' };
    } else {
      const t = S.chars.find(c => c.name === toName);
      if (t && knows(fromId, t.id)) it = { kind: 'cc', to: t.id };
    }
    if (!it) return;
    const list = await this.kv('intents', []);
    list.push({ id: uid(), pid, from: fromId, reason, due: Date.now() + 20e3 + Math.random() * 100e3, ...it });
    await this.setKv('intents', list);
  },

  async runIntents() {
    const list = await this.kv('intents', []), now = Date.now();
    const due = list.filter(x => x.due <= now);
    if (!due.length) return;
    await this.setKv('intents', list.filter(x => x.due > now));
    for (const x of due) {
    if (!S.settings.personas.some(p => p.id === x.pid) || !charById(x.from) || charById(x.from).proactive === false) continue;
      // 网页关着时到期的，按到期时间补发
      const at = now - x.due > 120e3 ? x.due : null;
      if (x.kind === 'dm') await Gen.dm(Conv.dm(x.pid, x.from), { hint: Prompt.proactiveHint(x.reason), at, proactive: true });
      else if (charById(x.to)) await Gen.cc(Conv.cc(x.pid, x.from, x.to), { reason: x.reason, from: x.from, at });
    }
  },
};

// ===== 偷看：角色之间的私聊 + 角色自己建的群 =====
Views.peek = async () => {
  const pid = activePid(), rows = [];
  for (let i = 0; i < S.chars.length; i++) for (let j = i + 1; j < S.chars.length; j++) {
    const a = S.chars[i], b = S.chars[j], id = Conv.cc(pid, a.id, b.id);
    const last = await lastMsg(id);
    if (last) rows.push({ id, a, b, last });
  }
  rows.sort((x, y) => y.last.ts - x.last.ts);
  // 角色建的、你不在里面的群
  const gRows = [];
  for (const g of S.groups) {
    if (g.personaId !== pid || !g.byChar || g.userIn !== false) continue;
    gRows.push({ g, last: await lastMsg(Conv.g(g.id)) });
  }
  gRows.sort((x, y) => (y.last?.ts || 0) - (x.last?.ts || 0));
  screen().innerHTML = topbar('偷看', '<button class="btn ghost" data-act="new" aria-label="让两个角色聊天">＋</button>') +
    `<div class="body list">
    ${gRows.length ? '<h3>他们的群</h3>' + gRows.map(r => `<button class="item" data-gid="${esc(r.g.id)}">
      ${avatar(r.g.avatar, r.g.name)}
      <div class="grow"><div class="flex" style="justify-content:space-between"><b>${esc(r.g.name)}（${r.g.members.length}）</b>
      <small>${r.last ? ChatUI.timeLabel(r.last.ts) : ''}</small></div>
      <small class="ellipsis">${r.last ? esc(preview(r.last, true, pid)) : '（还没有消息）'}</small></div></button>`).join('') : ''}
    ${gRows.length && rows.length ? '<h3>私聊</h3>' : ''}
    ${rows.length ? rows.map(r => `<button class="item" data-id="${esc(r.id)}">
      <div class="pair">${avatar(r.a.avatar, r.a.name, 'sm')}${avatar(r.b.avatar, r.b.name, 'sm')}</div>
      <div class="grow"><div class="flex" style="justify-content:space-between"><b>${esc(r.a.name)} & ${esc(r.b.name)}</b>
      <small>${ChatUI.timeLabel(r.last.ts)}</small></div>
      <small class="ellipsis">${esc(preview(r.last, true, pid))}</small></div></button>`).join('')
      : gRows.length ? '' : '<p class="empty">角色之间还没私聊过。点右上角 ＋ 让两个认识的角色聊聊。</p>'}</div>`;
  screen().onclick = async e => {
    if (e.target.closest('[data-act="new"]')) {
      const pairs = Social.knownPairs();
      if (!pairs.length) return toast('还没有互相认识的角色，去「关系网」设置');
      const pr = await actionSheet(pairs.map(([a, b]) => ({ label: `${a.name} & ${b.name}`, value: [a.id, b.id] })));
      if (!pr) return;
      const id = Conv.cc(pid, pr[0], pr[1]);
      Router.go('peekView', { convId: id });
      Gen.cc(id);
      return;
    }
    const gi = e.target.closest('[data-gid]');
    if (gi) return Router.go('group', { gid: gi.dataset.gid });
    const it = e.target.closest('[data-id]');
    if (it) Router.go('peekView', { convId: it.dataset.id });
  };
};