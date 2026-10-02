// 钱包与转账 / 朋友圈 / 天气
// ===================== 钱包 =====================
const Wallet = {
  fmt: n => '¥' + Number(n).toFixed(2),
  ST: { pending: '待收款', accepted: '已收款', returned: '已退还' },

  async txns() { return (await DB.get('kv', 'txns'))?.value || []; },

  // amount 为正是入账，为负是出账
  async log(amount, title) {
    const w = S.settings.wallet;
    w.balance = Math.round((Number(w.balance) + amount) * 100) / 100;
    await saveSettings();
    const list = await this.txns();
    list.unshift({ id: uid(), amount, title, ts: Date.now() });
    await DB.put('kv', { id: 'txns', value: list.slice(0, 500) });
  },

  // 给 AI 看的文字
  text(m, pid) {
    const to = m.to === 'user' ? persona(pid).name : charById(m.to)?.name || '?';
    return `[转账#${m.id.slice(-4)}：${senderName(m, pid)}转给${to} ${this.fmt(m.amount)}${m.note ? '，备注：' + m.note : ''}，${this.ST[m.status]}]`;
  },

  render(m, pid) {
    const to = m.to === 'user' ? persona(pid).name : charById(m.to)?.name || '?';
    const st = m.status === 'pending' ? (m.to === 'user' ? '点击收款' : `等待${to}收款`) : this.ST[m.status];
    return `<div class="tf ${m.status}"><div class="tf-amt">💸 ${this.fmt(m.amount)}</div>
      <div class="tf-note">${esc(m.note || '转账')}</div><div class="tf-st">${esc(st)}</div></div>`;
  },

  rules(p, to, canAccept) {
    const r = [`- 转账：单独一行 ${p}[转账]金额 备注，转给${to}。很少用，只在剧情需要时（请客、还钱、表达心意）。`];
    if (canAccept) r.push(`- 有人转账给你、状态是待收款时，决定收不收：单独一行 ${p}[收款] 或 ${p}[退还]。`);
    return r.join('\n');
  },

  // 用户发起转账
  async send(convId) {
    const { i } = ChatUI.ctx(convId);
    let to = i.charId;
       if (i.type === 'g' || i.type === 'r') {
      const ms = Conv.members(convId);
      to = await actionSheet(ms.map(c => ({ label: '转给 ' + c.name, value: c.id })));
    }
    if (!to || !charById(to)) return;
    const v = await new Promise(res => {
      const { el, close } = modal(`<h3>转账给 ${esc(charById(to).name)}</h3>
        <label class="field"><span>金额（余额 ${this.fmt(S.settings.wallet.balance)}）</span>
          <input id="ta" type="number" inputmode="decimal" step="0.01" min="0.01"></label>
        <label class="field"><span>备注（可不填）</span><input id="tn" maxlength="30"></label>
        <div class="flex" style="justify-content:flex-end;gap:6px;margin-top:10px">
          <button class="btn ghost" data-a="no">取消</button><button class="btn" data-a="ok">转账</button></div>`);
      el.onclick = e => {
        const a = e.target.dataset.a;
        if (a === 'no') { close(); res(null); }
        if (a === 'ok') {
          const amount = Math.round(Number($('#ta', el).value) * 100) / 100;
          if (!(amount > 0)) return toast('金额不对');
          if (amount > Number(S.settings.wallet.balance)) return toast('余额不足');
          close();
          res({ amount, note: $('#tn', el).value.trim() });
        }
      };
    });
    if (!v) return;
    await this.log(-v.amount, `转账给 ${charById(to).name}`);
    await addMsg(convId, 'user', v.note || '转账', 'transfer', { ...v, to, status: 'pending' });
  },

  // 点击转账卡片。返回 true 表示已处理，不再弹出普通菜单
  async tap(m) {
    if (m.type !== 'transfer' || m.status !== 'pending') return false;
    if (m.to !== 'user') { toast('等待对方收款'); return true; }
    const a = await actionSheet([{ label: '收款 ' + this.fmt(m.amount), value: 'ok' }, { label: '退还', value: 'back' }]);
    if (!a) return true;
    const name = charById(m.sender)?.name || '?';
    m.status = a === 'ok' ? 'accepted' : 'returned';
    if (a === 'ok') await this.log(m.amount, `收到 ${name} 的转账`);
    await DB.put('msgs', m);
    const pid = ChatUI.ctx(m.convId).pid;
    await addMsg(m.convId, 'user', `${persona(pid).name} ${a === 'ok' ? '收下了' : '退还了'} ${name} 的转账`, 'sys');
    return true;
  },

  // 处理 AI 输出的 [转账] [收款] [退还]
  async prepare(it, convId) {
    const i = Conv.parse(convId);
    const pid = i.type === 'g' ? i.group?.personaId : i.pid;
    if (it.type === 'transfer') {
      const num = it.content.match(/\d+(\.\d+)?/);
      const amount = num ? Math.round(parseFloat(num[0]) * 100) / 100 : 0;
      if (!(amount > 0)) return null;
      const note = it.content.slice(num.index + num[0].length).replace(/^\s*(元|块)?\s*/, '').trim();
      const extra = { amount, note, to: 'user', status: 'pending' };
      if (i.type === 'cc') Object.assign(extra, { to: it.sender === i.a ? i.b : i.a, status: 'accepted' });
      return { sender: it.sender, type: 'transfer', content: note || '转账', extra };
    }
    // 收款 / 退还：找最近一笔转给这个角色、还没处理的
    const code = it.content.replace(/[#＃\s]/g, '').slice(0, 4);
    const list = (await getMsgs(convId)).reverse();
    const ok = x => x.type === 'transfer' && x.status === 'pending' && x.to === it.sender;
    const t = (code && list.find(x => ok(x) && x.id.endsWith(code))) || list.find(ok);
    if (!t) return null;
    t.status = it.type === 'accept' ? 'accepted' : 'returned';
    await DB.put('msgs', t);
    const name = charById(it.sender)?.name || '?';
    if (t.status === 'returned') await this.log(t.amount, `${name} 退还了转账`);
    return { sender: it.sender, type: 'sys', content: `${name} ${t.status === 'accepted' ? '收下了' : '退还了'} ${persona(pid).name} 的转账 ${this.fmt(t.amount)}` };
  },
};

Views.wallet = async () => {
  const list = await Wallet.txns();
  screen().innerHTML = topbar('钱包') + `<div class="body">
    <div class="card" style="text-align:center"><small>余额（所有人设共用）</small>
      <div class="balance">${Wallet.fmt(S.settings.wallet.balance)}</div>
      <div class="flex" style="justify-content:center;gap:6px">
        <button class="btn" data-act="in">充值</button><button class="btn ghost" data-act="out">提现</button></div></div>
    <h3>账单</h3>
    ${list.length ? `<div class="card">${list.map(t => `<div class="row"><span>${esc(t.title)}<br>
      <small>${new Date(t.ts).toLocaleString('zh-CN')}</small></span>
      <b>${t.amount > 0 ? '+' : ''}${t.amount.toFixed(2)}</b></div>`).join('')}</div>` : '<p class="empty">还没有账单</p>'}
  </div>`;
  screen().onclick = async e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a !== 'in' && a !== 'out') return;
    const n = Math.round(Number(await editText(a === 'in' ? '充值金额' : '提现金额', '', false)) * 100) / 100;
    if (!(n > 0)) return;
    if (a === 'out' && n > Number(S.settings.wallet.balance)) return toast('余额不足');
    await Wallet.log(a === 'in' ? n : -n, a === 'in' ? '充值' : '提现');
    Router.render();
  };
};

// ===================== 朋友圈 =====================
const Moments = {
  key: pid => 'moments_' + pid,
  async list(pid) { return (await DB.get('kv', this.key(pid)))?.value || []; },
  async save(pid, l) {
    await DB.put('kv', { id: this.key(pid), value: l.slice(0, 300) });
    document.dispatchEvent(new CustomEvent('pp:moment'));
  },
  async update(pid, postId, fn) {
    const l = await this.list(pid), p = l.find(x => x.id === postId);
    if (!p) return null;
    fn(p);
    await this.save(pid, l);
    return p;
  },
  name(id, pid) { return id === 'user' ? persona(pid).name : charById(id)?.name || '?'; },
  // 认识作者才能看到这条动态
  canSee(viewer, author, pid) {
    const v = viewer === 'user' ? pid : viewer, a = author === 'user' ? pid : author;
    return v === a || knows(v, a);
  },

  // 角色聊天时能看到的最近朋友圈
  async contextLines(charId, pid, since) {
    const out = [];
    const posts = (await this.list(pid)).filter(x => x.ts > since && this.canSee(charId, x.author, pid)).slice(0, 5);
    for (const x of posts) {
      const imgs = x.images.map(i => i.desc).filter(Boolean).join('；');
      let t = `[朋友圈] ${this.name(x.author, pid)}发了动态：${x.text || ''}${imgs ? '（配图：' + imgs + '）' : ''}`;
      if (x.likes.includes(charId)) t += `；${charById(charId)?.name}点了赞`;
      const cs = x.comments.filter(c => c.from === charId || c.to === charId || x.author === charId).slice(-4)
        .map(c => `${this.name(c.from, pid)}${c.to ? '回复' + this.name(c.to, pid) : ''}：${c.text}`);
      if (cs.length) t += `；评论：${cs.join(' / ')}`;
      out.push({ ts: x.ts, t });
    }
    return out;
  },

  // 角色发动态
    async post(charId, pid, at = null, topic = '') {
    const ch = charById(charId);
    if (!ch || !S.settings.claude.key) return null;
    const recent = (await Prompt.recentLines(charId, pid, '')).sort((a, b) => a.ts - b.ts).slice(-10).map(x => x.t).join('\n');
    const mem = await Memory.retrieveText(charId, pid, recent, ch.name);
    const mine = (await this.list(pid)).filter(x => x.author === charId).slice(0, 3).map(x => '· ' + x.text).join('\n');
    const system = [`你在扮演${ch.name}，要发一条朋友圈。`, `【${ch.name}的设定】\n${ch.persona || '（无）'}`, mem,
      recent && `【最近的聊天】\n${recent}`, mine && `【最近发过的朋友圈，别重复】\n${mine}`,
     ...Prompt.styleBlocks(pid, ch.name), `【要求】
- 像真人发朋友圈，符合性格。可以是日常、心情、吐槽、分享，可以和最近的事有关，但不会把私聊内容直接公开。
- 先写文字，可以很短。如果配图，另起一行写 [图片]类型|画面描述，最多 3 张，也可以不配图。
    类型：${PHOTO_STYLES.join('、')}（胶片和 CCD 是用复古相机拍的）${ch.artStyle ? `，或者你自己的画作（画风：${ch.artStyle}）：${Object.keys(IMG_STYLES).filter(k => !PHOTO_STYLES.includes(k)).join('、')}` : ''}。
- 只输出朋友圈内容，不写解释。`].filter(Boolean).join('\n\n');
    let out;
    try { out = await API.claude(system, [{ role: 'user', content: `现在是${nowText(at || Date.now())}。${Weather.text()}${topic ? '\n' + topic : ''}` }]
, { maxTokens: 500 }); }
    catch (e) { console.warn(e); return null; }
    const text = [], images = [];
    for (const l of out.split('\n').map(s => s.trim()).filter(Boolean)) {
      const m = l.match(/^\[图片\]\s*(.+)$/);
      if (!m) { text.push(l); continue; }
      if (images.length >= 3) continue;
      let url = '';
            const { style, desc } = Media.parseStyle(m[1]);
      if (S.settings.image.url) {
        try { url = (await Media.genImage(await Media.makePrompt(desc, style, ch))) || ''; }
        catch (e) { Log.add('朋友圈配图生成失败', e.message); }
      }
      images.push({ url, desc: `（${style}）${desc}` });
    }
    const p = { id: uid(), author: charId, text: text.join('\n'), images, ts: at || Date.now(), likes: [], comments: [] };
    const l = await this.list(pid);
    l.unshift(p);
    l.sort((a, b) => b.ts - a.ts);
    await this.save(pid, l);
    if (at) await this.react(pid, p.id);
    else this.later(pid, p.id, '', 40e3);
    return p;
  },

  later(pid, postId, replyTo, ms = 15e3) {
    setTimeout(() => this.react(pid, postId, { replyTo }), ms);
  },

  // 点赞、评论、回复
  async react(pid, postId, { replyTo = '' } = {}) {
    if (!S.settings.claude.key) return;
    const post = (await this.list(pid)).find(x => x.id === postId);
    if (!post) return;
    const nm = id => this.name(id, pid);
    const aid = post.author === 'user' ? pid : post.author;
    const cands = S.chars.filter(c => c.id === post.author || this.canSee(c.id, post.author, pid));
    if (!cands.length) return;
    const relOf = c => c.id === post.author ? '作者本人' : (getRel(c.id, aid).desc || '认识');
    const system = `你在模拟手机朋友圈里的互动。
【动态作者】${nm(post.author)}
【可能互动的人】（都认识作者）
${cands.map(c => `· ${c.name}（和作者：${relOf(c)}）：${(c.persona || '').slice(0, 300)}`).join('\n')}
【规则】
- 每行一个互动，三选一：名字：[赞]　/　名字：评论内容　/　名字→被回复的人：回复内容
- 名字只能是：${cands.map(c => c.name).join('、')}。绝对不要替${persona(pid).name}互动。
- 像真人：不是每个人都会互动，点赞比评论多，评论简短口语化。作者不给自己点赞，只回复别人的评论。
- 已经点过赞的人不要再点，已经说过的话不要重复。
- 一共 0 到 6 行。没人想互动就只输出 [无]。`;
    const imgs = post.images.map(i => i.desc).filter(Boolean).join('；');
    const ctx = `【动态内容】${post.text || '（无文字）'}${imgs ? '\n【配图】' + imgs : ''}
发布时间：${nowText(post.ts)}
【已点赞】${post.likes.map(nm).join('、') || '无'}
【评论区】
${post.comments.map(c => `${nm(c.from)}${c.to ? '→' + nm(c.to) : ''}：${c.text}`).join('\n') || '无'}${replyTo ? `\n\n${replyTo}刚刚留言了，被回复的人通常会回应。` : ''}`;
    let out;
    try { out = await API.claude(system, [{ role: 'user', content: ctx }], { maxTokens: 800 }); }
    catch (e) { console.warn('朋友圈互动失败', e); return; }
    const byName = n => { n = n.trim(); return n === persona(pid).name ? 'user' : cands.find(c => c.name === n)?.id; };
    const acts = [];
    for (const l of out.split('\n').map(s => s.trim()).filter(Boolean)) {
      let m;
      if ((m = l.match(/^(.+?)\s*(?:→|->)\s*(.+?)\s*[:：]\s*(.+)$/))) {
        const f = byName(m[1]), t = byName(m[2]);
        if (f && f !== 'user' && t) acts.push({ k: 'c', from: f, to: t, text: m[3] });
      } else if ((m = l.match(/^(.+?)\s*[:：]\s*\[赞\]/))) {
        const f = byName(m[1]);
        if (f && f !== 'user') acts.push({ k: 'like', from: f });
      } else if ((m = l.match(/^(.+?)\s*[:：]\s*(.+)$/))) {
        const f = byName(m[1]);
        if (f && f !== 'user') acts.push({ k: 'c', from: f, to: null, text: m[2] });
      }
    }
    if (!acts.length) return;
    await this.update(pid, postId, p => {
      acts.forEach((a, k) => {
        if (a.k === 'like') { if (!p.likes.includes(a.from) && a.from !== p.author) p.likes.push(a.from); }
        else p.comments.push({ id: uid(), from: a.from, to: a.to, text: a.text, ts: Date.now() + k });
      });
    });
  },
};

document.addEventListener('pp:moment', () => { if (Router.cur()?.name === 'moments') Router.render(); });

Views.moments = async () => {
  const pid = activePid(), p = persona(pid);
  const all = await Moments.list(pid);
  const list = all.filter(x => Moments.canSee('user', x.author, pid));
  const who = id => Moments.name(id, pid);
  screen().innerHTML = topbar('朋友圈', '<button class="btn ghost" data-act="new" aria-label="发动态">＋</button>') + `<div class="body">
    <div class="mo-head">${avatar(p.avatar, p.name, 'big')}<b>${esc(p.name)}</b></div>
    <button class="btn ghost" data-act="gen" style="margin-bottom:8px">让角色发一条</button>
    ${list.map(x => {
      const a = x.author === 'user' ? p : charById(x.author) || { name: '?' };
      return `<div class="card mo" data-post="${x.id}">
      <div class="flex" style="gap:8px;align-items:flex-start">${avatar(a.avatar, a.name)}<div class="grow" style="min-width:0">
        <b>${esc(a.name)}</b>
        ${x.text ? `<p class="mo-text">${esc(x.text).replace(/\n/g, '<br>')}</p>` : ''}
        ${x.images.length ? `<div class="mo-imgs">${x.images.map((im, k) => safeUrl(im.url)
          ? `<img src="${esc(safeUrl(im.url))}" alt="${esc(im.desc)}" data-img="${k}" loading="lazy">`
          : `<div class="photo"><div class="ph-ico">📷</div>${esc(im.desc)}</div>`).join('')}</div>` : ''}
        <div class="flex mo-bar"><small class="grow">${ChatUI.timeLabel(x.ts)}</small>
          <button class="btn ghost" data-act="like" aria-label="点赞">${x.likes.includes('user') ? '♥' : '♡'}</button>
          <button class="btn ghost" data-act="cmt">评论</button>
          <button class="btn ghost" data-act="more" aria-label="更多">⋯</button></div>
        ${x.likes.length || x.comments.length ? `<div class="mo-cmts">
          ${x.likes.length ? `<div>♥ ${x.likes.map(i => esc(who(i))).join('、')}</div>` : ''}
          ${x.comments.map(c => `<div class="mo-c" data-cid="${c.id}"><b>${esc(who(c.from))}</b>${c.to ? ` 回复 <b>${esc(who(c.to))}</b>` : ''}：${esc(c.text)}</div>`).join('')}
        </div>` : ''}
      </div></div></div>`;
    }).join('') || '<p class="empty">还没有动态</p>'}
  </div>`;

  screen().onclick = async e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'new') return Router.go('momentNew');
    if (a === 'gen') {
      const cs = S.chars.filter(c => knows(pid, c.id));
      if (!cs.length) return toast('还没有认识的角色');
      const id = await actionSheet(cs.map(c => ({ label: c.name, value: c.id })));
      if (!id) return;
      toast('正在发…');
      if (!await Moments.post(id, pid)) toast('发送失败');
      return;
    }
    const card = e.target.closest('[data-post]');
    if (!card) return;
    const postId = card.dataset.post, post = all.find(x => x.id === postId);

    const img = e.target.closest('[data-img]');
    if (img) { const { el, close } = modal(`<img class="big-img" src="${esc(img.src)}" alt="${esc(img.alt)}"><p>${esc(img.alt)}</p>`); el.onclick = close; return; }

    if (a === 'like') {
      await Moments.update(pid, postId, x => { x.likes = x.likes.includes('user') ? x.likes.filter(i => i !== 'user') : [...x.likes, 'user']; });
      return;
    }
    if (a === 'cmt') {
      const t = (await editText('评论', '', false))?.trim();
      if (!t) return;
      await Moments.update(pid, postId, x => x.comments.push({ id: uid(), from: 'user', to: null, text: t, ts: Date.now() }));
      return Moments.later(pid, postId, p.name);
    }
    if (a === 'more') {
      const act = await actionSheet([{ label: '让大家来互动', value: 'react' }, { label: '删除这条动态', value: 'del', danger: true }]);
      if (act === 'react') { toast('等等看…'); Moments.react(pid, postId); }
      if (act === 'del') await Moments.save(pid, all.filter(x => x.id !== postId));
      return;
    }
    const c = post.comments.find(x => x.id === e.target.closest('[data-cid]')?.dataset.cid);
    if (!c) return;
    if (c.from === 'user') {
      if (await confirmBox('删除这条评论')) await Moments.update(pid, postId, x => { x.comments = x.comments.filter(y => y.id !== c.id); });
      return;
    }
    const t = (await editText(`回复 ${who(c.from)}`, '', false))?.trim();
    if (!t) return;
    await Moments.update(pid, postId, x => x.comments.push({ id: uid(), from: 'user', to: c.from, text: t, ts: Date.now() }));
    Moments.later(pid, postId, p.name);
  };
};

Views.momentNew = async () => {
  const pid = activePid(), imgs = [];
  screen().innerHTML = topbar('发动态', '<button class="btn" data-act="post">发表</button>') + `<div class="body">
    <textarea id="mo-t" rows="5" placeholder="这一刻的想法…" aria-label="动态内容" style="width:100%"></textarea>
    <div id="mo-prev" class="mo-imgs"></div>
    <div class="flex" style="gap:6px;margin-top:8px">
      <button class="btn ghost" data-act="local">📷 本地图片</button><button class="btn ghost" data-act="link">🔗 图片链接</button></div>
    <input type="file" accept="image/*" id="mo-f" hidden>
  </div>`;
  const draw = () => { $('#mo-prev').innerHTML = imgs.map((u, k) => `<button class="mo-thumb" data-rm="${k}" aria-label="移除第${k + 1}张图"><img src="${esc(u)}" alt=""></button>`).join(''); };
  $('#mo-f').onchange = async e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try { imgs.push(await Media.compressFile(f)); draw(); } catch (err) { toast(err.message); }
  };
  let posting = false;
  screen().onclick = async e => {
    const rm = e.target.closest('[data-rm]');
    if (rm) { imgs.splice(Number(rm.dataset.rm), 1); return draw(); }
    const a = e.target.closest('[data-act]')?.dataset.act;
    if ((a === 'local' || a === 'link') && imgs.length >= 9) return toast('最多 9 张');
    if (a === 'local') $('#mo-f').click();
    if (a === 'link') {
      const u = (await editText('图片链接', '', false))?.trim();
      if (u && /^https?:\/\//i.test(u)) { imgs.push(u); draw(); } else if (u) toast('链接要以 http 开头');
    }
    if (a === 'post' && !posting) {
      const text = $('#mo-t').value.trim();
      if (!text && !imgs.length) return toast('写点什么吧');
      posting = true;
      toast(imgs.length ? '识别图片中…' : '发表中…');
      const images = [];
      for (const u of imgs) {
        let desc = '';
        if (S.settings.claude.key) try { desc = await Media.describe(u); } catch (err) { console.warn(err); }
        images.push({ url: u, desc });
      }
      const p = { id: uid(), author: 'user', text, images, ts: Date.now(), likes: [], comments: [] };
      const l = await Moments.list(pid);
      l.unshift(p);
      await Moments.save(pid, l);
      Moments.later(pid, p.id, '', 20e3);
      Router.back();
    }
  };
};

// ===================== 天气 =====================
const Weather = {
  data: null,
  CODES: {
    0: ['☀️', '晴'], 1: ['🌤️', '晴间多云'], 2: ['⛅', '多云'], 3: ['☁️', '阴'], 45: ['🌫️', '雾'], 48: ['🌫️', '雾凇'],
    51: ['🌦️', '毛毛雨'], 53: ['🌦️', '毛毛雨'], 55: ['🌧️', '毛毛雨'], 56: ['🌧️', '冻毛毛雨'], 57: ['🌧️', '冻毛毛雨'],
    61: ['🌧️', '小雨'], 63: ['🌧️', '中雨'], 65: ['🌧️', '大雨'], 66: ['🌧️', '冻雨'], 67: ['🌧️', '冻雨'],
    71: ['🌨️', '小雪'], 73: ['🌨️', '中雪'], 75: ['❄️', '大雪'], 77: ['🌨️', '雪粒'],
    80: ['🌦️', '阵雨'], 81: ['🌧️', '阵雨'], 82: ['⛈️', '强阵雨'], 85: ['🌨️', '阵雪'], 86: ['❄️', '强阵雪'],
    95: ['⛈️', '雷阵雨'], 96: ['⛈️', '雷阵雨伴冰雹'], 99: ['⛈️', '强雷阵雨伴冰雹'],
  },
  info(c) { return this.CODES[c] || ['❔', '未知']; },

  async search(name) {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=6&language=zh&format=json`);
    if (!r.ok) throw new Error('城市搜索失败');
    return (await r.json()).results || [];
  },

  async fetch(force = false) {
    const w = S.settings.weather;
    if (w.lat == null) return null;
    if (!force && this.data && this.data.city === w.city && Date.now() - this.data.at < 30 * 60e3) return this.data;
    const q = new URLSearchParams({
      latitude: w.lat, longitude: w.lon, timezone: 'auto', forecast_days: 5,
      current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    });
    const r = await fetch('https://api.open-meteo.com/v1/forecast?' + q);
    if (!r.ok) throw new Error('天气获取失败');
    const j = await r.json();
    this.data = { at: Date.now(), city: w.city, current: j.current, daily: j.daily };
    await DB.put('kv', { id: 'weather', value: this.data });
    return this.data;
  },

  // 给 AI 的一句话
  text() {
    const d = this.data;
    if (!d || d.city !== S.settings.weather.city) return '';
    const c = d.current, dl = d.daily;
    return `${d.city}现在${this.info(c.weather_code)[1]}，${Math.round(c.temperature_2m)}°C（体感${Math.round(c.apparent_temperature)}°C），今天${Math.round(dl.temperature_2m_min[0])}~${Math.round(dl.temperature_2m_max[0])}°C，降水概率${dl.precipitation_probability_max[0] ?? 0}%。`;
  },
};

Views.weather = async () => {
  const w = S.settings.weather;
  let d = null;
  if (w.lat != null) { try { d = await Weather.fetch(); } catch (e) { toast(e.message); d = Weather.data; } }
  const dayName = (s, k) => k === 0 ? '今天' : k === 1 ? '明天' : ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(s).getDay()];
  screen().innerHTML = topbar('天气', '<button class="btn ghost" data-act="city" aria-label="更换城市">📍</button>') + `<div class="body">
    ${d ? `<div class="card wx-now">
      <div class="wx-ico">${Weather.info(d.current.weather_code)[0]}</div>
      <div class="wx-t">${Math.round(d.current.temperature_2m)}°C</div>
      <div>${esc(w.city)} · ${Weather.info(d.current.weather_code)[1]}</div>
      <small>体感 ${Math.round(d.current.apparent_temperature)}°C · 湿度 ${d.current.relative_humidity_2m}% · 风速 ${Math.round(d.current.wind_speed_10m)} km/h</small>
    </div>
    <div class="card">${d.daily.time.map((t, k) => `<div class="row"><span>${dayName(t, k)} ${Weather.info(d.daily.weather_code[k])[0]} ${Weather.info(d.daily.weather_code[k])[1]}</span>
      <span>${Math.round(d.daily.temperature_2m_min[k])}~${Math.round(d.daily.temperature_2m_max[k])}°C · ☔${d.daily.precipitation_probability_max[k] ?? 0}%</span></div>`).join('')}</div>
    <p class="empty">角色默认和你在同一个城市，聊天时知道现在的天气。更新于 ${new Date(d.at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</p>`
    : '<p class="empty">还没设置城市，点右上角 📍 搜索。</p>'}
  </div>`;
  screen().onclick = async e => {
    if (e.target.closest('[data-act]')?.dataset.act !== 'city') return;
    const name = (await editText('搜索城市（中文搜不到可以试试拼音）', w.city, false))?.trim();
    if (!name) return;
    let rs;
    try { rs = await Weather.search(name); } catch (err) { return toast(err.message); }
    if (!rs.length) return toast('没找到这个城市');
    const r = await actionSheet(rs.map(x => ({ label: [x.name, x.admin1, x.country].filter(Boolean).join('，'), value: x })));
    if (!r) return;
    Object.assign(w, { city: r.name, lat: r.latitude, lon: r.longitude });
    await saveSettings();
    try { await Weather.fetch(true); } catch (err) { toast(err.message); }
    Router.render();
  };
};

// ===================== 启动 =====================
const Life = {
  async init() {
    const st = S.settings;
    // 一次性把 {{天气}} 加进「当前时间」条目
    if (!st.weatherPatched) {
      const e = st.entries.find(x => x.name === '当前时间');
      if (e && !e.content.includes('{{天气}}')) e.content += '\n{{天气}}';
      st.weatherPatched = true;
    }
    Weather.data = (await DB.get('kv', 'weather'))?.value || null;
    Weather.fetch().catch(e => console.warn(e));
    setInterval(() => Weather.fetch().catch(e => console.warn(e)), 30 * 60e3);
  },
};
