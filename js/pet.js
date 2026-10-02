// 宠物：任何页面都能召唤。我养 / 和角色一起养 / 角色自己养
// 作息、生病、成长、遛弯偶遇、角色晒宠物
const PET_C = { E: '#1e1e1e', N: '#1e1e1e', K: '#e8902a', P: '#f4a0b0', R: '#e04a3a', H: '#e8dcb8' };
const SPECIES = {
  chick: { name: '小鸡', map: ['...RR.....', '..BBBB....', '.BBBBBB...', '.BEBBEB...', '.BBKKBB.D.', 'BBBBBBBBD.', 'BWWWWWWB..', 'BWWWWWWB..', '.BBBBBB...', '..K..K....'],
    colors: [{ n: '嫩黄', B: '#f8d838', D: '#d8a818', W: '#fff3b0' }, { n: '奶白', B: '#f4f4ec', D: '#cfcfc0', W: '#ffffff' },
      { n: '小棕', B: '#c89050', D: '#8a5a2a', W: '#f0d8a8' }, { n: '薰衣草灰', B: '#b8b0c8', D: '#8a8098', W: '#ece8f4' }] },
  rabbit: { name: '兔子', map: ['.BB..BB...', '.BP..PB...', '.BP..PB...', '.BBBBBB...', 'BBEBBEBB..', 'BBBPPBBB..', '.BWWWWB...', 'BBWWWWBBW.', 'BBWWWWBB..', '.BB..BB...'],
    colors: [{ n: '雪白', B: '#f8f8f0', D: '#d0d0c8', W: '#ffffff' }, { n: '灰灰', B: '#a8a8a8', D: '#707070', W: '#e0e0e0' }, { n: '奶茶', B: '#d8b888', D: '#a07848', W: '#f4e4c8' }] },
  dog: { name: '狗', map: ['DD....DD..', 'DBBBBBBD..', 'DBEBBEBD..', '.BBNNBB...', '.BWWWWB...', '..BBBB...D', '.BBBBBBBD.', '.BWBBBBBB.', '.BB.BB.BB.', '.DD.DD.DD.'],
    colors: [{ n: '柴犬', B: '#e0a050', D: '#a86828', W: '#fff4e0' }, { n: '黑白', B: '#3a3a3a', D: '#1a1a1a', W: '#f0f0f0', E: '#f0f0f0' }, { n: '奶油', B: '#f0dcb0', D: '#c8a878', W: '#fffaf0' }] },
  wolf: { name: '狼', map: ['B......B..', 'BB....BB..', 'BBBBBBBB..', 'BEBBBBEB..', 'BBWWWWBB..', '.BWNNWB...', '..WWWW....', '.BBBBBBBD.', '.BB.BB.BDD', '.DD.DD....'],
    colors: [{ n: '灰狼', B: '#8a8f98', D: '#50555e', W: '#e4e4e4' }, { n: '白狼', B: '#eeeeee', D: '#b8b8c0', W: '#ffffff' }, { n: '黑狼', B: '#3c3c44', D: '#1c1c22', W: '#a8a8b0', E: '#f0c030' }] },
  cat: { name: '猫', map: ['B.....B...', 'BB...BB...', 'BBBBBBB...', 'BEBBBEB...', 'BBBPBBB..D', '.BBBBB..D.', '.BWWWBBBD.', '.BWWWBBB..', '.BB.B.BB..'],
    colors: [{ n: '橘猫', B: '#f0a040', D: '#c06818', W: '#fff0d8' }, { n: '黑猫', B: '#2e2e34', D: '#121216', W: '#4a4a50', E: '#f0d040' },
      { n: '白猫', B: '#f6f6f6', D: '#c8c8c8', W: '#ffffff' }, { n: '蓝猫', B: '#8898a8', D: '#5a6878', W: '#d8e0e8' },
      // 三花：白底 + 橘色和黑色色块，用单独的点阵
      { n: '三花', W: '#ffffff', O: '#f0a040', D: '#2e2e2e', sw: '#f0a040',
        map: ['O.....D...', 'OO...DD...', 'OOWWWDD...', 'WEWWWEW...', 'WWWPWWW..D', '.WWWWW..O.', '.WWWOODDO.', '.WWWOODD..', '.WW.W.WW..'] }] },
  jelly: { name: '水母', map: ['..BBBBB...', '.BBWBBBB..', 'BBBBBBBBB.', 'BEBBBBEBB.', 'BBBPBBBBB.', '.D.D.D.D..', '.D..D.D...', 'D.D.D..D..', '.D.D..D...'],
    colors: [{ n: '樱花', B: '#f8a8d0', D: '#e070a8', W: '#ffe0f0' }, { n: '海蓝', B: '#90d0f8', D: '#4890d0', W: '#e0f4ff' }, { n: '荧绿', B: '#a8e890', D: '#5fb040', W: '#e8ffd8' }] },
  cheetah: { name: '猎豹', map: ['BB....BB..', 'BBBBBBBB..', 'BEBBBBEB..', 'BDWNNWDB..', '.BWWWWB...', 'BBDBBDBBB.', 'BDBBDBBDBD', '.BB.BB.BB.', '.BB.BB.BB.'],
    colors: [{ n: '金色', B: '#e8b850', D: '#5a3a18', W: '#fff4d8' }, { n: '雪豹', B: '#e0e0d8', D: '#606060', W: '#ffffff' }] },
  tit: { name: '北长尾山雀', map: ['..DDDD....', '.DWWWWD...', 'DWEWWEWD..', 'DWWKWWWD..', 'DPWWWWPDDD', 'DPPWWPPD.D', '.DPPPPD...', '..DDDD....', '...K.K....'],
    colors: [{ n: '雪团', D: '#3a3030', W: '#ffffff', P: '#e8a8b0', K: '#2a2a2a' }, { n: '粉嫩', D: '#7a5a60', W: '#fffafa', P: '#f8b8c8', K: '#5a4a4a' }] },
  cow: { name: '牛', map: ['.H......H.', '.HBBBBBBH.', '..BEBBEB..', '..BBDDBB..', '..PPPPPP..', '..PNPPNP..', 'BBBDDBBBBD', 'BDDBBBDDB.', '.BB.BB.BB.', '.NN.NN.NN.'],
    colors: [{ n: '奶牛', B: '#f4f4f0', D: '#2a2a2a', W: '#ffffff' }, { n: '黄牛', B: '#c08040', D: '#7a4a20', W: '#f0d8b0' }, { n: '草莓牛', B: '#fff0f4', D: '#f490b0', W: '#ffffff' }] },
  frog: { name: '青蛙', map: ['.BB..BB...', 'BEWBBEWB..', 'BBBBBBBB..', 'BDBBBBDB..', '.BBPPBB...', 'BBWWWWBB..', 'BWWWWWWB..', 'BB.BB.BB..'],
    colors: [{ n: '草绿', B: '#7cc850', D: '#3f7a28', W: '#e8f8c8' }, { n: '柠檬', B: '#f0d040', D: '#a08010', W: '#fff8d0' }] },
};

// 成长阶段：k 是体型比例，exp 是需要的成长值
const STAGES = [{ n: '幼崽', k: 0.6, exp: 0 }, { n: '少年', k: 0.8, exp: 30 }, { n: '成年', k: 1, exp: 80 }];
// 睡觉时间（24 小时制），想改作息改这里
const SLEEP = { from: 23, to: 7 };
const DOCTOR_FEE = 20;
const WALK_FLAVOR = ['在草丛里发现了一只蝴蝶', '捡到了一片好看的叶子', '对着路边的小水坑看了半天', '被一只麻雀吓了一跳', '在树下打了个滚', '追着自己的影子跑了一圈'];

const clamp100 = v => Math.max(0, Math.min(100, v));
const cvar = k => getComputedStyle(document.documentElement).getPropertyValue('--' + k).trim() || '#333';

const Pet = {
  list: [], view: 'list', curId: null, fx: [], _raf: 0, game: null, back: null, updStats: null,

  async init() {
    this.list = (await DB.get('kv', 'pets'))?.value || [];
    // 旧宠物：直接算成年，不会突然缩小
    for (const p of this.list) {
      p.exp ??= 80; p.neglect ??= 0; p.sick ??= false; p.lastShow ??= Date.now();
    }
    this.mountFab();
    await this.tickAll();
    setInterval(() => this.tickAll(), 60e3);
  },
  save() { return DB.put('kv', { id: 'pets', value: this.list }); },
  get(id) { return this.list.find(p => p.id === id); },
  me: () => 'p:' + activePid(),
  isMine(p) { return p.owners.includes(this.me()); },
  hasPersona: p => p.owners.some(o => o.startsWith('p:')),
  charOwners: p => p.owners.filter(o => !o.startsWith('p:')).map(charById).filter(Boolean),
  visible(p) { return this.isMine(p) || (!this.hasPersona(p) && this.charOwners(p).length > 0); },
  who(o) {
    if (o === 'sys') return '';
    return o.startsWith('p:') ? (persona(o.slice(2))?.name || '?') : (charById(o)?.name || '?');
  },
  ownerText(p) {
    const ns = p.owners.map(o => o === this.me() ? '我' : this.who(o));
    return (ns.length > 1 ? '一起养：' : '主人：') + ns.join('、');
  },
  mapOf(p) { const s = SPECIES[p.sp]; return s.colors[p.color]?.map || s.map; },
  colorName(p) { return SPECIES[p.sp].colors[p.color]?.n || ''; },
  stage(p) { let i = 0; STAGES.forEach((s, k) => { if ((p.exp || 0) >= s.exp) i = k; }); return i; },

  // ===== 作息 =====
  isNight(ts = Date.now()) {
    const h = new Date(ts).getHours();
    return SLEEP.from > SLEEP.to ? (h >= SLEEP.from || h < SLEEP.to) : (h >= SLEEP.from && h < SLEEP.to);
  },
  asleep(p, ts = Date.now()) { return this.isNight(ts) && !(p.wakeUntil > ts); },

  // ===== 属性 =====
  // 按 15 分钟一段推进，这样跨越睡觉时间、离线很久也算得准
  decay(p, now = Date.now()) {
    let t = Math.max(p.ts || now, now - 14 * 86400e3);
    while (t < now) {
      const step = Math.min(15 * 60e3, now - t), h = step / 3600e3, zz = this.asleep(p, t), k = zz ? 0.5 : 1;
      p.poopAcc = (p.poopAcc || 0) + h / 3.5 * k;
      while (p.poopAcc >= 1) { p.poopAcc--; if (p.poop < 5) p.poop++; }
      p.hunger = clamp100(p.hunger - 8 * h * k);
      if (!zz) p.happy = clamp100(p.happy - 4 * h - (p.hunger < 20 ? 4 * h : 0) - (p.sick ? 6 * h : 0));
      p.clean = clamp100(p.clean - (3 * h + p.poop * 2 * h) * k);
      // 长期没人管会生病
      const bad = p.hunger < 10 || p.clean < 10 || p.poop >= 4;
      p.neglect = bad ? (p.neglect || 0) + h : Math.max(0, (p.neglect || 0) - h / 2);
      if (!p.sick && p.neglect >= 6) { p.sick = true; this.log(p, 'sys', '生病了，需要看医生'); }
      if (!zz && p.hunger > 50 && p.clean > 50 && p.happy > 50) this.grow(p, h);
      t += step;
    }
    p.ts = now;
  },
  grow(p, amount) {
    if (p.sick) return;
    const b = this.stage(p);
    p.exp = (p.exp || 0) + amount;
    const a = this.stage(p);
    if (a > b) { this.log(p, 'sys', `长大了，现在是${STAGES[a].n}`); this.addFx('⭐', 4); }
  },
  mood(p) {
    if (p.sick) return '生病了，蔫蔫的';
    if (this.asleep(p)) return '正在睡觉 💤';
    if (p.hunger < 20) return '饿得咕咕叫';
    if (p.poop >= 3) return '周围有点臭';
    if (p.clean < 25) return '脏兮兮的';
    if (p.happy < 25) return '有点无聊';
    if (p.happy > 80 && p.hunger > 60) return '超开心';
    return '状态还不错';
  },
  log(p, who, text) {
    p.log.unshift({ ts: Date.now(), who, text });
    p.log = p.log.slice(0, 30);
  },

  async act(p, kind, who) {
    this.decay(p);
    const zz = this.asleep(p), mine = who === this.me();
    if (zz && (kind === 'feed' || kind === 'bath')) return `${p.name}睡着了，等它醒了再说`;
    let t;
    if (kind === 'feed') {
      if (p.hunger >= 95) return `${p.name}吃不下了`;
      p.hunger = clamp100(p.hunger + 35); p.happy = clamp100(p.happy + 3); p.poopAcc = (p.poopAcc || 0) + 0.25;
      t = '喂了它'; this.addFx('🍚', 3);
    }
    if (kind === 'clean') {
      if (!p.poop) return '地上很干净';
      p.poop = 0; p.clean = clamp100(p.clean + 10);
      t = '铲了屎'; this.addFx('✨', 3);
    }
    if (kind === 'bath') {
      p.clean = 100; p.happy = clamp100(p.happy + (p.sp === 'cat' ? -8 : 6));
      t = p.sp === 'cat' ? '给它洗了澡（它很不情愿）' : p.sp === 'jelly' ? '给它换了一缸清水' : '给它洗了澡';
      this.addFx('🫧', 5);
    }
    if (kind === 'pet') {
      p.happy = clamp100(p.happy + (zz ? 3 : 8));
      t = zz ? '轻轻摸了摸睡着的它' : '摸了摸它'; this.addFx('♥', 3);
    }
    if (kind === 'wake') {
      if (!zz) return '它本来就醒着';
      p.wakeUntil = Date.now() + 30 * 60e3; p.happy = clamp100(p.happy - 10);
      t = '把它叫醒了（它有点起床气）'; this.addFx('❗', 1);
    }
    if (kind === 'doctor') {
      if (!p.sick) return `${p.name}很健康`;
      if (mine) {
        if (Number(S.settings.wallet.balance) < DOCTOR_FEE) return `余额不足，看医生要 ¥${DOCTOR_FEE}`;
        await Wallet.log(-DOCTOR_FEE, `带${p.name}看医生`);
      }
      p.sick = false; p.neglect = 0; p.happy = clamp100(p.happy + 5);
      t = '带它看了医生，已经好了'; this.addFx('💊', 2);
    }
    if (!t) return '';
    this.log(p, who, t);
    if (kind !== 'wake') this.grow(p, 2);
    return (mine ? '你' : this.who(who)) + t;
  },

  // 角色自动照顾，不调用 AI。和我一起养的照顾得少一些
  async autoCare(p) {
    const cs = this.charOwners(p);
    if (!cs.length) return;
    const withMe = this.hasPersona(p);
    if (p.sick) {
      if (Math.random() < (withMe ? 0.03 : 0.2)) await this.act(p, 'doctor', pick(cs).id);
      return;
    }
    const lim = withMe ? 25 : 40;
    let need = null;
    if (this.asleep(p)) need = p.poop >= 3 ? 'clean' : null;
    else need = p.hunger < lim ? 'feed' : p.poop >= (withMe ? 3 : 2) ? 'clean' : p.clean < lim - 10 ? 'bath' : p.happy < lim ? 'pet' : null;
    if (need && Math.random() < (withMe ? 0.15 : 0.5)) await this.act(p, need, pick(cs).id);
  },

  // 晒宠物：每只最快 12 小时一次，每分钟 1/240 的概率
  maybeShowOff(p) {
    const cs = this.charOwners(p);
    if (!cs.length || !S.settings.proactive?.enabled || !S.settings.claude.key || this.asleep(p)) return;
    if (Date.now() - (p.lastShow || 0) < 12 * 3600e3 || Math.random() > 1 / 240) return;
    p.lastShow = Date.now();
    const c = pick(cs);
    Moments.post(c.id, this.momentPid(p), null, this.showTopic(p, c.id)).catch(e => Log.add('角色晒宠物失败', e.message));
  },
  momentPid(p) {
    const o = p.owners.find(x => x.startsWith('p:'));
    return o && persona(o.slice(2))?.id === o.slice(2) ? o.slice(2) : activePid();
  },
  showTopic(p, charId) {
    const co = p.owners.filter(o => o !== charId).map(o => this.who(o));
    const recent = p.log.slice(0, 2).map(l => this.who(l.who) + l.text).join('；');
    return `这次你想在朋友圈晒一下${co.length ? '和' + co.join('、') + '一起' : '自己'}养的${SPECIES[p.sp].name}「${p.name}」（${this.colorName(p)}，${STAGES[this.stage(p)].n}），它现在${this.mood(p)}。${recent ? '最近：' + recent + '。' : ''}配一两张宠物的照片。`;
  },

  async tickAll() {
    for (const p of this.list) { this.decay(p); await this.autoCare(p); this.maybeShowOff(p); }
    await this.save();
    if (this.view === 'pet' && !$('#pet-root')?.hidden) this.updStats?.();
    this.drawFab();
  },

  // 给角色提示词用
  contextLines(charId, pid) {
    return this.list.filter(p => p.owners.includes(charId) && (p.owners.includes('p:' + pid) || !this.hasPersona(p))).map(p => {
      this.decay(p);
      const co = p.owners.filter(o => o !== charId).map(o => this.who(o));
      const recent = p.log.slice(0, 3).map(l => `${this.who(l.who)}${l.text}（${ChatUI.timeLabel(l.ts)}）`).join('；');
      return { ts: p.log[0]?.ts || p.born, t: `[宠物] ${charById(charId)?.name}${co.length ? '和' + co.join('、') + '一起' : '自己'}养的${SPECIES[p.sp].name}「${p.name}」（${STAGES[this.stage(p)].n}），现在${this.mood(p)}${recent ? '。最近：' + recent : ''}` };
    });
  },

  // ===== 绘制 =====
  palette(p) { const s = SPECIES[p.sp]; return { ...PET_C, ...(s.colors[p.color] || s.colors[0]) }; },
  drawSprite(ctx, p, x, y, s, o = {}) {
    const map = this.mapOf(p), pal = this.palette(p);
    map.forEach((row, j) => [...row].forEach((ch, i) => {
      if (ch === '.') return;
      const c = ch === 'E' && o.blink ? pal.B || pal.W : pal[ch];
      if (!c) return;
      ctx.fillStyle = c;
      ctx.fillRect(x + (o.flip ? row.length - 1 - i : i) * s, y + j * s, s, s);
    }));
  },
  drawMini(cv, p) {
    const ctx = cv.getContext('2d'), map = this.mapOf(p);
    const s = Math.floor(cv.width / (Math.max(map[0].length, map.length) + 1));
    ctx.clearRect(0, 0, cv.width, cv.height);
    this.drawSprite(ctx, p, Math.floor((cv.width - map[0].length * s) / 2), Math.floor((cv.height - map.length * s) / 2), s);
  },
  addFx(ch, n) {
    for (let i = 0; i < n; i++) this.fx.push({ ch, x: 90 + Math.random() * 60, y: 90 + Math.random() * 20, life: 1 + i * 0.15 });
  },

  // ===== 悬浮按钮：transform 定位，不撑宽页面；位置按比例保存 =====
  mountFab() {
    const SIZE = 52;
    const b = document.createElement('button');
    b.id = 'pet-fab';
    b.setAttribute('aria-label', '召唤宠物');
    b.innerHTML = '<canvas width="48" height="48"></canvas>';
    document.body.appendChild(b);

    let fx = 0, fy = 0;
    const place = (x, y) => {
      const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
      fx = Math.max(4, Math.min(vw - SIZE - 4, x));
      fy = Math.max(4, Math.min(vh - SIZE - 4, y));
      b.style.transform = `translate(${fx}px, ${fy}px)`;
    };
    // 存的是比例（0~1），兼容旧版存的像素值
    const restore = () => {
      const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
      const s = S.settings.petFab;
      if (s && s.rx != null) place(s.rx * vw, s.ry * vh);
      else place(vw - SIZE - 12, vh - SIZE - 110);
    };
    restore();
    addEventListener('resize', restore);
    addEventListener('orientationchange', () => setTimeout(restore, 300));

    let sx = null, sy, ox, oy, moved = false;
    b.onpointerdown = e => {
      sx = e.clientX; sy = e.clientY; ox = fx; oy = fy; moved = false;
      b.setPointerCapture(e.pointerId);
    };
    b.onpointermove = e => {
      if (sx == null) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 6) return;
      moved = true;
      place(ox + dx, oy + dy);
    };
    b.onpointerup = () => {
      sx = null;
      if (!moved) return this.toggle();
      const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
      S.settings.petFab = { rx: fx / vw, ry: fy / vh };
      saveSettings();
    };
    b.onpointercancel = () => { sx = null; };

    this.startFabAnim();
  },

  // 宠物有变化时调用，动画循环下一帧会自动用新的宠物
  drawFab() {},

  fabPet() {
    return this.list.find(p => this.isMine(p)) || { sp: 'chick', color: 0, demo: true };
  },

  // 动态图标：走路 / 跳 / 眨眼 / 趴下 / 睡觉 / 生病
  startFabAnim() {
    const cv = $('#pet-fab canvas'), ctx = cv.getContext('2d');
    const off = document.createElement('canvas'), octx = off.getContext('2d');
    const W = 48, GROUND = 45, S3 = 3;
    let last = 0, mode = 'idle', until = 0, x = 9, dir = 1, frame = 0, zs = [];

    const pickMode = (p, now) => {
      if (!p.demo) {
        if (this.asleep(p)) return 'sleep';
        if (p.sick) return 'sick';
        if (p.hunger < 20 || p.happy < 25) return 'lie';
      }
      if (now < until && !['sleep', 'sick'].includes(mode)) return mode;
      until = now + 3000 + Math.random() * 3000;
      return pick(['walk', 'walk', 'hop', 'idle', 'lie']);
    };

    const loop = now => {
      this._fabRaf = requestAnimationFrame(loop);
      if (document.hidden || now - last < 100) return;
      last = now;
      frame++;

      const p = this.fabPet();
      if (!p.demo) this.decay(p);
      mode = pickMode(p, now);

      const map = this.mapOf(p), w = map[0].length * S3, h = map.length * S3;
      const blink = mode === 'sleep' || now % 3200 < 160;
      off.width = w; off.height = h;
      octx.clearRect(0, 0, w, h);
      this.drawSprite(octx, p, 0, 0, S3, { blink, flip: dir < 0 });

      ctx.clearRect(0, 0, W, W);
      ctx.imageSmoothingEnabled = false;
      const maxX = W - w;
      if (x > maxX) x = maxX;

      if (mode === 'walk') {
        x += dir * 1.5;
        if (x <= 0 || x >= maxX) { dir *= -1; x = Math.max(0, Math.min(maxX, x)); }
        ctx.drawImage(off, Math.round(x), GROUND - h - (frame % 2), w, h);
      } else if (mode === 'hop') {
        const ph = (now % 700) / 700;
        const jump = ph < 0.15 ? 0 : Math.sin((ph - 0.15) / 0.85 * Math.PI) * 9;
        const squash = ph < 0.15 ? 0.85 : 1; // 起跳前压扁一下
        const hh = Math.round(h * squash);
        ctx.drawImage(off, Math.round(x), Math.round(GROUND - hh - jump), w, hh);
      } else if (mode === 'idle') {
        ctx.drawImage(off, Math.round(x), GROUND - h, w, h);
      } else {
        // lie / sleep / sick：压扁、稍微变宽，看起来像趴着
        const hh = Math.round(h * 0.72), ww = Math.min(W, Math.round(w * 1.1));
        const jitter = mode === 'sick' ? (frame % 2 ? 1 : -1) : 0;
        const lx = Math.max(0, Math.min(W - ww, Math.round(x) + jitter));
        ctx.drawImage(off, lx, GROUND - hh, ww, hh);

        if (mode === 'sleep' && frame % 12 === 0) zs.push({ x: lx + ww - 4, y: GROUND - hh, life: 1 });
        if (mode === 'sick' && frame % 16 === 0) zs.push({ x: lx + 2, y: GROUND - hh, life: 1, ch: '💧' });
      }

      ctx.textAlign = 'center';
      zs = zs.filter(z => z.life > 0);
      for (const z of zs) {
        ctx.globalAlpha = z.life;
        ctx.font = z.ch ? '9px sans-serif' : 'bold 10px monospace';
        ctx.fillStyle = '#1e2a10';
        ctx.fillText(z.ch || 'z', z.x, z.y);
        z.y -= 1.2; z.x += z.ch ? 0 : 0.4; z.life -= 0.08;
      }
      ctx.globalAlpha = 1;
    };
    cancelAnimationFrame(this._fabRaf);
    this._fabRaf = requestAnimationFrame(loop);
  },
 
  // ===== 面板 =====
  show(html) {
    let root = $('#pet-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'pet-root';
      root.onclick = e => { if (e.target === root) this.close(); };
      document.body.appendChild(root);
    }
    root.hidden = false;
    root.innerHTML = `<div class="pet-panel card" role="dialog" aria-label="宠物">${html}</div>`;
    const el = $('.pet-panel', root);
    el.addEventListener('click', e => {
      const a = e.target.closest('[data-pa]')?.dataset.pa;
      if (a === 'close') this.close();
      if (a === 'back') this.back?.();
    });
    return el;
  },
  head(title, back = true) {
    return `<div class="pet-head">${back ? '<button class="btn ghost" data-pa="back" aria-label="返回">◀</button>' : '<span></span>'}
      <b>${esc(title)}</b><button class="btn ghost" data-pa="close" aria-label="关闭">✕</button></div>`;
  },
  stopAll() {
    cancelAnimationFrame(this._raf);
    this._raf = 0;
    this.game?.stop?.();
    this.game = null;
    this.updStats = null;
  },
  close() { this.stopAll(); this.view = 'list'; const r = $('#pet-root'); if (r) r.hidden = true; },
  toggle() {
    const r = $('#pet-root');
    if (r && !r.hidden) return this.close();
    const p = this.get(this.curId);
    p && this.visible(p) ? this.renderPet() : this.renderList();
  },

  renderList() {
    this.stopAll(); this.view = 'list'; this.back = null;
    const vis = this.list.filter(p => this.visible(p));
    const row = p => `<button class="item" data-pid="${p.id}"><canvas class="pet-mini" width="36" height="36" data-mini="${p.id}"></canvas>
      <div class="grow"><b>${esc(p.name)}</b><small class="ellipsis">${SPECIES[p.sp].name} · ${STAGES[this.stage(p)].n} · ${esc(this.ownerText(p))} · ${this.mood(p)}</small></div></button>`;
    const mine = vis.filter(p => this.isMine(p)), theirs = vis.filter(p => !this.isMine(p));
    const el = this.show(this.head('宠物', false) + `
      <h3>我养的</h3>${mine.map(row).join('') || '<p class="empty">还没有</p>'}
      <h3>角色们养的</h3>${theirs.map(row).join('') || '<p class="empty">还没有</p>'}
      <button class="btn" data-pa="adopt" style="margin-top:8px">＋ 领养</button>`);
    $$('[data-mini]', el).forEach(c => this.drawMini(c, this.get(c.dataset.mini)));
    el.addEventListener('click', e => {
      if (e.target.closest('[data-pa="adopt"]')) return this.renderAdopt();
      const it = e.target.closest('[data-pid]');
      if (it) { this.curId = it.dataset.pid; this.renderPet(); }
    });
  },

  renderPet() {
    const p = this.get(this.curId);
    if (!p) return this.renderList();
    this.stopAll(); this.view = 'pet'; this.back = () => this.renderList();
    this.decay(p);
    const can = this.isMine(p), zz = this.asleep(p), cs = this.charOwners(p);
    const acts = zz
      ? '<button class="btn" data-do="clean">🧹 铲屎</button><button class="btn" data-do="pet">🤚 轻轻摸</button><button class="btn ghost" data-do="wake">⏰ 叫醒</button>'
      : `<button class="btn" data-do="feed">🍚 喂食</button><button class="btn" data-do="clean">🧹 铲屎</button>
         <button class="btn" data-do="bath">🛁 洗澡</button><button class="btn" data-do="pet">🤚 摸摸</button>
         ${p.sick ? '' : '<button class="btn" data-walk>🦮 遛弯</button>'}`;
    const el = this.show(this.head(p.name) + `
      <canvas id="pet-stage" width="240" height="160" aria-label="${esc(p.name)}的小窝"></canvas>
      <p class="pet-mood" id="pet-mood"></p><div id="pet-bars"></div>
      ${can ? `<div class="pet-acts">${acts}${p.sick ? `<button class="btn" data-do="doctor">🏥 看医生 ¥${DOCTOR_FEE}</button>` : ''}</div>
        <h3>小游戏</h3>${zz || p.sick ? `<p class="empty">${p.sick ? '生病了，先去看医生吧' : '睡着了，等它醒了再玩'}</p>` : `<div class="pet-acts">
        <button class="btn ghost" data-game="catch">🍎 接食物</button><button class="btn ghost" data-game="run">🏃 跑酷</button>
        <button class="btn ghost" data-game="box">📦 推箱子</button></div>`}`
        : '<p class="empty">这是角色们自己养的，你只能看看。</p>'}
      ${cs.length && S.settings.claude.key ? '<button class="btn ghost" data-pa="show">📸 让主人晒一下</button>' : ''}
      <h3>动态</h3><div class="pet-log" id="pet-log"></div>
      <small>${esc(this.ownerText(p))}</small>
      ${can ? '<button class="btn ghost" data-pa="edit" style="margin-top:8px">⚙ 设置</button>' : ''}`);

    const bar = (l, v) => `<div class="pet-bar"><span>${l}</span><div class="pet-track"><i style="width:${Math.round(v)}%"></i></div><small>${Math.round(v)}</small></div>`;
    this.updStats = () => {
      const si = this.stage(p), nx = STAGES[si + 1];
      $('#pet-mood').textContent = `${SPECIES[p.sp].name} · ${STAGES[si].n} · ${this.mood(p)}`;
      $('#pet-bars').innerHTML = bar('🍖 饱腹', p.hunger) + bar('🧼 清洁', p.clean) + bar('😊 心情', p.happy)
        + (nx ? bar('🌱 成长', (p.exp - STAGES[si].exp) / (nx.exp - STAGES[si].exp) * 100) : '')
        + `<small>💩 便便 ${p.poop} 个${nx ? ` · 再长 ${Math.ceil(nx.exp - p.exp)} 点变成${nx.n}` : ' · 已经长大啦'}</small>`;
      $('#pet-log').innerHTML = p.log.slice(0, 8).map(l => `<div><small>${ChatUI.timeLabel(l.ts)}</small> ${esc(l.who === this.me() ? '我' : this.who(l.who))}${esc(l.text)}</div>`).join('') || '<p class="empty">还没有动态</p>';
    };
    this.updStats();

    // 小窝动画：走来走去、眨眼、睡觉、生病、便便、特效
    const cv = $('#pet-stage'), ctx = cv.getContext('2d'), map = this.mapOf(p);
    const w = map[0].length, h = map.length;
    const s = Math.max(2, Math.round(Math.floor(100 / Math.max(w, h)) * STAGES[this.stage(p)].k));
    let x = (240 - w * s) / 2, dir = 1, lastFx = 0;
    const t0 = performance.now();
    const loop = now => {
      const t = (now - t0) / 1000, sleeping = this.asleep(p);
      ctx.fillStyle = cvar('them'); ctx.fillRect(0, 0, 240, 160);
      ctx.fillStyle = cvar('accent2'); ctx.fillRect(0, 150, 240, 10);
      const moving = !sleeping && !p.sick && p.happy > 25 && p.hunger > 20;
      if (moving) { x += dir * 0.5; if (x < 8 || x > 232 - w * s) dir *= -1; }
      const bob = moving && Math.floor(t * 3) % 2 ? Math.floor(s / 2) : 0;
      const top = 150 - h * s - bob;
      ctx.fillStyle = '#7a4a20';
      [14, 210, 40, 186, 66].slice(0, p.poop).forEach(px => { ctx.fillRect(px, 142, 10, 8); ctx.fillRect(px + 2, 136, 6, 6); ctx.fillRect(px + 3, 132, 3, 4); });
      this.drawSprite(ctx, p, Math.round(x), top, s, { blink: sleeping || t % 3 < 0.15, flip: dir < 0 });
      if (sleeping) {
        ctx.fillStyle = 'rgba(20,24,60,.4)'; ctx.fillRect(0, 0, 240, 160);
        ctx.font = '18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🌙', 216, 26);
      }
      if ((sleeping || p.sick) && now - lastFx > (sleeping ? 1500 : 2500)) {
        lastFx = now;
        this.fx.push({ ch: sleeping ? 'z' : '🤒', x: x + w * s, y: top, life: 1.2 });
      }
      ctx.font = '18px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = cvar('text');
      this.fx = this.fx.filter(f => f.life > 0);
      for (const f of this.fx) { ctx.globalAlpha = Math.min(1, f.life); ctx.fillText(f.ch, f.x, f.y); f.y -= 0.7; f.life -= 0.015; }
      ctx.globalAlpha = 1;
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);

    el.addEventListener('click', async e => {
      const d = e.target.closest('[data-do]')?.dataset.do;
      if (d) {
        const before = `${this.asleep(p)}|${p.sick}`;
        const msg = await this.act(p, d, this.me());
        if (msg) toast(msg);
        await this.save();
        // 睡醒或病好了，按钮要换，整个重画
        return `${this.asleep(p)}|${p.sick}` !== before ? this.renderPet() : this.updStats();
      }
      if (e.target.closest('[data-walk]')) return this.renderWalk(p);
      const g = e.target.closest('[data-game]')?.dataset.game;
      if (g) return this.renderGame(g);
      const a = e.target.closest('[data-pa]')?.dataset.pa;
      if (a === 'edit') this.renderAdopt(p);
      if (a === 'show') {
        const c = pick(cs);
        p.lastShow = Date.now();
        await this.save();
        toast(`${c.name}正在发朋友圈…`);
        const r = await Moments.post(c.id, this.momentPid(p), null, this.showTopic(p, c.id));
        toast(r ? '发好了，去朋友圈看看' : '发送失败');
      }
    });
  },

  // ===== 遛弯 =====
  renderWalk(p) {
    if (this.asleep(p) || p.sick) return toast(p.sick ? '生病了，先看医生' : '它在睡觉');
    this.stopAll(); this.view = 'walk'; this.back = () => this.renderPet();
    const el = this.show(this.head('遛弯') + `<canvas id="walk-cv" class="pg-cv" width="300" height="140" aria-label="遛弯小路"></canvas>
      <div id="walk-txt" class="pet-walk"><p class="empty">出门啦…</p></div><div id="walk-ui"></div>`);
    const cv = $('#walk-cv', el), ctx = cv.getContext('2d'), pid = activePid();
    const sizeOf = x => Math.max(2, Math.round(3 * STAGES[this.stage(x)].k));
    const map = this.mapOf(p), s = sizeOf(p);
    // 能偶遇的：只属于角色的宠物（别的人设的宠物不出现）
    const cands = this.list.filter(x => x.id !== p.id && !this.hasPersona(x) && this.charOwners(x).length);
    let enc = null, owner = null;
    if (cands.length && Math.random() < 0.75) { enc = pick(cands); owner = pick(this.charOwners(enc)); }
    let off = 0, ex = 330, phase = 'walk';
    const t0 = performance.now();
    const loop = now => {
      const t = (now - t0) / 1000;
      if (phase !== 'meet') off += 1.5;
      ctx.fillStyle = cvar('them'); ctx.fillRect(0, 0, 300, 140);
      // 远处的树
      for (let i = 0; i < 5; i++) {
        const tx = ((i * 80 - off * 0.5) % 400 + 400) % 400 - 50;
        ctx.fillStyle = cvar('accent2'); ctx.fillRect(tx, 50, 26, 30);
        ctx.fillStyle = cvar('border'); ctx.fillRect(tx + 10, 80, 6, 40);
      }
      ctx.fillStyle = cvar('accent2'); ctx.fillRect(0, 120, 300, 20);
      ctx.fillStyle = cvar('border');
      for (let i = 0; i < 9; i++) ctx.fillRect(((i * 40 - off) % 360 + 360) % 360 - 20, 128, 12, 3);
      const bob = phase !== 'meet' && Math.floor(t * 4) % 2 ? 1 : 0;
      this.drawSprite(ctx, p, 60, 120 - map.length * s - bob, s);
      if (enc && phase === 'meet') {
        const es = sizeOf(enc), em = this.mapOf(enc);
        ex += (190 - ex) * 0.05;
        this.drawSprite(ctx, enc, Math.round(ex), 120 - em.length * es, es, { flip: true });
        if (Math.abs(ex - 190) < 2 && Math.floor(t * 2) % 2) { ctx.font = '14px sans-serif'; ctx.fillText('♥', 150, 70); }
      }
      if (t > 3 && phase === 'walk') { phase = enc ? 'meet' : 'flavor'; event(); }
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);

    const event = async () => {
      const box = $('#walk-txt', el);
      this.decay(p);
      p.happy = clamp100(p.happy + 15); p.hunger = clamp100(p.hunger - 8); p.clean = clamp100(p.clean - 10);
      this.grow(p, 3);
      if (!enc) {
        const f = pick(WALK_FLAVOR);
        box.innerHTML = `<p>${esc(p.name)}${esc(f)}。</p>`;
        this.log(p, this.me(), `带它去遛弯，它${f}`);
      } else {
        const head = `<p>遇到了${esc(owner.name)}和 TA 的${SPECIES[enc.sp].name}「${esc(enc.name)}」</p>`;
        box.innerHTML = head;
        this.decay(enc);
        enc.happy = clamp100(enc.happy + 10);
        let said = '';
        if (!knows(pid, owner.id)) {
          box.innerHTML += `<p class="empty">${esc(owner.name)}不认识你，点点头就走开了。两只小家伙倒是互相闻了闻。</p>`;
        } else if (S.settings.claude.key) {
          box.innerHTML += '<p class="empty">…</p>';
          try {
            const ls = await this.encounterChat(p, enc, owner);
            said = ls[0] || '';
            box.innerHTML = head + ls.map(l => `<div class="pet-say"><b>${esc(owner.name)}</b>：${esc(l)}</div>`).join('');
          } catch (err) {
            Log.add('遛弯对话生成失败', err.message);
            box.innerHTML = head + `<p class="empty">${esc(owner.name)}朝你挥了挥手。</p>`;
          }
        }
        // 两只宠物的动态里都记一笔，角色聊天时会知道
        const text = `遛弯时遇到了${owner.name}和「${enc.name}」${said ? `，${owner.name}说："${said.slice(0, 40)}"` : ''}`;
        this.log(p, this.me(), text);
        this.log(enc, this.me(), text);
      }
      await this.save();
      $('#walk-ui', el).innerHTML = '<button class="btn" data-pa="back" style="margin-top:8px">回家</button>';
    };
  },

  async encounterChat(p, enc, owner) {
    const me = persona(activePid()), rel = getRel(me.id, owner.id);
    const system = [
      `你在扮演${owner.name}。`,
      `【${owner.name}的设定】\n${owner.persona || '（无）'}`,
      `【和${me.name}的关系】${rel.desc || '认识'}`,
      WB.build([owner.id], '').constant && `【世界设定】\n${WB.build([owner.id], '').constant}`,
      `【场景】${owner.name}正在遛自己养的${SPECIES[enc.sp].name}「${enc.name}」，路上偶遇了正在遛${SPECIES[p.sp].name}「${p.name}」的${me.name}。「${p.name}」是${STAGES[this.stage(p)].n}，${this.mood(p)}。`,
      `【要求】\n- 只写${owner.name}当面说的话，1 到 3 句，每句一行。\n- 口语化，符合性格，可以夸对方的宠物、聊自己的宠物，或者顺口聊两句别的。\n- 不写动作、神态和旁白，不加名字前缀。`,
    ].filter(Boolean).join('\n\n');
    const out = await API.claude(system, [{ role: 'user', content: `现在是${nowText()}。${Weather.text()}` }], { maxTokens: 300 });
    const pre = new RegExp('^' + escRe(owner.name) + '\\s*[:：]\\s*');
    return out.split('\n').map(l => l.trim().replace(pre, '').replace(/^["“]|["”]$/g, ''))
      .filter(l => l && !/^[（(].*[)）]$/.test(l)).slice(0, 3);
  },

  renderAdopt(edit = null) {
    this.stopAll(); this.view = 'adopt';
    this.back = edit ? () => this.renderPet() : () => this.renderList();
    const pid = activePid();
    const st = { sp: edit?.sp || 'chick', color: edit?.color || 0, name: edit?.name || '', owners: edit ? [...edit.owners] : ['p:' + pid] };
    const draw = () => {
      const el = this.show(this.head(edit ? '宠物设置' : '领养') + `
        ${edit ? '' : `<div class="pet-grid">${Object.entries(SPECIES).map(([k, v]) => `<button class="pet-sp ${st.sp === k ? 'on' : ''}" data-sp="${k}" aria-label="${v.name}">
          <canvas width="40" height="40" data-spc="${k}"></canvas><small>${v.name}</small></button>`).join('')}</div>`}
        <h3>花色</h3><div class="flex" style="flex-wrap:wrap;gap:6px">${SPECIES[st.sp].colors.map((c, i) =>
          `<button class="btn ${st.color === i ? '' : 'ghost'}" data-color="${i}"><span class="swatch" style="background:${c.sw || c.B || c.W}"></span>${c.n}</button>`).join('')}</div>
        <div style="text-align:center"><canvas id="pet-prev" width="96" height="96"></canvas></div>
        <label class="field"><span>名字</span><input id="pet-name" value="${esc(st.name)}" placeholder="${SPECIES[st.sp].name}" maxlength="12"></label>
        <h3>谁来养</h3><div class="card">
          <label class="row"><span>我（${esc(persona(pid).name)}）</span><input type="checkbox" data-own="p:${pid}" ${st.owners.includes('p:' + pid) ? 'checked' : ''}></label>
          ${S.chars.map(c => `<label class="row"><span>${esc(c.name)}</span><input type="checkbox" data-own="${c.id}" ${st.owners.includes(c.id) ? 'checked' : ''}></label>`).join('')}
        </div>
        <p class="empty">不勾"我"就是角色自己养。一起养的人之间必须互相认识。${edit ? '' : '新领养的是幼崽，好好照顾会慢慢长大。'}</p>
        <button class="btn" data-pa="ok">${edit ? '保存' : '领养'}</button>
        ${edit ? '<button class="btn danger" data-pa="release" style="margin-top:8px">送养（删除）</button>' : ''}`);
      $$('[data-spc]', el).forEach(c => this.drawMini(c, { sp: c.dataset.spc, color: 0 }));
      this.drawMini($('#pet-prev', el), st);
      $('#pet-name', el).oninput = e => { st.name = e.target.value.trim(); };
      $$('[data-own]', el).forEach(c => c.onchange = () => { st.owners = $$('[data-own]', el).filter(x => x.checked).map(x => x.dataset.own); });
      el.addEventListener('click', async e => {
        const sp = e.target.closest('[data-sp]')?.dataset.sp;
        if (sp) { st.sp = sp; st.color = 0; return draw(); }
        const ci = e.target.closest('[data-color]')?.dataset.color;
        if (ci != null) { st.color = Number(ci); return draw(); }
        const a = e.target.closest('[data-pa]')?.dataset.pa;
        if (a === 'ok') return submit();
        if (a === 'release' && await confirmBox(`送养${edit.name}（会删除它）`)) {
          this.list = this.list.filter(x => x !== edit);
          this.curId = null;
          await this.save();
          this.drawFab();
          this.renderList();
        }
      });
    };
    const submit = async () => {
      const own = st.owners, chars = own.filter(o => !o.startsWith('p:'));
      if (!own.length) return toast('至少选一个主人');
      if (own.includes('p:' + pid)) {
        const x = chars.find(c => !knows(pid, c));
        if (x) return toast(`${charById(x).name}和你还不认识`);
      }
      for (let i = 0; i < chars.length; i++) for (let j = i + 1; j < chars.length; j++) {
        if (!knows(chars[i], chars[j])) return toast(`${charById(chars[i]).name}和${charById(chars[j]).name}不认识，没法一起养`);
      }
      const name = st.name || SPECIES[st.sp].name;
      if (edit) Object.assign(edit, { color: st.color, name, owners: own });
      else {
        const p = { id: uid(), sp: st.sp, color: st.color, name, owners: own, hunger: 80, clean: 100, happy: 80, poop: 0, poopAcc: 0,
          exp: 0, neglect: 0, sick: false, ts: Date.now(), born: Date.now(), lastShow: Date.now(), log: [] };
        this.log(p, own[0], '领养了它');
        this.list.push(p);
        this.curId = p.id;
      }
      await this.save();
      this.drawFab();
      this.visible(this.get(this.curId)) ? this.renderPet() : this.renderList();
    };
    draw();
  },

  // ===== 小游戏 =====
  renderGame(kind) {
    const p = this.get(this.curId), G = PetGames[kind];
    if (this.asleep(p) || p.sick) return toast(p.sick ? '生病了，先看医生' : '它在睡觉');
    this.stopAll(); this.view = 'game'; this.back = () => this.renderPet();
    const el = this.show(this.head(G.name) + `<p class="empty">${G.tip}</p>
      <div style="text-align:center"><canvas id="pg-cv" class="pg-cv" width="${G.w}" height="${G.h}"></canvas></div><div id="pg-ui"></div>`);
    this.game = G.start(p, $('#pg-cv', el), $('#pg-ui', el), score => this.finish(p, G.name, score));
  },
  async finish(p, gname, score) {
    this.decay(p);
    p.happy = clamp100(p.happy + Math.min(30, 5 + score));
    p.hunger = clamp100(p.hunger - 5);
    this.grow(p, 3);
    this.log(p, this.me(), `陪它玩了${gname}（${score} 分）`);
    const coins = Math.min(5, Math.floor(score / 5));
    if (coins) await Wallet.log(coins, `和${p.name}玩${gname}`);
    await this.save();
    toast(`得分 ${score}${coins ? `，钱包 +¥${coins}` : ''}`, 2500);
  },
};

function gameOverUI(ui, kind) {
  ui.innerHTML = `<div class="pet-acts"><button class="btn" data-again>再来一次</button><button class="btn ghost" data-pa="back">返回</button></div>`;
  $('[data-again]', ui).onclick = () => Pet.renderGame(kind);
}

const PetGames = {
  catch: {
    name: '接食物', tip: '左右拖动，接住掉下来的食物，躲开辣椒。30 秒。', w: 240, h: 300,
    start(p, cv, ui, done) {
      const ctx = cv.getContext('2d'), map = Pet.mapOf(p), s = 3, pw = map[0].length * s, ph = map.length * s;
      const FOODS = ['🍎', '🍙', '🥕', '🍓', '🐟'];
      let px = 120 - pw / 2, tx = px, items = [], score = 0, last = 0, raf;
      const t0 = performance.now();
      const setX = e => { const r = cv.getBoundingClientRect(); tx = (e.clientX - r.left) * cv.width / r.width - pw / 2; };
      cv.onpointerdown = setX;
      cv.onpointermove = setX;
      const loop = now => {
        const t = (now - t0) / 1000;
        if (now - last > 550 && t < 30) {
          last = now;
          const bad = Math.random() < 0.18;
          items.push({ x: 12 + Math.random() * 216, y: -10, v: 1.6 + Math.random() * 1.4 + t / 15, ch: bad ? '🌶️' : pick(FOODS), bad });
        }
        px += (tx - px) * 0.25;
        px = Math.max(0, Math.min(cv.width - pw, px));
        ctx.fillStyle = cvar('them'); ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.font = '18px sans-serif'; ctx.textAlign = 'center';
        for (const it of items) {
          it.y += it.v;
          ctx.fillText(it.ch, it.x, it.y);
          if (it.y > cv.height - ph - 4 && it.y < cv.height && it.x > px - 8 && it.x < px + pw + 8) {
            it.hit = true;
            score = Math.max(0, score + (it.bad ? -3 : 1));
          }
        }
        items = items.filter(i => !i.hit && i.y < cv.height + 20);
        Pet.drawSprite(ctx, p, Math.round(px), cv.height - ph - 2, s);
        ctx.fillStyle = cvar('text'); ctx.textAlign = 'left'; ctx.font = '14px monospace';
        ctx.fillText(`分数 ${score}  剩余 ${Math.max(0, Math.ceil(30 - t))}s`, 6, 18);
        if (t >= 30) { done(score); gameOverUI(ui, 'catch'); return; }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return { stop() { cancelAnimationFrame(raf); } };
    },
  },

  run: {
    name: '跑酷', tip: '点画面（或按空格）跳过障碍。', w: 300, h: 160,
    start(p, cv, ui, done) {
      const ctx = cv.getContext('2d'), map = Pet.mapOf(p), s = 2, pw = map[0].length * s, ph = map.length * s, G = 140, PX = 40;
      let y = G - ph, vy = 0, obs = [], dist = 0, score = 0, next = 80, raf, over = false;
      const jump = () => { if (!over && y >= G - ph - 0.5) vy = -7.2; };
      const key = e => { if (e.code === 'Space' || e.key === 'ArrowUp') { e.preventDefault(); jump(); } };
      cv.onpointerdown = jump;
      addEventListener('keydown', key);
      const loop = () => {
        const speed = 3 + dist / 1500;
        dist += speed;
        vy += 0.42;
        y = Math.min(G - ph, y + vy);
        next -= speed;
        if (next <= 0) { obs.push({ x: cv.width, w: 10 + Math.random() * 10, h: 14 + Math.random() * 16 }); next = 140 + Math.random() * 160; }
        ctx.fillStyle = cvar('them'); ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.fillStyle = cvar('border'); ctx.fillRect(0, G, cv.width, 2);
        for (const o of obs) {
          o.x -= speed;
          if (!o.passed && o.x + o.w < PX) { o.passed = true; score++; }
          ctx.fillStyle = cvar('accent2'); ctx.fillRect(o.x, G - o.h, o.w, o.h);
          ctx.strokeStyle = cvar('border'); ctx.lineWidth = 2; ctx.strokeRect(o.x, G - o.h, o.w, o.h);
          if (PX + pw - 3 > o.x && PX + 3 < o.x + o.w && y + ph > G - o.h + 2) over = true;
        }
        obs = obs.filter(o => o.x + o.w > -5);
        Pet.drawSprite(ctx, p, PX, Math.round(y), s, { blink: over });
        ctx.fillStyle = cvar('text'); ctx.font = '14px monospace'; ctx.textAlign = 'left';
        ctx.fillText(`分数 ${score}`, 6, 18);
        if (over) { done(score); gameOverUI(ui, 'run'); return; }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return { stop() { cancelAnimationFrame(raf); removeEventListener('keydown', key); } };
    },
  },

  // # 墙  . 目标  $ 箱子  * 箱子在目标上  @ 宠物
  box: {
    name: '推箱子', tip: '把箱子推到 ✕ 上。可以点方向键、滑动画面或用键盘。', w: 224, h: 224,
    levels: [
      ['######', '#    #', '# @$.#', '#    #', '######'],
      ['#######', '#     #', '# $#. #', '# @   #', '#  $. #', '#######'],
      ['#######', '#.  $ #', '# #  @#', '#  $  #', '#  .  #', '#######'],
    ],
    start(p, cv, ui, done) {
      const ctx = cv.getContext('2d'), levels = this.levels;
      let li = 0, solved = 0, finished = false, grid, pl, boxes, goals, cs;
      const boxAt = (x, y) => boxes.find(b => b.x === x && b.y === y);
      const wall = (x, y) => (grid[y]?.[x] ?? '#') === '#';
      const load = () => {
        grid = levels[li]; boxes = []; goals = [];
        grid.forEach((row, y) => [...row].forEach((ch, x) => {
          if (ch === '@') pl = { x, y };
          if (ch === '$' || ch === '*') boxes.push({ x, y });
          if (ch === '.' || ch === '*') goals.push({ x, y });
        }));
        cs = Math.floor(224 / Math.max(grid[0].length, grid.length));
        cv.width = grid[0].length * cs;
        cv.height = grid.length * cs;
        draw();
      };
      const draw = () => {
        ctx.fillStyle = cvar('them'); ctx.fillRect(0, 0, cv.width, cv.height);
        grid.forEach((row, y) => [...row].forEach((ch, x) => {
          if (ch !== '#') return;
          ctx.fillStyle = cvar('accent2'); ctx.fillRect(x * cs, y * cs, cs, cs);
          ctx.fillStyle = cvar('border'); ctx.fillRect(x * cs, y * cs + cs - 3, cs, 3); ctx.fillRect(x * cs + cs - 3, y * cs, 3, cs);
        }));
        ctx.fillStyle = cvar('border'); ctx.font = `${cs * 0.6}px monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (const g of goals) ctx.fillText('✕', g.x * cs + cs / 2, g.y * cs + cs / 2);
        for (const b of boxes) {
          const on = goals.some(g => g.x === b.x && g.y === b.y);
          ctx.fillStyle = on ? cvar('me') : cvar('accent');
          ctx.fillRect(b.x * cs + 3, b.y * cs + 3, cs - 6, cs - 6);
          ctx.strokeStyle = cvar('border'); ctx.lineWidth = 2; ctx.strokeRect(b.x * cs + 3, b.y * cs + 3, cs - 6, cs - 6);
        }
        const map = Pet.mapOf(p), s = Math.max(1, Math.floor((cs - 4) / Math.max(map[0].length, map.length)));
        Pet.drawSprite(ctx, p, pl.x * cs + Math.floor((cs - map[0].length * s) / 2), pl.y * cs + Math.floor((cs - map.length * s) / 2), s);
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      };
      const move = (dx, dy) => {
        if (finished) return;
        const nx = pl.x + dx, ny = pl.y + dy;
        if (wall(nx, ny)) return;
        const b = boxAt(nx, ny);
        if (b) {
          if (wall(nx + dx, ny + dy) || boxAt(nx + dx, ny + dy)) return;
          b.x += dx; b.y += dy;
        }
        pl = { x: nx, y: ny };
        draw();
        if (!goals.every(g => boxAt(g.x, g.y))) return;
        solved++;
        if (li < levels.length - 1) { toast(`第 ${li + 1} 关完成`); li++; setTimeout(load, 500); }
        else { finished = true; done(solved * 8); gameOverUI(ui, 'box'); }
      };
      ui.innerHTML = `<div class="pg-pad">
        <span></span><button class="btn ghost" data-mv="0,-1" aria-label="上">▲</button><span></span>
        <button class="btn ghost" data-mv="-1,0" aria-label="左">◀</button><button class="btn ghost" data-mv="reset" aria-label="重来">↺</button><button class="btn ghost" data-mv="1,0" aria-label="右">▶</button>
        <span></span><button class="btn ghost" data-mv="0,1" aria-label="下">▼</button><span></span></div>`;
      ui.onclick = e => {
        const m = e.target.closest('[data-mv]')?.dataset.mv;
        if (!m) return;
        if (m === 'reset') return load();
        const [dx, dy] = m.split(',').map(Number);
        move(dx, dy);
      };
      let sx = null, sy;
      cv.onpointerdown = e => { sx = e.clientX; sy = e.clientY; };
      cv.onpointerup = e => {
        if (sx == null) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        sx = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
        Math.abs(dx) > Math.abs(dy) ? move(Math.sign(dx), 0) : move(0, Math.sign(dy));
      };
      const KEYS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      const key = e => { if (KEYS[e.key]) { e.preventDefault(); move(...KEYS[e.key]); } };
      addEventListener('keydown', key);
      load();
      return {
        stop() {
          removeEventListener('keydown', key);
          if (!finished && solved) { finished = true; done(solved * 8); }
        },
      };
    },
  },
};
