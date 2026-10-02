// ===== 全局状态 =====
const S = { settings: null, chars: [], groups: [], rels: {}, lastRead: {} };

const THEMES = {
  retro: { name: '复古绿黄', bg: '#e8e4b8', panel: '#f4f0c8', text: '#1e2a10', border: '#1e2a10', accent: '#e0b828', accent2: '#5f8a2a', me: '#c8d860', them: '#fffbe0' },
  cute:  { name: '可爱薄荷', bg: '#e9f7df', panel: '#fffdf0', text: '#5a4632', border: '#7a5c3e', accent: '#ffe36e', accent2: '#8fd694', me: '#c6f0b0', them: '#fff7c2' },
  night: { name: '暗夜 GB', bg: '#1b2a12', panel: '#2d4a1e', text: '#e6f2a0', border: '#0c1408', accent: '#f2c94c', accent2: '#7fb03a', me: '#4f7a2a', them: '#3a5a24' },
};
// 预设字体。g 是 Google Fonts 的名字，用到时才加载
const FONTS = {
  pixel:  { name: '像素 DotGothic16', family: "'DotGothic16'", g: 'DotGothic16' },
  vt:     { name: 'VT323（只有英文）', family: "'VT323','DotGothic16'", g: 'VT323' },
  press:  { name: 'Press Start 2P（只有英文）', family: "'Press Start 2P','DotGothic16'", g: 'Press+Start+2P' },
  silk:   { name: 'Silkscreen（只有英文）', family: "'Silkscreen','DotGothic16'", g: 'Silkscreen' },
  system: { name: '系统默认', family: '-apple-system' },
  custom: { name: '自定义字体', family: "'UserFont'" },
};
const COLOR_LABELS = { bg: '背景', panel: '面板', text: '文字', border: '描边', accent: '主色（黄）', accent2: '副色（绿）', me: '我的气泡', them: '对方气泡' };

const DEFAULTS = {
  worldbook: { scanDepth: 6 },
  cache: { enabled: true },
  claude: { key: '', baseUrl: 'https://api.anthropic.com', model: 'claude-sonnet-4-5', maxTokens: 1024, temperature: 1 },
  embed: { url: '', key: '', model: '', dims: '' },
  image: { url: '', key: '', model: '', extra: '', translate: true },
  tts: { enabled: false, url: '', key: '', model: '', voice: '' },
  translate: { show: true },
  memory: { every: 10, topK: 5, importantCap: 10, threshold: 0.2 },
  chat: { historyLimit: 40, allowIgnore: true },
  proactive: { enabled: true, interval: 30, chance: 0.6, catchup: 2, ccRate: 0.35, intents: true, momentRate: 0.2, groupRate: 0.25, groupCreateRate: 0.05 },
  weather: { city: '', lat: null, lon: null },
  wallet: { balance: 1000 },
  personas: [],
  activePersona: '',
  theme: { preset: 'retro', colors: { ...THEMES.retro }, wallpaper: '', font: 'pixel', fontUrl: '', fontSize: 15, saved: [] },
  entries: null,
  presetVer: 0,
  ver: 0,
};

// ===== 工具函数 =====
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const getP = (o, p) => p.split('.').reduce((a, k) => a?.[k], o);
const setP = (o, p, v) => { const ks = p.split('.'); const last = ks.pop(); ks.reduce((a, k) => (a[k] ??= {}), o)[last] = v; };
const merge = (base, over) => {
  for (const k in over) {
    if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]) && base[k] && typeof base[k] === 'object') merge(base[k], over[k]);
    else base[k] = over[k];
  }
  return base;
};
const safeUrl = u => /^(https?:|data:image\/)/i.test(u || '') ? u : '';
const screen = () => $('#screen');
const pick = a => a[Math.floor(Math.random() * a.length)];
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function nowText(ts = Date.now(), tz) {
  const o = { hour12: false, year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' };
  if (tz) o.timeZone = tz;
  try { return new Date(ts).toLocaleString('zh-CN', o); }
  catch { delete o.timeZone; return new Date(ts).toLocaleString('zh-CN', o); }
}
function gapText(ms) {
  const m = Math.floor(ms / 60e3);
  if (m < 1) return '不到一分钟';
  if (m < 60) return m + '分钟';
  const h = Math.floor(m / 60);
  return h < 24 ? h + '小时' : Math.floor(h / 24) + '天';
}

function toast(text, ms = 2200) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

function modal(html) {
  const root = $('#modal-root');
  root.innerHTML = `<div class="mask"><div class="dialog card">${html}</div></div>`;
  const close = () => (root.innerHTML = '');
  return { el: $('.dialog', root), mask: $('.mask', root), close };
}

function actionSheet(items) {
  return new Promise(res => {
    const { el, mask, close } = modal(`<div class="sheet">${items.map((it, i) =>
      `<button class="btn ${it.danger ? 'danger' : 'ghost'}" data-i="${i}">${esc(it.label)}</button>`).join('')}
      <button class="btn" data-i="-1">取消</button></div>`);
    el.onclick = e => { const b = e.target.closest('[data-i]'); if (!b) return; close(); res(items[b.dataset.i]?.value ?? null); };
    mask.onclick = e => { if (e.target === mask) { close(); res(null); } };
  });
}

function editText(title, value = '', multiline = true) {
  return new Promise(res => {
    const { el, close } = modal(`<h3>${esc(title)}</h3>
      ${multiline ? `<textarea rows="6">${esc(value)}</textarea>` : `<input value="${esc(value)}">`}
      <div class="flex" style="justify-content:flex-end;margin-top:10px">
        <button class="btn ghost" data-a="no">取消</button><button class="btn" data-a="ok">确定</button></div>`);
    const input = $('textarea,input', el);
    input.focus();
    el.onclick = e => {
      const a = e.target.dataset.a;
      if (a === 'ok') { close(); res(input.value); }
      if (a === 'no') { close(); res(null); }
    };
  });
}

async function confirmBox(text) {
  return (await actionSheet([{ label: text, value: true, danger: true }])) === true;
}

function avatar(url, name, cls = '') {
  const u = safeUrl(url);
  return u ? `<div class="av ${cls}" style="background-image:url('${esc(u)}')"></div>`
           : `<div class="av ${cls}">${esc((name || '?').slice(0, 1))}</div>`;
}

function topbar(title, right = '') {
  return `<div class="topbar"><button class="btn ghost" data-act="back" aria-label="返回">◀</button>
    <div class="title">${esc(title)}</div>${right || '<span style="width:38px"></span>'}</div>`;
}

// ===== 数据 =====
async function saveSettings() { await DB.put('kv', { id: 'settings', value: S.settings }); }
async function getMsgs(convId) { return (await DB.byIndex('msgs', 'convId', convId)).sort((a, b) => a.ts - b.ts); }
const charById = id => S.chars.find(c => c.id === id);
const activePid = () => S.settings.activePersona;
const persona = pid => S.settings.personas.find(p => p.id === pid) || S.settings.personas[0];
const isPersona = id => String(id).startsWith('p_');
const senderName = (m, pid) => m.sender === 'user' ? persona(pid).name : (charById(m.sender)?.name || '已删除的角色');

function preview(m, withName = false, pid = activePid()) {
  const body = Media.preview(m);
  return (withName && m.type !== 'ignore' ? senderName(m, pid) + '：' : '') + body;
}

// 会话 ID：dm:人设:角色 / cc:人设:角色A:角色B / g:群
const Conv = {
  dm: (pid, cid) => `dm:${pid}:${cid}`,
  cc: (pid, a, b) => `cc:${pid}:${[a, b].sort().join(':')}`,
  g: gid => `g:${gid}`,
  r: rid => `r:${rid}`,
  parse(id) {
    const [t, ...r] = String(id).split(':');
    if (t === 'dm') return { type: 'dm', pid: r[0], charId: r[1] };
    if (t === 'cc') return { type: 'cc', pid: r[0], a: r[1], b: r[2] };
    if (t === 'g') { const group = S.groups.find(x => x.id === r[0]); return { type: 'g', gid: r[0], group, pid: group?.personaId }; }
    if (t === 'r') { const room = Reading.room(r[0]); return { type: 'r', rid: r[0], room, pid: room?.personaId }; }
    return { type: '?' };
  },
  members(id) {
    const i = this.parse(id);
    if (i.type === 'dm') return [charById(i.charId)].filter(Boolean);
    if (i.type === 'cc') return [charById(i.a), charById(i.b)].filter(Boolean);
    if (i.type === 'g') return (i.group?.members || []).map(charById).filter(Boolean);
    if (i.type === 'r') return (i.room?.members || []).map(charById).filter(Boolean);
    return [];
  },
  involves(id, charId) {
    const i = this.parse(id);
    return i.charId === charId || i.a === charId || i.b === charId;
  },
  label(id, pid) {
    const i = this.parse(id);
    if (i.type === 'dm') return `${persona(pid).name}和${charById(i.charId)?.name || '?'}的私聊`;
    if (i.type === 'cc') return `${charById(i.a)?.name || '?'}和${charById(i.b)?.name || '?'}的私聊`;
    if (i.type === 'g') return `群聊「${i.group?.name || '?'}」`;
    if (i.type === 'r') return `一起看《${Reading.book(i.room?.bookId)?.title || '?'}》`;
    return '未知会话';
  },
};

// ===== 关系网 =====
// 键为两个 ID 排序后拼接。人设-角色默认认识，角色-角色默认不认识
const relKey = (a, b) => [a, b].sort().join('|');
function getRel(a, b) {
  return S.rels[relKey(a, b)] || { know: isPersona(a) || isPersona(b), desc: '' };
}
const knows = (a, b) => a !== b && getRel(a, b).know;
async function setRel(a, b, patch) {
  S.rels[relKey(a, b)] = { ...getRel(a, b), ...patch };
  await DB.put('kv', { id: 'rels', value: S.rels });
}

// 你拉黑 / 解除拉黑角色：在私聊里留一条系统提示，角色能看到
async function setBlock(pid, cid, on) {
  await setRel(pid, cid, { iBlock: on });
  const c = charById(cid);
  await addMsg(Conv.dm(pid, cid), 'user',
    `${persona(pid).name} ${on ? '把' + c.name + '拉黑了' : '解除了对' + c.name + '的拉黑'}`, 'sys');
}

// ===== 消息与未读 =====
async function addMsg(convId, sender, content, type = 'text', extra = {}) {
  const m = { id: uid(), convId, sender, content, type, ts: Date.now(), ...extra };
  await DB.put('msgs', m);
  document.dispatchEvent(new CustomEvent('pp:msg', { detail: m }));
  return m;
}
async function lastMsg(convId) { return (await getMsgs(convId)).at(-1) || null; }
async function unreadInfo(convId, pid = activePid()) {
  const since = S.lastRead[convId] || 0;
  const ms = (await getMsgs(convId)).filter(m => m.ts > since && m.sender !== 'user');
  const name = persona(pid).name;
  const at = ms.some(m => m.content?.includes('@' + name) || m.content?.includes('@全体成员'));
  return { n: ms.length, at };
}
async function markRead(convId) {
  S.lastRead[convId] = Date.now();
  await DB.put('kv', { id: 'lastRead', value: S.lastRead });
}

// ===== 主题 =====
function applyTheme() {
  const t = S.settings.theme, root = document.documentElement.style;
  for (const k in COLOR_LABELS) root.setProperty('--' + k, t.colors[k]);
  const wp = safeUrl(t.wallpaper);
  root.setProperty('--wallpaper', wp ? `url("${wp}")` : 'none');
  applyFont().catch(e => console.warn(e));
}

async function applyFont() {
  const t = S.settings.theme, f = FONTS[t.font] || FONTS.pixel, root = document.documentElement.style;
  if (f.g && !document.querySelector(`link[data-font="${f.g}"]`)) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.dataset.font = f.g;
    l.href = `https://fonts.googleapis.com/css2?family=${f.g}&display=swap`;
    document.head.appendChild(l);
  }
  if (t.font === 'custom') await loadUserFont();
  root.setProperty('--font', f.family + ",'PingFang SC','Hiragino Sans GB',sans-serif");
  root.setProperty('--font-size', (Number(t.fontSize) || 15) + 'px');
}

// 自定义字体：填了链接优先用链接，否则用上传的文件
let _userFont = null, _userFontKey = '';
async function loadUserFont() {
  const t = S.settings.theme;
  const local = t.fontUrl ? null : (await DB.get('kv', 'userFont'))?.value;
  const src = t.fontUrl ? `url("${t.fontUrl}")` : local ? `url("${local.data}")` : '';
  const key = t.fontUrl || (local ? 'local:' + local.name + local.data.length : '');
  if (key === _userFontKey) return;
  if (_userFont) document.fonts.delete(_userFont);
  _userFont = null;
  _userFontKey = key;
  if (!src) return;
  try {
    const ff = new FontFace('UserFont', src);
    await ff.load();
    document.fonts.add(ff);
    _userFont = ff;
  } catch (e) {
    toast('自定义字体加载失败，链接可能不允许跨域', 3500);
  }
}

// ===== 路由 =====
const Views = {};
const Router = {
  stack: [],
  go(name, params = {}) { this.stack.push({ name, params }); this.render(); },
  replace(name, params = {}) { this.stack.pop(); this.go(name, params); },
  back() { if (this.stack.length > 1) this.stack.pop(); this.render(); },
  home() { this.stack = [{ name: 'home', params: {} }]; this.render(); },
  cur() { return this.stack.at(-1); },
  async render() {
    const c = this.cur();
    const v = Views[c.name];
    if (!v) { screen().innerHTML = topbar('未找到') + '<div class="body">页面不存在</div>'; return; }
        try { await v(c.params); } catch (e) { console.error(e); Log.add('页面出错：' + c.name, e.message); }
  },
};
document.addEventListener('click', e => { if (e.target.closest('[data-act="back"]')) Router.back(); });

// 有新消息时刷新桌面和聊天列表（聊天页由 chat.js 自己处理）
let _rr;
document.addEventListener('pp:msg', () => {
  clearTimeout(_rr);
  _rr = setTimeout(() => { if (['home', 'chats', 'me'].includes(Router.cur()?.name)) Router.render(); }, 300);
});

// ===== 表单绑定：data-path 直接对应 S.settings 路径 =====
function field(label, path, opt = {}) {
  const v = getP(S.settings, path);
  if (opt.type === 'check') return `<label class="row"><span>${esc(label)}</span><input type="checkbox" data-path="${path}" ${v ? 'checked' : ''}></label>`;
  if (opt.type === 'textarea') return `<label class="field"><span>${esc(label)}</span><textarea rows="${opt.rows || 3}" data-path="${path}" placeholder="${esc(opt.ph || '')}">${esc(v ?? '')}</textarea></label>`;
  return `<label class="field"><span>${esc(label)}</span><input data-path="${path}" type="${opt.type || 'text'}" ${opt.step ? `step="${opt.step}"` : ''}
    value="${esc(v ?? '')}" placeholder="${esc(opt.ph || '')}" autocomplete="off" autocapitalize="off"></label>`;
}
function bindFields(root, after) {
  $$('[data-path]', root).forEach(el => {
    el.onchange = async () => {
    const v = el.type === 'checkbox' ? el.checked : el.type === 'number' ? (el.value === '' ? '' : Number(el.value)) : el.value;
      setP(S.settings, el.dataset.path, v);
      await saveSettings();
      if (el.dataset.path.startsWith('theme')) applyTheme();
      after?.(el.dataset.path, v);
    };
  });
}

// ===== 桌面 =====
const APPS = [
  { id: 'chats', icon: '💬', name: '聊天' },
  { id: 'chars', icon: '👾', name: '角色' },
  { id: 'peek', icon: '👀', name: '偷看' },
  { id: 'stickers', icon: '🐸', name: '表情包' },
  { id: 'rels', icon: '🕸️', name: '关系网' },
  { id: 'books', icon: '📚', name: '共读' },
  { id: 'moments', icon: '🖼️', name: '朋友圈' },
  { id: 'wallet', icon: '💰', name: '钱包' },
  { id: 'weather', icon: '🌦️', name: '天气' },
  { id: 'me', icon: '🙂', name: '我' },
  { id: 'preset', icon: '📜', name: '预设' },
  { id: 'worldbook', icon: '📖', name: '世界书' },
  { id: 'theme', icon: '🎨', name: '主题' },
  { id: 'health', icon: '🩺', name: '记忆体检' },
  { id: 'settings', icon: '⚙️', name: '设置' },
];

Views.home = async () => {
  const pid = activePid(), p = persona(pid);
  let unread = 0;
  for (const id of chatIds(pid)) unread += (await unreadInfo(id, pid)).n;
  screen().innerHTML = `<div class="home">
    <button class="persona-chip btn ghost" data-act="switch">${avatar(p.avatar, p.name, 'sm')}<span>${esc(p.name)} ▾</span></button>
    <div class="apps">${APPS.map(a => `<button class="app" data-app="${a.id}">
      <div class="icon">${a.icon}</div><div class="name">${a.name}</div>
      ${a.id === 'chats' && unread ? `<span class="dot">${unread > 99 ? '99+' : unread}</span>` : ''}</button>`).join('')}</div>
  </div>`;
  screen().onclick = async e => {
    const a = e.target.closest('[data-app]');
    if (a) return Router.go(a.dataset.app);
    if (e.target.closest('[data-act="switch"]')) await switchPersona();
  };
};

async function switchPersona() {
  const id = await actionSheet(S.settings.personas.map(x => ({ label: (x.id === activePid() ? '✓ ' : '') + x.name, value: x.id })));
  if (!id || id === activePid()) return;
  S.settings.activePersona = id;
  await saveSettings();
  toast('已切换到 ' + persona(id).name);
  Router.render();
}

// 当前人设可见的会话：认识的角色单聊 + 自己的群（包括退出的群，不包括角色自己建、你没进过的群）
function chatIds(pid) {
  const ids = S.chars.filter(c => knows(pid, c.id)).map(c => Conv.dm(pid, c.id));
  for (const g of S.groups) if (g.personaId === pid && (g.userIn !== false || !g.byChar)) ids.push(Conv.g(g.id));
  return ids;
}

// ===== 聊天列表 =====
Views.chats = async () => {
  const pid = activePid();
  const rows = [];
  for (const id of chatIds(pid)) {
    const i = Conv.parse(id), last = await lastMsg(id), u = await unreadInfo(id, pid);
    const isG = i.type === 'g';
    const c = isG ? null : charById(i.charId);
    rows.push({
      id, ts: last?.ts || 0, u,
      name: isG ? i.group.name + (i.group.userIn === false ? '（已退出）' : '') : c.name,
      av: isG ? avatar(i.group.avatar, i.group.name) : avatar(c.avatar, c.name),
      pv: last ? preview(last, isG, pid) : '（还没有消息）',
    });
  }
  rows.sort((a, b) => b.ts - a.ts);
  screen().innerHTML = topbar('聊天', '<button class="btn ghost" data-act="newgroup" aria-label="新建群聊">＋群</button>') +
    `<div class="body list">${rows.length ? rows.map(r => `<button class="item" data-id="${esc(r.id)}">
      ${r.av}<div class="grow"><div class="flex" style="justify-content:space-between"><b>${esc(r.name)}</b>
      <small>${r.ts ? new Date(r.ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : ''}</small></div>
      <small class="ellipsis">${r.u.at ? '<span class="at">[有人@我]</span> ' : ''}${esc(r.pv)}</small></div>
      ${r.u.n ? `<span class="dot">${r.u.n}</span>` : ''}</button>`).join('')
      : '<p class="empty">还没有聊天。先去「角色」里创建角色吧。</p>'}</div>`;
  screen().onclick = e => {
    if (e.target.closest('[data-act="newgroup"]')) return Router.go('newGroup');
    const it = e.target.closest('[data-id]');
    if (!it) return;
    const id = it.dataset.id;
    id.startsWith('g:') ? Router.go('group', { gid: Conv.parse(id).gid }) : Router.go('chat', { convId: id });
  };
};

// ===== 角色管理 =====
Views.chars = async () => {
  screen().innerHTML = topbar('角色', '<button class="btn ghost" data-act="add" aria-label="新建角色">＋</button>') +
       `<div class="body list">${S.chars.length ? S.chars.map(c => `<div class="item char-item">
      <button class="char-head" data-id="${c.id}">${avatar(c.avatar, c.name)}<b class="grow">${esc(c.name)}</b><span>编辑 ▸</span></button>
      <details class="char-persona"><summary>查看设定</summary>
        <div class="persona-text">${esc(c.persona || '（未填写设定）')}</div></details>
    </div>`).join('')
      : '<p class="empty">点右上角 ＋ 创建第一个角色</p>'}</div>`;
  screen().onclick = async e => {
    if (e.target.closest('[data-act="add"]')) {
      const c = { id: uid(), name: '新角色', avatar: '', persona: '', created: Date.now() };
      await DB.put('chars', c);
      S.chars.push(c);
      return Router.go('charEdit', { id: c.id });
    }
    const it = e.target.closest('[data-id]');
    if (it) Router.go('charEdit', { id: it.dataset.id });
  };
};

Views.charEdit = async ({ id }) => {
  const c = charById(id);
  if (!c) return Router.back();
  const pid = activePid();
  screen().innerHTML = topbar('编辑角色') + `<div class="body">
    <div class="card" style="text-align:center">${avatar(c.avatar, c.name, 'big')}</div>
    <div class="card">
      <label class="field"><span>名字</span><input data-k="name" value="${esc(c.name)}"></label>
      <label class="field"><span>头像链接</span><input data-k="avatar" value="${esc(c.avatar)}" placeholder="https://..." autocapitalize="off"></label>
      <label class="field"><span>角色设定</span><textarea data-k="persona" rows="10" placeholder="性格、背景、说话习惯……">${esc(c.persona)}</textarea></label>
      <label class="field"><span>画风偏好（会画画才填，不填就只拍照）</span><input data-k="artStyle" value="${esc(c.artStyle || '')}" placeholder="比如：擅长水彩，偶尔画国画"></label>
    </div>
    <div class="card">
      <div class="row"><span>所在地</span><span>${c.city ? `${esc(c.city)} · ${esc(c.tz)}` : '和你同城'}</span></div>
      <div class="flex" style="gap:6px;margin-bottom:6px">
        <button class="btn ghost" data-act="loc">搜索城市</button>
        ${c.city ? '<button class="btn ghost" data-act="unloc">清除</button>' : ''}</div>
      <label class="field"><span>母语</span><input data-k="lang" value="${esc(c.lang || '')}" placeholder="留空 = 中文，比如：日语"></label>
      <label class="field"><span>还会的语言（逗号分隔）</span><input data-k="langs" value="${esc(c.langs || '')}" placeholder="比如：英语,中文"></label>
      <label class="field"><span>和你聊天时用</span><select data-x="chatLang">
        <option value="native" ${c.chatLang !== 'user' ? 'selected' : ''}>母语（附翻译）</option>
        <option value="user" ${c.chatLang === 'user' ? 'selected' : ''}>你的语言</option></select></label>
      <label class="row"><span>会用翻译软件</span><input type="checkbox" data-x="translator" ${c.translator ? 'checked' : ''}></label>
      <label class="row"><span>会主动找你、发朋友圈、找别人聊</span><input type="checkbox" data-x="proactive" ${c.proactive !== false ? 'checked' : ''}></label>
    </div>
    <div class="card flex" style="flex-wrap:wrap;gap:8px">
      <button class="btn" data-act="chat" ${knows(pid, c.id) ? '' : 'disabled'}>发消息</button>
      <button class="btn ghost" data-act="mems">查看记忆（${esc(persona(pid).name)}）</button>
      <button class="btn ghost" data-act="clear">清空记录 / 记忆</button>
      <button class="btn ghost" data-act="block">${getRel(pid, c.id).iBlock ? '解除拉黑' : '拉黑'}</button>
      <button class="btn danger" data-act="del">删除角色</button>
    </div>
    ${knows(pid, c.id) ? '' : `<p class="empty">${esc(persona(pid).name)}和${esc(c.name)}还不认识，去「关系网」里设置后才能私聊。</p>`}
    ${getRel(pid, c.id).theyBlock ? `<p class="empty">${esc(c.name)} 把你拉黑了。你发的消息 TA 能看到，但不会回，除非 TA 自己解除。</p>` : ''}
  </div>`;
  $$('[data-k]').forEach(el => el.onchange = async () => {
    c[el.dataset.k] = el.value.trim();
    await DB.put('chars', c);
    if (el.dataset.k !== 'persona') Router.render();
  });
  $$('[data-x]').forEach(el => el.onchange = async () => {
    c[el.dataset.x] = el.type === 'checkbox' ? el.checked : el.value;
    await DB.put('chars', c);
  });
  screen().onclick = async e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'loc') {
      const name = (await editText('搜索城市（搜不到可以试试英文）', c.city || '', false))?.trim();
      if (!name) return;
      let rs;
      try { rs = await Weather.search(name); } catch (err) { return toast(err.message); }
      if (!rs.length) return toast('没找到这个城市');
      const r = await actionSheet(rs.map(x => ({ label: [x.name, x.admin1, x.country].filter(Boolean).join('，'), value: x })));
      if (!r) return;
      Object.assign(c, { city: r.name, lat: r.latitude, lon: r.longitude, tz: r.timezone });
      await DB.put('chars', c);
      return Router.render();
    }
    if (a === 'unloc') {
      Object.assign(c, { city: '', lat: null, lon: null, tz: '' });
      await DB.put('chars', c);
      return Router.render();
    }
    if (a === 'clear') {
      const k = await actionSheet([
        { label: '清空聊天记录', value: 'msg', danger: true },
        { label: '清空记忆', value: 'mem', danger: true },
        { label: '两个都清空', value: 'all', danger: true },
      ]);
      if (!k || !await confirmBox(`确定清空（只影响「${persona(pid).name}」，删了找不回来）`)) return;
      const convId = Conv.dm(pid, c.id);
      if (k !== 'mem') {
        for (const m of await getMsgs(convId)) await DB.del('msgs', m.id);
        await DB.del('kv', 'memstate_' + convId); // 总结进度一起重置
      }
      if (k !== 'msg') {
        for (const m of await DB.byIndex('mems', 'charId', c.id)) if (m.personaId === pid) await DB.del('mems', m.id);
        Memory._q = { text: null, vec: null };
      }
      toast('已清空');
    }
       if (a === 'block') {
      const on = !getRel(pid, c.id).iBlock;
      if (on && !await confirmBox(`拉黑 ${c.name}（TA 会知道。TA 还能给你发消息，你解除前不能回）`)) return;
      await setBlock(pid, c.id, on);
      toast(on ? '已拉黑' : '已解除拉黑');
      return Router.render();
    }
    if (a === 'chat') Router.go('chat', { convId: Conv.dm(pid, c.id) });
    if (a === 'mems') Router.go('mems', { charId: c.id });
    if (a === 'del' && await confirmBox(`删除 ${c.name}（记忆一起删除，聊天记录保留）`)) {
      await DB.del('chars', c.id);
      for (const m of await DB.byIndex('mems', 'charId', c.id)) await DB.del('mems', m.id);
      S.chars = S.chars.filter(x => x.id !== c.id);
      for (const g of S.groups) if (g.members.includes(c.id)) { g.members = g.members.filter(x => x !== c.id); await DB.put('groups', g); }
      toast('已删除');
      Router.back();
    }
  };
};

// ===== 记忆查看 / 编辑（按当前人设） =====
Views.mems = async ({ charId }) => {
  const c = charById(charId), pid = activePid();
  const list = (await DB.byIndex('mems', 'charId', charId)).filter(m => m.personaId === pid).sort((a, b) => b.ts - a.ts);
  screen().innerHTML = topbar(`${c.name}的记忆`, '<button class="btn ghost" data-act="add" aria-label="添加记忆">＋</button>') +
    `<div class="body">
    <p class="empty">只显示和「${esc(persona(pid).name)}」相关的记忆。★ 为重要记忆，每次都会带上；普通记忆按向量相似度召回。</p>
    ${list.length ? list.map(m => `<div class="card" data-id="${m.id}">
      <div class="flex" style="justify-content:space-between"><small>${new Date(m.ts).toLocaleString('zh-CN')} · ${m.vecType === 'api' ? '接口向量' : '本地向量'}</small>
      <button class="btn ghost" data-act="lv">${m.level === 'important' ? '★ 重要' : '☆ 普通'}</button></div>
      <p style="margin:6px 0">${esc(m.text)}</p>
      <div class="flex" style="justify-content:flex-end;gap:6px"><button class="btn ghost" data-act="edit">编辑</button><button class="btn danger" data-act="del">删除</button></div>
    </div>`).join('') : '<p class="empty">还没有记忆。聊满设定的轮数会自动总结。</p>'}</div>`;
  screen().onclick = async e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'add') {
      const t = await editText('添加记忆');
      if (t?.trim()) { await Memory.add(charId, pid, t.trim(), 'normal', 'manual'); Router.render(); }
      return;
    }
    const card = e.target.closest('[data-id]');
    if (!card) return;
    const m = list.find(x => x.id === card.dataset.id);
    if (a === 'lv') { m.level = m.level === 'important' ? 'normal' : 'important'; await DB.put('mems', m); Router.render(); }
    if (a === 'edit') { const t = await editText('编辑记忆', m.text); if (t?.trim()) { await Memory.update(m, t.trim()); Router.render(); } }
    if (a === 'del' && await confirmBox('删除这条记忆')) { await DB.del('mems', m.id); Router.render(); }
  };
};

// ===== 关系网 =====
Views.rels = async () => {
  const pid = activePid(), p = persona(pid);
  const row = (a, b, title) => {
    const r = getRel(a, b);
    return `<div class="card rel" data-a="${a}" data-b="${b}">
      <label class="row"><span>${title}</span><input type="checkbox" data-know ${r.know ? 'checked' : ''}> 认识</label>
      <input data-desc value="${esc(r.desc)}" placeholder="关系描述，比如：大学室友，关系一般" ${r.know ? '' : 'disabled'}>
    </div>`;
  };
  const pairs = [];
  for (let i = 0; i < S.chars.length; i++) for (let j = i + 1; j < S.chars.length; j++) pairs.push([S.chars[i], S.chars[j]]);
  screen().innerHTML = topbar('关系网') + `<div class="body">
    <h3>${esc(p.name)} 和角色</h3>
    <p class="empty">只对当前人设生效。不认识的角色不会出现在聊天列表，也不会主动找你。</p>
    ${S.chars.map(c => row(pid, c.id, `${p.name} ↔ ${c.name}`)).join('') || '<p class="empty">还没有角色</p>'}
    <h3>角色之间</h3>
    <p class="empty">所有人设共用。只有认识的两个人才会私聊。</p>
    ${pairs.map(([a, b]) => row(a.id, b.id, `${a.name} ↔ ${b.name}`)).join('') || '<p class="empty">至少要两个角色</p>'}
  </div>`;
  $$('.rel').forEach(card => {
    const { a, b } = card.dataset, desc = $('[data-desc]', card);
    $('[data-know]', card).onchange = async e => { await setRel(a, b, { know: e.target.checked }); desc.disabled = !e.target.checked; };
    desc.onchange = async () => setRel(a, b, { desc: desc.value.trim() });
  });
};

// ===== 我：人设管理 + 共用钱包 =====
Views.me = async () => {
  const pid = activePid();
  screen().innerHTML = topbar('我', '<button class="btn ghost" data-act="add" aria-label="新建人设">＋</button>') + `<div class="body">
    <div class="card" style="text-align:center">
      ${avatar(persona(pid).avatar, persona(pid).name, 'big')}
      <h3>${esc(persona(pid).name)}</h3>
            <button class="btn ghost balance" data-act="wallet">💰 余额 ¥${Number(S.settings.wallet.balance).toFixed(2)} ▸</button>
      <small>钱包所有人设共用</small>
    </div>
    <h3>我的人设</h3>
    ${S.settings.personas.map(x => `<div class="card" data-id="${x.id}">
      <div class="flex" style="gap:8px">${avatar(x.avatar, x.name, 'sm')}<b class="grow">${esc(x.name)}${x.id === pid ? '（当前）' : ''}</b>
      ${x.id === pid ? '' : '<button class="btn" data-act="use">切换</button>'}</div>
      <label class="field"><span>名字</span><input data-k="name" value="${esc(x.name)}"></label>
      <label class="field"><span>头像链接</span><input data-k="avatar" value="${esc(x.avatar)}" placeholder="https://..." autocapitalize="off"></label>
      <label class="field"><span>母语</span><input data-k="lang" value="${esc(x.lang || '')}" placeholder="留空 = 中文"></label>
      <label class="field"><span>还会的语言</span><input data-k="langs" value="${esc(x.langs || '')}" placeholder="比如：英语"></label>
      <label class="field"><span>人设</span><textarea data-k="persona" rows="4">${esc(x.persona)}</textarea></label>
      ${S.settings.personas.length > 1 ? '<button class="btn danger" data-act="del">删除人设</button>' : ''}
    </div>`).join('')}
  </div>`;
  $$('[data-k]').forEach(el => el.onchange = async () => {
    const x = persona(el.closest('[data-id]').dataset.id);
    x[el.dataset.k] = el.value.trim();
    await saveSettings();
    if (el.dataset.k !== 'persona') Router.render();
  });
  screen().onclick = async e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'wallet') return Router.go('wallet');
    if (a === 'add') {
      S.settings.personas.push({ id: 'p_' + uid(), name: '新人设', persona: '', avatar: '' });
      await saveSettings();
      return Router.render();
    }
    const id = e.target.closest('[data-id]')?.dataset.id;
    if (a === 'use') { S.settings.activePersona = id; await saveSettings(); toast('已切换'); Router.render(); }
    if (a === 'del' && await confirmBox(`删除人设 ${persona(id).name}（聊天和记忆会保留在数据库里，但看不到了）`)) {
      S.settings.personas = S.settings.personas.filter(x => x.id !== id);
      if (activePid() === id) S.settings.activePersona = S.settings.personas[0].id;
      await saveSettings();
      Router.render();
    }
  };
};

// ===== 预设：条目式注入 =====
const SCOPES = { all: '通用', dm: '单聊', group: '群聊' };
Views.preset = async () => {
  const es = S.settings.entries;
  screen().innerHTML = topbar('预设', '<button class="btn ghost" data-act="add" aria-label="新建条目">＋</button>') + `<div class="body">
    <p class="empty">从上到下依次拼进系统提示。「深度」类型会插入到聊天记录中，0 表示最后一条之后。
    可用变量：{{用户}} {{角色}} {{角色设定}} {{用户设定}} {{关系}} {{记忆}} {{近况}} {{时间}} {{群名}} {{成员名单}} {{成员设定}}</p>
    ${es.map((x, i) => `<div class="card" data-i="${i}">
      <div class="flex" style="gap:6px">
        <input type="checkbox" data-k="enabled" ${x.enabled ? 'checked' : ''} aria-label="启用">
        <input data-k="name" value="${esc(x.name)}" class="grow">        
        ${Prompt.isDyn(x) ? '<small>动态</small>' : ''}
        <button class="btn ghost" data-act="up" aria-label="上移">▲</button><button class="btn ghost" data-act="down" aria-label="下移">▼</button>
      </div>
      <div class="flex" style="gap:6px;margin:6px 0;flex-wrap:wrap">
        <select data-k="scope">${Object.entries(SCOPES).map(([k, v]) => `<option value="${k}" ${x.scope === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
        <select data-k="position"><option value="system" ${x.position === 'system' ? 'selected' : ''}>系统提示</option><option value="depth" ${x.position === 'depth' ? 'selected' : ''}>按深度插入</option></select>
        ${x.position === 'depth' ? `<input type="number" min="0" data-k="depth" value="${x.depth}" style="width:60px" aria-label="深度">
          <select data-k="role"><option value="user" ${x.role === 'user' ? 'selected' : ''}>user</option><option value="assistant" ${x.role === 'assistant' ? 'selected' : ''}>assistant</option></select>` : ''}
      </div>
      <textarea data-k="content" rows="5">${esc(x.content)}</textarea>
      <button class="btn danger" data-act="del" style="margin-top:6px">删除</button>
    </div>`).join('')}
    <button class="btn ghost" data-act="reset">恢复默认预设</button>
  </div>`;
  $$('[data-k]').forEach(el => el.onchange = async () => {
    const x = es[el.closest('[data-i]').dataset.i], k = el.dataset.k;
    x[k] = el.type === 'checkbox' ? el.checked : k === 'depth' ? Number(el.value) : el.value;
    await saveSettings();
    if (k === 'position') Router.render();
  });
  screen().onclick = async e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (!a) return;
    const i = Number(e.target.closest('[data-i]')?.dataset.i);
    if (a === 'add') es.push({ id: uid(), name: '新条目', enabled: true, scope: 'all', position: 'system', role: 'user', depth: 0, content: '' });
    else if (a === 'up' && i > 0) [es[i - 1], es[i]] = [es[i], es[i - 1]];
    else if (a === 'down' && i < es.length - 1) [es[i + 1], es[i]] = [es[i], es[i + 1]];
    else if (a === 'del') { if (!await confirmBox(`删除条目「${es[i].name}」`)) return; es.splice(i, 1); }
    else if (a === 'reset') { if (!await confirmBox('恢复默认预设（覆盖所有条目）')) return; S.settings.entries = DEFAULT_ENTRIES(); }
    else return;
    await saveSettings();
    Router.render();
  };
};

// ===== 主题 =====
Views.theme = async () => {
  const t = S.settings.theme;
  t.saved ??= [];
  const hasLocal = !!(await DB.get('kv', 'userFont'));
  screen().innerHTML = topbar('主题') + `<div class="body">
    <h3>配色</h3>
    <div class="card flex" style="flex-wrap:wrap;gap:6px">
      ${Object.entries(THEMES).map(([k, v]) => `<button class="btn ${t.preset === k ? '' : 'ghost'}" data-preset="${k}">${v.name}</button>`).join('')}
      ${t.saved.map(s => `<button class="btn ${t.preset === 'saved:' + s.id ? '' : 'ghost'}" data-saved="${s.id}">
        <span class="swatch" style="background:${esc(s.colors.accent2)}"></span><span class="swatch" style="background:${esc(s.colors.accent)}"></span>${esc(s.name)}</button>`).join('')}
      <button class="btn ghost" data-act="save">＋ 保存当前配色</button>
    </div>
    <div class="card">${Object.entries(COLOR_LABELS).map(([k, v]) =>
      `<label class="row"><span>${v}</span><input type="color" data-path="theme.colors.${k}" value="${esc(t.colors[k])}"></label>`).join('')}</div>

    <h3>字体</h3>
    <div class="card">
      <label class="field"><span>字体</span><select id="font">${Object.entries(FONTS).map(([k, v]) =>
        `<option value="${k}" ${t.font === k ? 'selected' : ''}>${v.name}</option>`).join('')}</select></label>
      ${t.font === 'custom' ? `
        ${field('字体文件链接（.ttf / .otf / .woff2）', 'theme.fontUrl', { ph: 'https://...（填了就优先用链接）' })}
        <div class="flex" style="gap:6px;flex-wrap:wrap">
          <button class="btn ghost" data-act="upfont">上传本地字体</button>
          ${hasLocal ? '<button class="btn danger" data-act="rmfont">删除已上传的字体</button>' : ''}
        </div>
        <input type="file" id="fontf" accept=".ttf,.otf,.woff,.woff2" hidden>
        <p class="empty">${hasLocal && !t.fontUrl ? '正在使用已上传的字体。' : hasLocal ? '已上传字体，但现在优先用链接。' : ''}</p>` : ''}
      ${field('字号（px）', 'theme.fontSize', { type: 'number' })}
      <p class="font-demo">预览：你好呀，今天吃什么 Hello 123 ♥</p>
    </div>

    <h3>壁纸</h3>
    <div class="card">${field('壁纸链接', 'theme.wallpaper', { ph: 'https://...（留空不用壁纸）' })}</div>
  </div>`;

  // 手动调颜色后，取消预设的选中状态
  bindFields(screen(), path => {
    if (path.startsWith('theme.colors') && t.preset) { t.preset = ''; saveSettings(); }
  });

  $('#font').onchange = async e => {
    t.font = e.target.value;
    await saveSettings();
    applyTheme();
    Router.render();
  };

  const ff = $('#fontf');
  if (ff) ff.onchange = async () => {
    const f = ff.files[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) return toast('字体文件太大了（超过 20MB）');
    toast('读取字体中…');
    const data = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = () => rej(r.error);
      r.readAsDataURL(f);
    });
    await DB.put('kv', { id: 'userFont', value: { name: f.name, data } });
    t.fontUrl = '';
    await saveSettings();
    applyTheme();
    toast('已换成 ' + f.name);
    Router.render();
  };

  screen().onclick = async e => {
    const k = e.target.closest('[data-preset]')?.dataset.preset;
    if (k) {
      t.preset = k;
      t.colors = { ...THEMES[k] };
      delete t.colors.name;
      return done();
    }

    const sid = e.target.closest('[data-saved]')?.dataset.saved;
    if (sid) {
      const s = t.saved.find(x => x.id === sid);
      const a = await actionSheet([
        { label: '使用这套配色', value: 'use' },
        { label: '用当前颜色覆盖它', value: 'over' },
        { label: '重命名', value: 'ren' },
        { label: '删除', value: 'del', danger: true },
      ]);
      if (a === 'use') { t.colors = { ...s.colors }; t.preset = 'saved:' + s.id; }
      if (a === 'over') { s.colors = { ...t.colors }; t.preset = 'saved:' + s.id; toast('已覆盖'); }
      if (a === 'ren') { const n = (await editText('配色名字', s.name, false))?.trim(); if (n) s.name = n; }
      if (a === 'del') {
        if (!await confirmBox(`删除配色「${s.name}」`)) return;
        t.saved = t.saved.filter(x => x !== s);
        if (t.preset === 'saved:' + s.id) t.preset = '';
      }
      if (a) return done();
      return;
    }

    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'save') {
      const n = (await editText('给这套配色起个名字', '我的配色' + (t.saved.length + 1), false))?.trim();
      if (!n) return;
      const s = { id: uid(), name: n, colors: { ...t.colors } };
      t.saved.push(s);
      t.preset = 'saved:' + s.id;
      toast('已保存');
      return done();
    }
    if (a === 'upfont') return ff.click();
    if (a === 'rmfont') {
      if (!await confirmBox('删除已上传的字体')) return;
      await DB.del('kv', 'userFont');
      return done();
    }
  };

  async function done() {
    await saveSettings();
    applyTheme();
    Router.render();
  }
};

// ===== 设置 =====
Views.settings = async () => {
  screen().innerHTML = topbar('设置') + `<div class="body">
    <h3>Claude</h3><div class="card">
      ${field('API Key', 'claude.key', { type: 'password', ph: 'sk-ant-...' })}
      ${field('接口地址', 'claude.baseUrl')}
      ${field('模型', 'claude.model')}
      ${field('最大输出 tokens', 'claude.maxTokens', { type: 'number' })}
      ${field('温度（0~1）', 'claude.temperature', { type: 'number', step: '0.1' })}
      <button class="btn ghost" data-act="test">测试连接</button>
    </div>
    <h3>记忆</h3><div class="card">
      ${field('每几轮总结一次（按你发的消息数）', 'memory.every', { type: 'number' })}
      ${field('每次召回普通记忆条数', 'memory.topK', { type: 'number' })}
      ${field('重要记忆最多带几条', 'memory.importantCap', { type: 'number' })}
      ${field('相似度阈值（0~1）', 'memory.threshold', { type: 'number', step: '0.05' })}
    </div>
    <h3>向量接口（可选，留空用本地匹配）</h3><div class="card">
      ${field('接口地址', 'embed.url', { ph: 'https://.../v1/embeddings' })}
      ${field('Key', 'embed.key', { type: 'password' })}
      ${field('模型', 'embed.model', { ph: '比如 BAAI/bge-m3' })}
      ${field('向量维度（留空用模型默认）', 'embed.dims', { type: 'number', ph: '比如 1024 或 512' })}
      <button class="btn ghost" data-act="revec">重新向量化全部记忆</button>
      <p class="empty">换模型或改维度后要点一次，不然旧记忆匹配不上。</p>
      <button class="btn ghost" data-act="t-embed">测试连接</button>
    </div>
    <h3>聊天</h3><div class="card">
      ${field('带入的历史消息条数', 'chat.historyLimit', { type: 'number' })}
      ${field('显示外语消息的翻译', 'translate.show', { type: 'check' })}
      ${field('允许已读不回', 'chat.allowIgnore', { type: 'check' })}
    </div>
    <h3>提示词缓存</h3><div class="card">
      ${field('开启缓存（省钱、更快）', 'cache.enabled', { type: 'check' })}
      <p class="empty">命中率 ${API.hitRate()}% · 调用 ${API.stats.calls} 次 · 命中 ${API.stats.read} / 写入 ${API.stats.write} / 未缓存 ${API.stats.input} tokens</p>
      <button class="btn ghost" data-act="cstat">统计清零</button>
    </div>
    <h3>主动消息</h3><div class="card">
      ${field('开启', 'proactive.enabled', { type: 'check' })}
      ${field('检查间隔（分钟）', 'proactive.interval', { type: 'number' })}
      ${field('每次检查触发概率（0~1）', 'proactive.chance', { type: 'number', step: '0.05' })}
      ${field('离线补发最多几次', 'proactive.catchup', { type: 'number' })}
      ${field('角色间私聊占比（0~1）', 'proactive.ccRate', { type: 'number', step: '0.05' })}
      ${field('聊天中触发"想私聊某人"', 'proactive.intents', { type: 'check' })}
      ${field('角色发朋友圈占比（0~1）', 'proactive.momentRate', { type: 'number', step: '0.05' })}
      ${field('角色在群里主动说话占比（0~1）', 'proactive.groupRate', { type: 'number', step: '0.05' })}
      ${field('角色自己建群的概率（0~1，每次主动行为时）', 'proactive.groupCreateRate', { type: 'number', step: '0.01' })}
    </div>
    <h3>生图接口（留空待填）</h3><div class="card">
      ${field('接口地址', 'image.url')}
      ${field('Key', 'image.key', { type: 'password' })}
      ${field('模型', 'image.model')}
      ${field('额外参数（JSON）', 'image.extra', { type: 'textarea', ph: '{"size":"512x512"}' })}
      ${field('先把描述改写成英文提示词（效果更好，每张图多一次调用）', 'image.translate', { type: 'check' })}
      <button class="btn ghost" data-act="t-image">测试生图</button>
    </div>
    <h3>语音 TTS（可选）</h3><div class="card">
      ${field('启用声音播放', 'tts.enabled', { type: 'check' })}
      ${field('接口地址', 'tts.url')}
      ${field('Key', 'tts.key', { type: 'password' })}
      ${field('模型', 'tts.model')}
      ${field('音色', 'tts.voice')}
      <button class="btn ghost" data-act="t-tts">测试播放</button>
      <p class="empty">测试不受"启用"开关影响。</p>
    </div>
    <h3>数据</h3><div class="card flex" style="gap:8px;flex-wrap:wrap">
      <button class="btn" data-act="export">导出备份</button>
      <button class="btn ghost" data-act="import">导入备份</button>
      <input type="file" accept="application/json" id="imp" hidden>
    </div>
    <p class="empty">Key 只保存在这台设备的浏览器里，导出的备份文件也包含 Key，注意别发给别人。</p>
  </div>`;
  bindFields(screen());
  $('#imp').onchange = e => importData(e.target.files[0]);
  screen().onclick = async e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a?.startsWith('t-')) {
      const kind = a.slice(2);
      toast(kind === 'image' ? '生成中，可能要等十几秒…' : '测试中…', 4000);
      try {
        const r = await API.test(kind);
        if (kind === 'image') {
          const { el, close } = modal(`<h3>生图成功</h3><img class="big-img" src="${esc(safeUrl(r))}" alt="测试生成的图片"><p class="empty">点任意处关闭</p>`);
          el.onclick = close;
        } else toast(r, 3000);
      } catch (err) {
        const msg = err.message === 'Failed to fetch' ? '请求被拦截（可能是地址错了，或接口不允许浏览器跨域调用）' : err.message;
        toast('失败：' + msg, 5000);
      }
    }
    if (a === 'test') {
      toast('测试中…');
      try { const r = await API.claude('只回复"OK"。', [{ role: 'user', content: 'ping' }], { maxTokens: 10 }); toast('连接成功：' + r.slice(0, 20)); }
      catch (err) { toast('失败：' + err.message, 4000); }
    }
    if (a === 'cstat') {
      API.stats = { calls: 0, input: 0, read: 0, write: 0 };
      await DB.put('kv', { id: 'cacheStats', value: API.stats });
      Router.render();
    }
    if (a === 'revec') {
      if (!await confirmBox('用当前向量设置重新计算全部记忆')) return;
      const all = await DB.all('mems');
      let done = 0;
      for (const m of all) {
        Object.assign(m, await Memory.vectorize(m.text));
        await DB.put('mems', m);
        if (++done % 10 === 0) toast(`进度 ${done}/${all.length}`, 1500);
      }
      Memory._q = { text: null, vec: null };
      toast(`完成，共 ${all.length} 条`);
    }
    if (a === 'export') exportData();
    if (a === 'import') $('#imp').click();
  };
};

async function exportData() {
  const data = { app: 'pixelphone', ver: 2, at: Date.now() };
  for (const s of DB.STORES) data[s] = await DB.all(s);
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `pixelphone-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function importData(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (data.app !== 'pixelphone') throw new Error('不是小手机的备份文件');
    if (!await confirmBox('导入会覆盖当前全部数据')) return;
    for (const s of DB.STORES) {
      if (!Array.isArray(data[s])) continue;
      await DB.clear(s);
      for (const v of data[s]) await DB.put(s, v);
    }
    toast('导入成功，正在重新加载');
    setTimeout(() => location.reload(), 800);
  } catch (e) { toast('导入失败：' + e.message, 4000); }
}

// ===== 启动 =====
// 旧版消息的 convId 是角色 ID，迁移到当前人设的单聊
async function migrate() {
  if (S.settings.ver >= 2) return;
  const pid = activePid();
  for (const m of await DB.all('msgs')) {
    if (String(m.convId).includes(':')) continue;
    m.convId = Conv.dm(pid, m.convId);
    if (m.role && !m.sender) m.sender = m.role === 'user' ? 'user' : Conv.parse(m.convId).charId;
    await DB.put('msgs', m);
  }
  for (const m of await DB.all('mems')) if (!m.personaId) { m.personaId = pid; await DB.put('mems', m); }
  S.settings.ver = 2;
}

function clock() {
  const tick = () => { $('#sb-time').textContent = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }); };
  tick();
  setInterval(tick, 15e3);
}

async function boot() {
  const saved = (await DB.get('kv', 'settings'))?.value;
  S.settings = merge(structuredClone(DEFAULTS), saved || {});
  const st = S.settings;
  if (!st.personas.length) st.personas.push({ id: 'p_' + uid(), name: '我', persona: '', avatar: '' });
  if (!st.personas.some(p => p.id === st.activePersona)) st.activePersona = st.personas[0].id;
  if (!st.entries || st.presetVer < PRESET_VER) { st.entries = DEFAULT_ENTRIES(); st.presetVer = PRESET_VER; }
  S.chars = await DB.all('chars');
  S.groups = await DB.all('groups');
  S.rels = (await DB.get('kv', 'rels'))?.value || {};
  S.lastRead = (await DB.get('kv', 'lastRead'))?.value || {};
  await Log.init();
  await migrate();
  await Life.init();
  await Reading.init();
  await WB.init();
  if (!S.settings.geoPatched) {
    const es = S.settings.entries, i = es.findIndex(x => x.name === '当前时间');
    es.splice(i < 0 ? es.length : i + 1, 0,
      { id: uid(), name: '所在地与时差', enabled: true, scope: 'all', position: 'system', role: 'user', depth: 0, content: '【所在地与时差】\n{{所在地}}' });
    S.settings.geoPatched = true;
    await saveSettings();
  }
  await API.loadStats();
  await Pet.init();
  await saveSettings();
  applyTheme();
  clock();
  Router.home();
  if (typeof Social !== 'undefined') Social.start();
}

// 启动失败时，把错误直接显示在屏幕上（这时进不了记忆体检页）
window.addEventListener('load', () => boot().catch(e => {
  console.error(e);
  Log.add('启动失败', e.message);
  screen().innerHTML = `<div class="body"><p class="empty">启动失败：${esc(e.message)}</p>
    ${Log.list.slice(0, 5).map(x => `<p class="empty">${esc(x.title)} ${esc(x.detail)}</p>`).join('')}</div>`;
}));
