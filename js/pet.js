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
  dino: { name: '恐龙', map: [
      '.....BBBB.',
      '....BBEBBB',
      '....BBBBBB',
      '.D..BBBP..',
      'D.DBBBBB..',
      'BBBBWWBB..',
      '.BBBWWBBB.',
      '..BBWWBB..',
      '...BB.BB..',
      '...DD.DD..'],
    colors: [
      { n: '小绿龙', B: '#7cc850', D: '#3f7a28', W: '#e8f8c8' },
      { n: '霸王棕', B: '#b07840', D: '#6a4220', W: '#f0d8b0' },
      { n: '草莓粉', B: '#f8a8c0', D: '#d0607e', W: '#fff0f4' },
      { n: '冰川蓝', B: '#88c8f0', D: '#3a7ab0', W: '#e8f6ff' },
      { n: '葡萄紫', B: '#a888d8', D: '#6a4a9a', W: '#efe6ff' },
      { n: '暗夜黑金', B: '#34343c', D: '#e0b828', W: '#5a5a64', E: '#f0d040' },
      { n: '化石白', B: '#ece6d6', D: '#a89a7a', W: '#ffffff', E: '#3a3020' },
    ] },
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
  // 帮忙照顾的人：你养的宠物，认识你、没拉黑你、会主动的角色（不是主人）
  helpers(p) {
    const o = p.owners.find(x => x.startsWith('p:'));
    if (!o) return [];
    const pid = o.slice(2);
    return S.chars.filter(c => !p.owners.includes(c.id) && c.proactive !== false
      && knows(pid, c.id) && !getRel(pid, c.id).theyBlock);
  },
  // 谁来照顾：有角色主人就是主人，没有就是帮忙的人
  carers(p) {
    const cs = this.charOwners(p);
    return cs.length ? { cs, help: false } : { cs: this.helpers(p), help: true };
  },
  // 照顾的规则：主人认真，和你一起养的少一些，帮忙的人只在状态很差时出手
  careRule(p, help) {
    if (help) return { lim: 15, poop: 4, q: 0.06, doc: 0.02 };
    const withMe = this.hasPersona(p);
    return withMe ? { lim: 25, poop: 3, q: 0.15, doc: 0.03 } : { lim: 40, poop: 2, q: 0.5, doc: 0.2 };
  },
  // 你能不能照顾：自己的，或者主人里有你认识的角色
  canCare(p) { return this.isMine(p) || this.charOwners(p).some(c => knows(activePid(), c.id)); },
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
  // 离线补算时，角色主人在每一段里也会按 autoCare 的规则照顾
    decay(p, now = Date.now()) {
    let t = Math.max(p.ts || now, now - 14 * 86400e3);
    // 间隔超过 5 分钟才算离线补算；在线时每分钟 tick 由 autoCare 负责
    const offline = now - t > 5 * 60e3;
    const care = offline ? this.carers(p) : { cs: [] };
    const done = {}; // 离线期间每个人各类照顾的次数，最后汇总写进动态
    while (t < now) {
      const step = Math.min(15 * 60e3, now - t), h = step / 3600e3, zz = this.asleep(p, t), k = zz ? 0.5 : 1;
      p.poopAcc = (p.poopAcc || 0) + h / 3.5 * k;
      while (p.poopAcc >= 1) { p.poopAcc--; if (p.poop < 5) p.poop++; }
      p.hunger = clamp100(p.hunger - 8 * h * k);
      if (!zz) p.happy = clamp100(p.happy - 4 * h - (p.hunger < 20 ? 4 * h : 0) - (p.sick ? 6 * h : 0));
      p.clean = clamp100(p.clean - (3 * h + p.poop * 2 * h) * k);
      const bad = p.hunger < 10 || p.clean < 10 || p.poop >= 4;
      p.neglect = bad ? (p.neglect || 0) + h : Math.max(0, (p.neglect || 0) - h / 2);
      if (!p.sick && p.neglect >= 6) { p.sick = true; this.log(p, 'sys', '生病了，需要看医生'); }
      if (!zz && p.hunger > 50 && p.clean > 50 && p.happy > 50) this.grow(p, h);
      if (care.cs.length) this.offlineCare(p, t, step / 60e3, care, done);
      t += step;
    }
    p.ts = now;
    // 汇总：每个人每类照顾写一条
    const TXT = { feed: '喂了它', clean: '铲了屎', bath: '给它洗了澡', pet: '摸了摸它', doctor: '带它看了医生，已经好了' };
    for (const [key, n] of Object.entries(done)) {
      const [cid, kind] = key.split('|');
      this.log(p, cid, `（你不在的时候）${care.help ? '帮忙' : ''}${TXT[kind]}${n > 1 ? ` ×${n}` : ''}`);
    }
  },

  // 离线补算用的简化照顾：规则和 autoCare 一致，但直接改属性，不放特效、不写单条日志
    offlineCare(p, t, minutes, care, done) {
    const r = this.careRule(p, care.help);
    const roll = q => Math.random() < 1 - (1 - q) ** minutes;
    const zz = this.asleep(p, t);
    let kind = null;
    if (p.sick) {
      if (roll(r.doc)) kind = 'doctor';
    } else {
      const need = zz
        ? (p.poop >= 3 ? 'clean' : null)
        : p.hunger < r.lim ? 'feed' : p.poop >= r.poop ? 'clean' : p.clean < r.lim - 10 ? 'bath' : p.happy < r.lim ? 'pet' : null;
      if (need && roll(r.q)) kind = need;
    }
    if (!kind) return;
    if (kind === 'feed') { p.hunger = clamp100(p.hunger + 35); p.happy = clamp100(p.happy + 3); p.poopAcc = (p.poopAcc || 0) + 0.25; }
    if (kind === 'clean') { p.poop = 0; p.clean = clamp100(p.clean + 10); }
    if (kind === 'bath') { p.clean = 100; p.happy = clamp100(p.happy + (p.sp === 'cat' ? -8 : 6)); }
    if (kind === 'pet') p.happy = clamp100(p.happy + 8);
    if (kind === 'doctor') { p.sick = false; p.neglect = 0; p.happy = clamp100(p.happy + 5); }
    this.grow(p, 2);
    const key = pick(care.cs).id + '|' + kind;
    done[key] = (done[key] || 0) + 1;
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
        // 不是主人就算帮忙（包括你帮角色照顾）
    if (!p.owners.includes(who)) t = '帮忙' + t;
    this.log(p, who, t);
    if (kind !== 'wake') this.grow(p, 2);
    return (mine ? '你' : this.who(who)) + t;
  },

  // 角色自动照顾，不调用 AI。和我一起养的照顾得少一些
    async autoCare(p) {
    const { cs, help } = this.carers(p);
    if (!cs.length) return;
    const r = this.careRule(p, help);
    if (p.sick) {
      if (Math.random() < r.doc) await this.act(p, 'doctor', pick(cs).id);
      return;
    }
    const need = this.asleep(p)
      ? (p.poop >= 3 ? 'clean' : null)
      : p.hunger < r.lim ? 'feed' : p.poop >= r.poop ? 'clean' : p.clean < r.lim - 10 ? 'bath' : p.happy < r.lim ? 'pet' : null;
    if (need && Math.random() < r.q) await this.act(p, need, pick(cs).id);
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
    return `这次你想在朋友圈晒一下${co.length ? '和' + co.join('、') + '一起' : '自己'}养的${SPECIES[p.sp].name}「${p.name}」（${this.colorName(p)}，${STAGES[this.stage(p)].n}），它现在${this.mood(p)}。${recent ? '最近：' + recent + '。' : ''}这是养宠 App 里的像素电子宠物，不是真的动物。配图用 [图片]宠物截图|${p.name}，也可以再配一张别的日常照片。`;
  },

  async tickAll() {
    for (const p of this.list) { this.decay(p); await this.autoCare(p); this.maybeShowOff(p); }
    await this.save();
    if (this.view === 'pet' && !$('#pet-root')?.hidden) this.updStats?.();
    this.drawFab();
  },

   // 给角色提示词用：自己参与养的 + 认识的人设（我）养的
  contextLines(charId, pid) {
    const me = 'p:' + pid;
    return this.list.filter(p =>
      (p.owners.includes(charId) && (p.owners.includes(me) || !this.hasPersona(p)))
      || (p.owners.includes(me) && !p.owners.includes(charId) && knows(pid, charId))
    ).map(p => {
      this.decay(p);
      const own = p.owners.includes(charId);
      const co = p.owners.filter(o => o !== charId).map(o => this.who(o));
      const recent = p.log.slice(0, 3).map(l => `${this.who(l.who)}${l.text}（${ChatUI.timeLabel(l.ts)}）`).join('；');
      const whose = own
        ? `${charById(charId)?.name}${co.length ? '和' + co.join('、') + '一起' : '自己'}养的`
        : `${co.join('、')}养的`;
      return { ts: p.log[0]?.ts || p.born, t: `[手机养宠App里的像素电子宠物，不是真实动物] ${whose}${this.colorName(p)}${SPECIES[p.sp].name}「${p.name}」（${STAGES[this.stage(p)].n}），现在${this.mood(p)}${recent ? '。最近：' + recent : ''}` };
    });
  },

  // ===== 角色自己领养 / 邀请一起养 / 改名 =====
  rules(p) {
    const sps = Object.values(SPECIES).map(s => `${s.name}（${s.colors.map(c => c.n).join('/')}）`).join('、');
        return `- 宠物（很少用。真的想养、符合性格和剧情时才用，可以自己主动决定，不用等别人提）：
  注意：这里的宠物都是大家手机上一个养宠小程序里的像素电子宠物，不是现实里的动物。喂食、洗澡、遛弯、看医生都是在 App 里点按钮，不能抱、不能带出门、不会真的掉毛。可以像聊手游一样聊它。
  自己领养：单独一行 ${p}[领养]动物|花色|名字
  想和对方一起养：单独一行 ${p}[一起领养]动物|花色|名字。名字可以空着，让对方起或者之后一起商量。对方同意了才算数。
  给自己参与养的宠物改名（比如商量好了新名字）：单独一行 ${p}[宠物改名]旧名字|新名字
  每人自己最多养 3 只。能养的动物和花色：${sps}`;
  },

  findSp(n) {
    n = String(n || '').trim();
    const ks = Object.keys(SPECIES);
    return ks.find(k => SPECIES[k].name === n || k === n)
      || ks.find(k => n && (SPECIES[k].name.includes(n) || n.includes(SPECIES[k].name)));
  },
  findColor(sp, n) {
    const cs = SPECIES[sp].colors;
    const i = cs.findIndex(c => n && (c.n === n || c.n.includes(n) || n.includes(c.n)));
    return i >= 0 ? i : Math.floor(Math.random() * cs.length);
  },
  // 「动物|花色|名字」→ { sp, color, name }
  parseSpec(s) {
    const [a, b, c] = String(s).split(/[|｜]/).map(x => x.trim());
    const sp = this.findSp(a);
    if (!sp) return null;
    return { sp, color: this.findColor(sp, b), name: (c || '').replace(/^["“「『]|["”」』]$/g, '').slice(0, 12) };
  },
  newPet(sp, color, name, owners) {
    const p = { id: uid(), sp, color, name: name || SPECIES[sp].name, owners, hunger: 80, clean: 100, happy: 80, poop: 0, poopAcc: 0,
      exp: 0, neglect: 0, sick: false, ts: Date.now(), born: Date.now(), lastShow: Date.now(), log: [] };
    this.log(p, owners[0], '领养了它');
    this.list.push(p);
    return p;
  },
  petLabel(p) { return `${this.colorName(p)}${SPECIES[p.sp].name}「${p.name}」`; },
  // 角色晒宠物截图时找宠物：优先名字对得上的，否则用他养的第一只
  findForShot(charId, desc) {
    const mine = this.list.filter(p => p.owners.includes(charId));
    return mine.find(p => desc && desc.includes(p.name)) || mine[0] || null;
  },

  // 画一张养宠 App 的截图，返回图片地址（data URL）
  snapshot(p) {
    const W = 240, H = 220, cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    this.decay(p);
    const zz = this.asleep(p), si = this.stage(p);
    // 背景和顶部标题栏
    ctx.fillStyle = cvar('panel'); ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = cvar('accent'); ctx.fillRect(0, 0, W, 26);
    ctx.fillStyle = cvar('text'); ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`🐾 ${p.name}`, W / 2, 18);
    // 小窝
    ctx.fillStyle = cvar('them'); ctx.fillRect(10, 34, W - 20, 120);
    ctx.fillStyle = cvar('accent2'); ctx.fillRect(10, 146, W - 20, 8);
    const map = this.mapOf(p), w = map[0].length, h = map.length;
    const s = Math.max(2, Math.round(Math.floor(90 / Math.max(w, h)) * STAGES[si].k));
    ctx.fillStyle = '#7a4a20';
    [24, 200, 50].slice(0, p.poop).forEach(px => { ctx.fillRect(px, 140, 8, 6); ctx.fillRect(px + 2, 135, 4, 5); });
    this.drawSprite(ctx, p, Math.round((W - w * s) / 2), 146 - h * s, s, { blink: zz });
    if (zz) {
      ctx.fillStyle = 'rgba(20,24,60,.4)'; ctx.fillRect(10, 34, W - 20, 120);
      ctx.font = '16px sans-serif'; ctx.fillText('🌙', W - 28, 54);
    }
    if (p.sick) { ctx.font = '16px sans-serif'; ctx.fillText('🤒', W / 2 + w * s / 2 + 8, 146 - h * s); }
    // 状态
    ctx.fillStyle = cvar('text'); ctx.font = '11px sans-serif';
    ctx.fillText(`${this.colorName(p)}${SPECIES[p.sp].name} · ${STAGES[si].n} · ${this.mood(p)}`, W / 2, 170);
    const bar = (label, v, y) => {
      ctx.textAlign = 'left'; ctx.fillStyle = cvar('text'); ctx.fillText(label, 14, y + 8);
      ctx.fillStyle = cvar('border'); ctx.fillRect(66, y, 150, 8);
      ctx.fillStyle = cvar('accent2'); ctx.fillRect(67, y + 1, 148 * v / 100, 6);
    };
    bar('🍖 饱腹', p.hunger, 178); bar('🧼 清洁', p.clean, 192); bar('😊 心情', p.happy, 206);
    return cv.toDataURL('image/png');
  },

  // 角色自己领养。在角色间私聊里说的，算两个人一起养
  async charAdopt(charId, spec, convId) {
    const v = this.parseSpec(spec);
    if (!v || !charById(charId)) return null;
    if (this.list.filter(p => p.owners.includes(charId)).length >= 3) return null;
    const i = Conv.parse(convId), owners = [charId];
    if (i.type === 'cc') owners.push(charId === i.a ? i.b : i.a);
    const p = this.newPet(v.sp, v.color, v.name, owners);
    await this.save();
    return { sender: charId, type: 'sys', content: `${owners.map(o => this.who(o)).join('和')} 领养了一只${this.petLabel(p)}` };
  },

  // 角色邀请我一起养：先发一张卡片，我点了同意才真的领养
  async charInvite(charId, spec, convId) {
    if (Conv.parse(convId).type === 'cc') return this.charAdopt(charId, spec, convId);
    const v = this.parseSpec(spec);
    if (!v) return null;
    const s = SPECIES[v.sp];
    return { sender: charId, type: 'petinvite', content: `想一起养一只${s.colors[v.color].n}${s.name}`, extra: { ...v, status: 'pending' } };
  },

  renderInvite(m) {
    const s = SPECIES[m.sp];
    const st = { pending: '点击回应', ok: '已经一起领养啦', no: '已拒绝' }[m.status];
    return `<div class="tf ${m.status === 'pending' ? '' : 'accepted'}"><div class="tf-amt">🐾 一起养${esc(s?.name || '宠物')}吧</div>
      <div class="tf-note">${esc(s?.colors[m.color]?.n || '')} · ${m.name ? '「' + esc(m.name) + '」' : '名字还没想好'}</div>
      <div class="tf-st">${st}</div></div>`;
  },

  // 点邀请卡片。返回 true 表示已处理
  async tapInvite(m) {
    if (m.type !== 'petinvite') return false;
    if (m.status !== 'pending') { toast(m.status === 'ok' ? '已经一起领养了' : '已经拒绝了'); return true; }
    const ch = charById(m.sender);
    if (!ch) return true;
    const opts = [];
    if (m.name) opts.push({ label: `同意，就叫「${m.name}」`, value: 'his' });
    opts.push({ label: '同意，我来起名', value: 'mine' });
    opts.push({ label: `同意，让${ch.name}来起名`, value: 'ask' });
    opts.push({ label: '拒绝', value: 'no', danger: true });
    const a = await actionSheet(opts);
    if (!a) return true;
    const pid = ChatUI.ctx(m.convId).pid, me = persona(pid).name;
    if (a === 'no') {
      m.status = 'no';
      await DB.put('msgs', m);
      await addMsg(m.convId, 'user', `${me} 拒绝了一起养宠物`, 'sys');
      return true;
    }
    let name = m.name;
    if (a === 'mine') {
      name = (await editText('给它起个名字', m.name || '', false))?.trim().slice(0, 12);
      if (!name) return true;
    }
    if (a === 'ask') name = '';
    const p = this.newPet(m.sp, m.color, name, ['p:' + pid, ch.id]);
    m.status = 'ok';
    m.petId = p.id;
    await DB.put('msgs', m);
    await this.save();
    this.drawFab();
    await addMsg(m.convId, 'user', a === 'ask'
      ? `${me} 和 ${ch.name} 一起领养了一只${this.colorName(p)}${SPECIES[p.sp].name}，${me}想让${ch.name}来起名字（现在暂时叫「${p.name}」）`
      : `${me} 和 ${ch.name} 一起领养了${this.petLabel(p)}`, 'sys');
    return true;
  },

  // 角色给自己参与养的宠物改名
  async charRename(charId, spec) {
    const [a, b] = String(spec).split(/[|｜]/).map(x => x.trim());
    const n = (b || '').replace(/^["“「『]|["”」』]$/g, '').slice(0, 12);
    const mine = this.list.filter(x => x.owners.includes(charId));
    const p = mine.find(x => x.name === a) || (mine.length === 1 ? mine[0] : null);
    if (!p || !n || n === p.name) return null;
    const old = p.name;
    p.name = n;
    this.log(p, charId, `把名字从「${old}」改成了「${n}」`);
    await this.save();
    return { sender: charId, type: 'sys', content: `${this.who(charId)} 把${SPECIES[p.sp].name}「${old}」改名为「${n}」` };
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
        const can = this.canCare(p), zz = this.asleep(p), cs = this.charOwners(p);
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
        <button class="btn ghost" data-game="box">📦 推箱子</button><button class="btn ghost" data-game="monopoly">🎲 大富翁</button></div>`}`
                : '<p class="empty">你还不认识它的主人，只能看看。</p>'}
      ${cs.length && S.settings.claude.key ? '<button class="btn ghost" data-pa="show">📸 让主人晒一下</button>' : ''}
      <h3>动态</h3><div class="pet-log" id="pet-log"></div>
      <small>${esc(this.ownerText(p))}</small>
            ${this.isMine(p) ? '<button class="btn ghost" data-pa="edit" style="margin-top:8px">⚙ 设置</button>' : ''}`);

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
            `【场景】${owner.name}和${me.name}都在用手机上的养宠 App（宠物是像素电子宠物，不是真的动物）。${owner.name}正在 App 里遛自己的${SPECIES[enc.sp].name}「${enc.name}」，在 App 的小路上偶遇了${me.name}的${SPECIES[p.sp].name}「${p.name}」。两人不是真的见面，${owner.name}说的话是在 App 里发给${me.name}的留言。「${p.name}」是${STAGES[this.stage(p)].n}，${this.mood(p)}。`,
      `【要求】\n- 只写${owner.name}当面说的话，1 到 3 句，每句一行。\n- 口语化，符合性格，可以夸对方的宠物、聊自己的宠物，或者顺口聊两句别的。\n- 不写动作、神态和旁白，不加名字前缀。`,
    ].filter(Boolean).join('\n\n');
    const out = await API.claude(system, [{ role: 'user', content: `现在是${nowText()}。${Weather.text()}` }], { maxTokens: 300 });
    const pre = new RegExp('^' + escRe(owner.name) + '\\s*[:：]\\s*');
    return out.split('\n').map(l => l.trim().replace(pre, '').replace(/^["“]|["”]$/g, ''))
      .filter(l => l && !/^[（(].*[)）]$/.test(l)).slice(0, 3);
  },
  // 大富翁结束后，角色们各说一句。只在填了 Key 时调用一次
  async monopolyChat(chars, summary) {
    const me = persona(activePid());
    const system = [
      `下面几个人刚在手机上和${me.name}玩完一局宠物大富翁（棋子是各自的宠物），写他们赛后的反应。`,
      ...chars.map(c => `【${c.name}的设定】\n${c.persona || '（无）'}\n和${me.name}的关系：${getRel(me.id, c.id).desc || '认识'}`),
      `【要求】\n- 每人一句，格式：名字：内容。名字只能是${chars.map(c => c.name).join('、')}。\n- 口语化、符合性格，可以炫耀、不服、吐槽、约下次。\n- 不写动作、神态和旁白。`,
    ].join('\n\n');
    const out = await API.claude(system, [{ role: 'user', content: `结果：${summary}` }], { maxTokens: 300 });
    return Prompt.parseLines(out, chars.map(c => c.name)).msgs.filter(m => m.content).slice(0, chars.length);
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
    // ===== 接食物：闯关，每关有目标分 =====
  catch: {
    name: '接食物', w: 240, h: 320,
    tip: '左右拖动画面（或按 ← →）接住食物。每关 25 秒，时间到时分数达到目标就过关。躲开 🌶️ 💣 🧊。❤️ 加命，⏰ 加时间，🧲 吸食物，⭐ 加 5 分。连续接住有连击加成。',
    start(p, cv, ui, done) {
      const ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
      const map = Pet.mapOf(p), s = 3, pw = map[0].length * s, ph = map.length * s;
      const FOODS = ['🍎', '🍙', '🥕', '🍓', '🐟', '🧀', '🍖'];
      const POWER = [['❤️', 'heart'], ['⏰', 'clock'], ['🧲', 'magnet'], ['⭐', 'star']];
      p.games ??= {};
      // 每关的难度：目标分、出现间隔、下落速度、坏东西比例、新机制
      const cfg = lv => ({
        goal: 10 + lv * 6, time: 25,
        gap: Math.max(230, 650 - lv * 50),
        speed: 1.4 + lv * 0.28,
        bad: Math.min(0.38, 0.12 + lv * 0.03),
        bomb: lv >= 2, zig: lv >= 3, ice: lv >= 4, wind: lv >= 5,
      });
      let lv = 1, score = 0, got = 0, lives = 3, combo = 0, items = [], fx = [];
      let timeLeft = 0, spawnT = 0, banner = 0, wind = 0, slowT = 0, magT = 0, shake = 0;
      let px = W / 2 - pw / 2, tx = px, keyDir = 0, paused = false, over = false, raf = 0, prev = 0;

      const startLv = () => {
        const c = cfg(lv);
        got = 0; timeLeft = c.time; items = []; banner = 2;
        wind = c.wind ? (Math.random() < 0.5 ? -1 : 1) * (0.3 + lv * 0.04) : 0;
      };
      const pop = (x, y, t) => fx.push({ x, y, t, life: 1 });
      const spawn = c => {
        const r = Math.random();
        let ch, kind;
        if (r < c.bad) [ch, kind] = pick([['🌶️', 'chili'], ...(c.bomb ? [['💣', 'bomb']] : []), ...(c.ice ? [['🧊', 'ice']] : [])]);
        else if (r < c.bad + 0.07) [ch, kind] = pick(POWER);
        else { ch = pick(FOODS); kind = 'food'; }
        items.push({
          x: 14 + Math.random() * (W - 28), y: -12, ch, kind,
          vx: c.zig && Math.random() < 0.4 ? (Math.random() - 0.5) * 1.6 : 0,
          vy: c.speed * (0.8 + Math.random() * 0.5) * (kind === 'bomb' ? 1.25 : 1),
        });
      };
      const catchIt = it => {
        const k = it.kind;
        if (k === 'food') { combo++; const g = 1 + Math.floor(combo / 5); score += g; got += g; pop(it.x, it.y, '+' + g); }
        if (k === 'star') { score += 5; got += 5; pop(it.x, it.y, '+5'); }
        if (k === 'heart') { lives = Math.min(5, lives + 1); pop(it.x, it.y, '❤️+1'); }
        if (k === 'clock') { timeLeft += 5; pop(it.x, it.y, '+5秒'); }
        if (k === 'magnet') { magT = 6; pop(it.x, it.y, '吸！'); }
        if (k === 'ice') { slowT = 3; combo = 0; pop(it.x, it.y, '冻住了'); }
        if (k === 'chili') { lives--; combo = 0; shake = 0.3; pop(it.x, it.y, '-1❤️'); }
        if (k === 'bomb') { lives--; combo = 0; shake = 0.5; score = Math.max(0, score - 3); got = Math.max(0, got - 3); pop(it.x, it.y, '💥'); }
      };
      const end = () => {
        if (over) return;
        over = true;
        cancelAnimationFrame(raf);
        p.games.catchBest = Math.max(p.games.catchBest || 0, lv);
        done(score);
        gameOverUI(ui, 'catch');
      };

      const draw = c => {
        const sx = shake > 0 ? (Math.random() - 0.5) * 6 : 0;
        ctx.fillStyle = cvar('them'); ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = cvar('accent2'); ctx.fillRect(0, H - 4, W, 4);
        // 风向
        if (wind) {
          ctx.globalAlpha = 0.25; ctx.fillStyle = cvar('border'); ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
          for (let i = 0; i < 4; i++) ctx.fillText(wind > 0 ? '»' : '«', ((performance.now() / 20 * Math.sign(wind) + i * 70) % W + W) % W, 70 + i * 50);
          ctx.globalAlpha = 1;
        }
        ctx.font = '18px sans-serif'; ctx.textAlign = 'center';
        for (const it of items) ctx.fillText(it.ch, it.x, it.y);
        // 宠物
        if (magT > 0) { ctx.globalAlpha = 0.25; ctx.fillStyle = '#e04a3a'; ctx.beginPath(); ctx.arc(px + pw / 2 + sx, H - ph / 2, pw, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
        Pet.drawSprite(ctx, p, Math.round(px + sx), H - ph - 2, s);
        if (slowT > 0) { ctx.globalAlpha = 0.35; ctx.fillStyle = '#88c8f0'; ctx.fillRect(px - 2, H - ph - 4, pw + 4, ph + 4); ctx.globalAlpha = 1; }
        // 飘字
        ctx.font = 'bold 12px sans-serif'; ctx.fillStyle = cvar('text');
        for (const f of fx) { ctx.globalAlpha = Math.max(0, f.life); ctx.fillText(f.t, f.x, f.y); }
        ctx.globalAlpha = 1;
        // 顶部信息
        ctx.textAlign = 'left'; ctx.font = '12px monospace'; ctx.fillStyle = cvar('text');
        ctx.fillText(`第${lv}关  ${got}/${c.goal}`, 6, 15);
        ctx.fillText(`⏱${Math.max(0, Math.ceil(timeLeft))}s  ${'♥'.repeat(lives)}`, 6, 30);
        ctx.textAlign = 'right'; ctx.fillText(`${score}分`, W - 6, 15);
        if (combo >= 3) ctx.fillText(`连击×${combo}`, W - 6, 30);
        // 目标进度条
        ctx.fillStyle = cvar('border'); ctx.fillRect(6, 36, W - 12, 4);
        ctx.fillStyle = got >= c.goal ? cvar('accent2') : cvar('accent'); ctx.fillRect(6, 36, (W - 12) * Math.min(1, got / c.goal), 4);
        if (banner > 0) {
          ctx.globalAlpha = Math.min(1, banner); ctx.textAlign = 'center'; ctx.fillStyle = cvar('text');
          ctx.font = 'bold 18px sans-serif'; ctx.fillText(`第 ${lv} 关`, W / 2, H / 2 - 20);
          ctx.font = '12px sans-serif'; ctx.fillText(`目标 ${c.goal} 分${wind ? ' · 有风' : ''}`, W / 2, H / 2);
          ctx.globalAlpha = 1;
        }
        if (paused) { ctx.textAlign = 'center'; ctx.font = 'bold 18px sans-serif'; ctx.fillText('暂停中', W / 2, H / 2 + 30); }
      };

      const loop = now => {
        raf = requestAnimationFrame(loop);
        const dt = Math.min(0.05, (now - (prev || now)) / 1000);
        prev = now;
        const c = cfg(lv);
        if (paused || over) return draw(c);
        const k = dt * 60; // 换算成 60 帧下的速度
        timeLeft -= dt;
        spawnT -= dt * 1000;
        if (spawnT <= 0) { spawn(c); spawnT = c.gap * (0.7 + Math.random() * 0.6); }
        if (keyDir) tx += keyDir * 5 * k;
        tx = Math.max(0, Math.min(W - pw, tx));
        px += (tx - px) * Math.min(1, (slowT > 0 ? 0.06 : 0.25) * k);
        slowT = Math.max(0, slowT - dt); magT = Math.max(0, magT - dt);
        shake = Math.max(0, shake - dt); banner = Math.max(0, banner - dt);
        for (const it of items) {
          if (magT > 0 && it.kind === 'food') it.x += (px + pw / 2 - it.x) * 0.06 * k;
          it.x += (it.vx + wind) * k;
          if (it.x < 10 || it.x > W - 10) { it.vx *= -1; it.x = Math.max(10, Math.min(W - 10, it.x)); }
          it.y += it.vy * k;
          if (!it.hit && it.y > H - ph - 6 && it.y < H + 4 && it.x > px - 8 && it.x < px + pw + 8) { it.hit = true; catchIt(it); }
          if (!it.hit && it.y > H + 16) { it.hit = true; if (it.kind === 'food') combo = 0; }
        }
        items = items.filter(i => !i.hit);
        fx.forEach(f => { f.life -= dt * 1.2; f.y -= 30 * dt; });
        fx = fx.filter(f => f.life > 0);
        if (lives <= 0) return end();
        if (timeLeft <= 0) {
          if (got < c.goal) return end();
          score += lv * 3;
          toast(`第 ${lv} 关通过，奖励 ${lv * 3} 分`);
          lv++;
          startLv();
        }
        draw(cfg(lv));
      };

      const setX = e => { const r = cv.getBoundingClientRect(); tx = (e.clientX - r.left) * W / r.width - pw / 2; };
      cv.onpointerdown = setX;
      cv.onpointermove = setX;
      const KM = { ArrowLeft: -1, KeyA: -1, ArrowRight: 1, KeyD: 1 };
      const kd = e => { if (KM[e.code]) { e.preventDefault(); keyDir = KM[e.code]; } };
      const ku = e => { if (KM[e.code] === keyDir) keyDir = 0; };
      addEventListener('keydown', kd);
      addEventListener('keyup', ku);
      ui.innerHTML = '<div class="pet-acts"><button class="btn ghost" data-pause>⏸ 暂停</button></div>';
      $('[data-pause]', ui).onclick = e => { paused = !paused; e.target.textContent = paused ? '▶ 继续' : '⏸ 暂停'; };

      startLv();
      raf = requestAnimationFrame(loop);
      return { stop() { over = true; cancelAnimationFrame(raf); removeEventListener('keydown', kd); removeEventListener('keyup', ku); } };
    },
  },

    // ===== 跑酷：随机关卡，越往后越难 =====
  // 地块：# 地面  = 砖块  ^ 地刺  ~ 沼泽  o 金币
  run: {
    name: '跑酷', w: 320, h: 176,
    tip: '◀ ▶ 移动，跳（空中再按一次是二段跳），🔥 火球。踩怪物头顶能消灭它。小心深坑、地刺和沼泽（会陷进去，待久了掉血）。少年解锁护盾，成年解锁冲刺 💨。键盘：方向键 / WASD，空格跳，X 火球，C 冲刺。',
    start(p, cv, ui, done) {
      const ctx = cv.getContext('2d'), T = 16, ROWS = 11, GY = 9, VW = cv.width, VH = cv.height, SS = 1.4;
      const R = n => Math.floor(Math.random() * n);
      const C = { bg: cvar('them'), g: cvar('accent2'), b: cvar('accent'), line: cvar('border'), text: cvar('text') };
      const stg = Pet.stage(p), hasShield = stg >= 1, hasDash = stg >= 2;
      p.games ??= {};
      let lv = p.games.run || 1, score = 0, lives = 3, over = false, raf = 0, frame = 0;
      let g = [], flagX = 0, enemies = [], balls = [], parts = [], pl, safe, camX = 0;
      let shield = 0, swampT = 0, fireCd = 0, dashCd = 0, banner = 0;
      const keys = { l: false, r: false };
      let jumpQ = false, fireQ = false, dashQ = false;

      // ---- 地图与碰撞 ----
      const tile = (x, y) => x < 0 ? '#' : (y < 0 || y >= ROWS || x >= g.length) ? '.' : g[x][y];
      const solid = c => c === '#' || c === '=';
      const span = (a, len) => [Math.floor(a / T), Math.floor((a + len - 0.01) / T)];
      const hitSolid = o => {
        const [x0, x1] = span(o.x, o.w), [y0, y1] = span(o.y, o.h);
        for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) if (solid(tile(x, y))) return true;
        return false;
      };
      const moveX = (o, dx) => {
        o.x += dx;
        if (!hitSolid(o)) return false;
        o.x = dx > 0 ? Math.floor((o.x + o.w - 0.01) / T) * T - o.w : (Math.floor(o.x / T) + 1) * T;
        return true;
      };
      const moveY = (o, dy) => {
        o.y += dy; o.ground = false;
        if (!hitSolid(o)) return false;
        if (dy > 0) { o.y = Math.floor((o.y + o.h - 0.01) / T) * T - o.h; o.ground = true; }
        else o.y = (Math.floor(o.y / T) + 1) * T;
        o.vy = 0;
        return true;
      };
      const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

      // ---- 关卡生成：按关卡数调整各种地形的权重和尺寸 ----
      const gen = () => {
        g = []; enemies = []; balls = []; parts = [];
        const len = 70 + lv * 25;
        const empty = () => { g.push(Array(ROWS).fill('.')); return g.length - 1; };
        const col = () => { const x = empty(); g[x][GY] = g[x][GY + 1] = '#'; return x; };
        const flat = n => { for (let i = 0; i < n; i++) col(); };
        const slime = x => enemies.push({ t: 'slime', x: x * T + 2, y: (GY - 1) * T + 4, w: 12, h: 12, vx: -0.5, vy: 0 });
        const bat = x => { const by = 3 * T + R(24); enemies.push({ t: 'bat', x: x * T, y: by, by, w: 12, h: 9, vx: -0.6 - lv * 0.05, ph: Math.random() * 6 }); };
        const segs = [['flat', 3], ['pit', 1.5 + lv * 0.3], ['spike', 1 + lv * 0.4], ['swamp', 0.8 + lv * 0.2], ['plat', 1.2], ['stairs', 1],
          ...(lv >= 2 ? [['tunnel', 0.6 + lv * 0.1]] : [])];
        const total = segs.reduce((s, x) => s + x[1], 0);
        flat(8);
        while (g.length < len) {
          let r = Math.random() * total, k = 'flat';
          for (const [n, w] of segs) if ((r -= w) < 0) { k = n; break; }
          const x0 = g.length;
          if (k === 'flat') {
            const n = 3 + R(4);
            flat(n);
            if (Math.random() < 0.5) for (let i = 1; i < n - 1; i++) g[x0 + i][GY - 2] = 'o';
            if (Math.random() < 0.25 + lv * 0.06) slime(x0 + n - 1);
            if (lv >= 3 && Math.random() < 0.15 + lv * 0.03) bat(x0 + R(n));
          } else if (k === 'pit') {
            const w = 2 + R(Math.min(4, 1 + Math.ceil(lv / 2)));
            for (let i = 0; i < w; i++) empty();
            // 宽坑中间放一块落脚的砖
            if (w >= 4) { const m = x0 + Math.floor(w / 2) - 1; g[m][6] = g[m + 1][6] = '='; g[m][5] = 'o'; }
            else g[x0 + Math.floor(w / 2)][GY - 3] = 'o';
            flat(2);
          } else if (k === 'spike') {
            flat(2);
            const n = 1 + R(Math.min(4, 1 + lv));
            for (let i = 0; i < n; i++) g[col()][GY - 1] = '^';
            flat(2);
          } else if (k === 'swamp') {
            flat(1);
            const n = 3 + R(3 + Math.min(4, lv));
            for (let i = 0; i < n; i++) g[col()][GY] = '~';
            flat(2);
          } else if (k === 'plat') {
            // 一串浮空砖，难度高时下面是坑或地刺
            const n = 6 + R(4), below = lv >= 3 ? pick(['pit', 'spike']) : 'none';
            for (let i = 0; i < n; i++) {
              const x = below === 'pit' ? empty() : col();
              if (below === 'spike') g[x][GY - 1] = '^';
              if (i % 3 !== 2) { const y = (Math.floor(i / 3) % 2) ? 5 : 6; g[x][y] = '='; g[x][y - 1] = 'o'; }
            }
            flat(2);
          } else if (k === 'stairs') {
            const hs = [1, 2, 3, 3, 2, 1].slice(0, 3 + R(4));
            hs.forEach(h => { const x = col(); for (let j = 1; j <= h; j++) g[x][GY - j] = '#'; });
            g[x0 + Math.floor(hs.length / 2)][GY - Math.max(...hs) - 1] = 'o';
            flat(2);
          } else if (k === 'tunnel') {
            // 地道：上面封死，只能从低矮的通道穿过去，跳不高
            flat(1);
            const n = 6 + R(5);
            for (let i = 0; i < n; i++) {
              const x = col();
              for (let y = 0; y <= 6; y++) g[x][y] = '=';
              if (i % 2) g[x][GY - 1] = 'o';
            }
            if (lv >= 4 && Math.random() < 0.6) slime(x0 + 1 + Math.floor(n / 2));
            flat(2);
          }
        }
        flat(8);
        flagX = (g.length - 4) * T;
      };

      const spawn = () => {
        pl = { x: 2 * T, y: GY * T - 13, w: 12, h: 13, vx: 0, vy: 0, face: 1, ground: false, jumps: 0, inv: 0, dash: 0 };
        safe = { x: pl.x, y: pl.y };
        shield = hasShield ? 1 : 0;
        camX = 0; banner = 90; swampT = 0;
      };
      const pop = (x, y, t) => parts.push({ x, y, t, life: 30 });
      const hurt = () => {
        if (pl.inv > 0 || over) return;
        if (shield) { shield--; pl.inv = 60; pop(pl.x + 6, pl.y, '🛡'); return; }
        lives--; pl.inv = 90; pl.vy = -3;
        if (lives <= 0) over = true;
      };

      const update = () => {
        if (pl.ground) pl.jumps = 0;
        const inSw = tile(Math.floor((pl.x + pl.w / 2) / T), Math.floor((pl.y + pl.h - 1) / T)) === '~';
        const dir = (keys.r ? 1 : 0) - (keys.l ? 1 : 0);
        if (dir) pl.face = dir;
        pl.vx += (dir * (inSw ? 0.8 : 2) - pl.vx) * 0.25;
        if (dashQ && hasDash && dashCd <= 0) { pl.dash = 10; dashCd = 90; pl.inv = Math.max(pl.inv, 12); }
        dashQ = false;
        if (pl.dash > 0) { pl.dash--; pl.vx = pl.face * 5; if (pl.vy > 0) pl.vy = 0; }
        if (jumpQ) {
          if (pl.ground) { pl.vy = inSw ? -4.4 : -6; pl.jumps = 1; }
          else if (pl.jumps < 2) { pl.vy = -5.2; pl.jumps = 2; pop(pl.x + 6, pl.y + pl.h, '💨'); }
        }
        jumpQ = false;
        pl.vy = Math.min(inSw ? 2 : 7, pl.vy + (inSw ? 0.28 : 0.35));
        moveX(pl, pl.vx);
        moveY(pl, pl.vy);

        swampT = inSw ? swampT + 1 : 0;
        if (swampT > 150) { swampT = 0; hurt(); }
        if (pl.inv > 0) pl.inv--;
        if (fireCd > 0) fireCd--;
        if (dashCd > 0) dashCd--;

        // 金币和地刺
        const [x0, x1] = span(pl.x, pl.w), [y0, y1] = span(pl.y, pl.h);
        let spiky = false;
        for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) {
          const c = tile(x, y);
          if (c === 'o') { g[x][y] = '.'; score++; pop(x * T + 8, y * T, '+1'); }
          if (c === '^' && pl.y + pl.h > y * T + 7) spiky = true;
        }
        if (spiky) hurt();
        if (pl.ground && !inSw && !spiky) safe = { x: pl.x, y: pl.y };

        // 掉坑：扣一条命，回到最近站稳的地方
        if (pl.y > VH + 16) {
          lives--;
          if (lives <= 0) { over = true; return; }
          Object.assign(pl, { x: safe.x, y: safe.y - 2, vx: 0, vy: 0, inv: 90, dash: 0 });
        }

        // 火球：落地会弹起来，撞墙消失
        if (fireQ && fireCd <= 0) {
          balls.push({ x: pl.face > 0 ? pl.x + pl.w : pl.x - 6, y: pl.y + 3, w: 6, h: 6, vx: pl.face * 4, vy: 0, life: 80 });
          fireCd = 35;
        }
        fireQ = false;
        for (const b of balls) {
          b.vy += 0.25; b.life--;
          if (moveX(b, b.vx)) b.life = 0;
          if (moveY(b, b.vy) && b.ground) b.vy = -2.8;
          if (b.y > VH) b.life = 0;
        }

        // 怪物：只更新镜头附近的
        for (const e of enemies) {
          if (e.x - camX > VW + 48 || e.x - camX < -64) continue;
          if (e.t === 'slime') {
            e.vy = Math.min(7, e.vy + 0.35);
            if (moveX(e, e.vx)) e.vx *= -1;
            moveY(e, e.vy);
            // 走到边缘就掉头
            if (e.ground) {
              const ax = Math.floor((e.vx > 0 ? e.x + e.w + 1 : e.x - 1) / T);
              if (!solid(tile(ax, Math.floor((e.y + e.h + 1) / T)))) e.vx *= -1;
            }
            if (e.y > VH) e.dead = true;
          } else {
            e.x += e.vx; e.ph += 0.05;
            e.y = e.by + Math.sin(e.ph) * 18;
          }
          for (const b of balls) if (!e.dead && b.life > 0 && hit(b, e)) { b.life = 0; e.dead = true; score += 2; pop(e.x + 6, e.y, '💥'); }
          if (e.dead || !hit(pl, e)) continue;
          if (pl.vy > 0 && pl.y + pl.h - e.y < 8) { e.dead = true; pl.vy = -4.5; pl.jumps = 1; score += 3; pop(e.x + 6, e.y, '+3'); }
          else if (pl.dash > 0) { e.dead = true; score += 2; pop(e.x + 6, e.y, '💥'); }
          else hurt();
        }
        enemies = enemies.filter(e => !e.dead);
        balls = balls.filter(b => b.life > 0);
        parts.forEach(q => { q.y -= 0.6; q.life--; });
        parts = parts.filter(q => q.life > 0);
        camX = Math.max(0, Math.min(g.length * T - VW, pl.x - 130));
        if (banner > 0) banner--;

        // 过关：加分、回一条命、进下一关
        if (pl.x > flagX) {
          score += 10 + lv * 3;
          lives = Math.min(3, lives + 1);
          toast(`第 ${lv} 关通过`);
          lv++;
          p.games.run = lv;
          Pet.save();
          gen(); spawn();
        }
      };

      const render = () => {
        ctx.fillStyle = C.bg; ctx.fillRect(0, 0, VW, VH);
        for (let tx = Math.floor(camX / T); tx <= Math.floor((camX + VW) / T); tx++) for (let ty = 0; ty < ROWS; ty++) {
          const c = tile(tx, ty), X = tx * T - camX, Y = ty * T;
          if (c === '#') {
            ctx.fillStyle = C.g; ctx.fillRect(X, Y, T, T);
            if (!solid(tile(tx, ty - 1))) { ctx.fillStyle = C.line; ctx.fillRect(X, Y, T, 2); }
          } else if (c === '=') {
            ctx.fillStyle = C.b; ctx.fillRect(X, Y, T, T);
            ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(X + 0.5, Y + 0.5, T - 1, T - 1);
          } else if (c === '^') {
            ctx.fillStyle = C.line; ctx.beginPath();
            for (let k = 0; k < 2; k++) { ctx.moveTo(X + k * 8, Y + T); ctx.lineTo(X + k * 8 + 4, Y + 6); ctx.lineTo(X + k * 8 + 8, Y + T); }
            ctx.fill();
          } else if (c === '~') {
            ctx.fillStyle = '#5a6a2a'; ctx.fillRect(X, Y + 3, T, T - 3);
            ctx.fillStyle = '#8a9a4a';
            if ((tx + Math.floor(frame / 20)) % 3 === 0) ctx.fillRect(X + 5, Y + 6, 3, 3);
          } else if (c === 'o') {
            ctx.fillStyle = '#f0c030'; ctx.beginPath(); ctx.arc(X + 8, Y + 8, 4, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();
          }
        }
        // 终点旗
        const fx = flagX - camX;
        if (fx < VW + 20) {
          ctx.fillStyle = C.line; ctx.fillRect(fx, 3 * T, 2, (GY - 3) * T);
          ctx.fillStyle = '#e04a3a'; ctx.fillRect(fx + 2, 3 * T, 14, 9);
        }
        for (const e of enemies) {
          const X = Math.round(e.x - camX), Y = Math.round(e.y);
          if (e.t === 'slime') {
            ctx.fillStyle = '#8a4ab0'; ctx.fillRect(X, Y + 3, 12, 9); ctx.fillRect(X + 2, Y, 8, 3);
            ctx.fillStyle = '#fff'; ctx.fillRect(X + 2, Y + 4, 3, 3); ctx.fillRect(X + 7, Y + 4, 3, 3);
          } else {
            const up = Math.floor(frame / 8) % 2;
            ctx.fillStyle = '#3a3a48'; ctx.fillRect(X + 3, Y + 2, 6, 6);
            ctx.fillRect(X, Y + (up ? 0 : 4), 3, 3); ctx.fillRect(X + 9, Y + (up ? 0 : 4), 3, 3);
            ctx.fillStyle = '#f04040'; ctx.fillRect(X + 4, Y + 4, 1, 1); ctx.fillRect(X + 7, Y + 4, 1, 1);
          }
        }
        for (const b of balls) {
          ctx.fillStyle = '#ff7a1a'; ctx.fillRect(Math.round(b.x - camX), Math.round(b.y), 6, 6);
          ctx.fillStyle = '#ffd040'; ctx.fillRect(Math.round(b.x - camX) + 2, Math.round(b.y) + 2, 2, 2);
        }
        if (!(pl.inv > 0 && frame % 6 < 3)) Pet.drawSprite(ctx, p, Math.round(pl.x - camX - 1), Math.round(pl.y - 1), SS, { flip: pl.face < 0 });
        if (shield) {
          ctx.strokeStyle = '#4ab0f0'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(pl.x - camX + 6, pl.y + 6, 11, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.textAlign = 'center'; ctx.font = '10px sans-serif'; ctx.fillStyle = C.text;
        for (const q of parts) { ctx.globalAlpha = q.life / 30; ctx.fillText(q.t, q.x - camX, q.y); }
        ctx.globalAlpha = 1;
        // 状态栏
        ctx.textAlign = 'left'; ctx.font = '12px monospace'; ctx.fillStyle = C.text;
        ctx.fillText(`第${lv}关 ${'♥'.repeat(lives)}${shield ? ' 🛡' : ''}  🪙${score}`, 6, 14);
        ctx.fillStyle = fireCd ? C.line : '#ff7a1a'; ctx.fillRect(VW - 46, 6, 40 * (1 - fireCd / 35), 4);
        if (hasDash) { ctx.fillStyle = dashCd ? C.line : '#4ab0f0'; ctx.fillRect(VW - 46, 12, 40 * (1 - dashCd / 90), 4); }
        if (swampT > 60) { ctx.fillStyle = '#5a6a2a'; ctx.fillText('快陷下去了！', 6, 28); }
        if (banner) {
          ctx.globalAlpha = Math.min(1, banner / 30); ctx.textAlign = 'center'; ctx.font = 'bold 16px sans-serif';
          ctx.fillText(`第 ${lv} 关`, VW / 2, 60); ctx.globalAlpha = 1;
        }
      };

      const loop = () => {
        frame++;
        update();
        render();
        if (over) { done(score); gameOverUI(ui, 'run'); return; }
        raf = requestAnimationFrame(loop);
      };

      // 触屏按钮：方向键按住生效，跳 / 火球 / 冲刺按一下生效
      ui.innerHTML = `<div class="pet-acts" style="justify-content:space-between;user-select:none;-webkit-user-select:none;touch-action:none">
        <span class="flex" style="gap:6px"><button class="btn ghost" data-k="l" aria-label="向左">◀</button><button class="btn ghost" data-k="r" aria-label="向右">▶</button></span>
        <span class="flex" style="gap:6px">${hasDash ? '<button class="btn ghost" data-k="dash" aria-label="冲刺">💨</button>' : ''}
          <button class="btn ghost" data-k="fire" aria-label="火球">🔥</button><button class="btn" data-k="jump" aria-label="跳">跳</button></span></div>`;
      const press = (k, on) => {
        if (k === 'l' || k === 'r') keys[k] = on;
        else if (on) { if (k === 'jump') jumpQ = true; if (k === 'fire') fireQ = true; if (k === 'dash') dashQ = true; }
      };
      $$('[data-k]', ui).forEach(b => {
        b.onpointerdown = e => { e.preventDefault(); b.setPointerCapture?.(e.pointerId); press(b.dataset.k, true); };
        b.onpointerup = b.onpointercancel = () => press(b.dataset.k, false);
        b.oncontextmenu = e => e.preventDefault();
      });
      cv.onpointerdown = () => { jumpQ = true; };
      const KM = { ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', Space: 'jump', ArrowUp: 'jump', KeyW: 'jump', KeyX: 'fire', KeyJ: 'fire', KeyC: 'dash', KeyK: 'dash' };
      const kd = e => { const k = KM[e.code]; if (!k) return; e.preventDefault(); if (!e.repeat) press(k, true); };
      const ku = e => { const k = KM[e.code]; if (k) press(k, false); };
      addEventListener('keydown', kd);
      addEventListener('keyup', ku);

      gen(); spawn();
      raf = requestAnimationFrame(loop);
      return { stop() { cancelAnimationFrame(raf); removeEventListener('keydown', kd); removeEventListener('keyup', ku); } };
    },
  },

  // ===== 推箱子：前三关教学，之后随机生成（倒推生成，保证有解） =====
  // # 墙  . 目标  $ 箱子  * 箱子在目标上  @ 宠物
  box: {
    name: '推箱子', w: 240, h: 240,
    tip: '把箱子都推到 ✕ 上。前三关是教学，之后随机生成，越往后地图越大、箱子越多。可以点方向键、滑动画面或用键盘。',
    levels: [
      ['######', '#    #', '# @$.#', '#    #', '######'],
      ['#######', '#     #', '# $#. #', '# @   #', '#  $. #', '#######'],
      ['#######', '#.  $ #', '# #  @#', '#  $  #', '#  .  #', '#######'],
    ],
    parse(rows) {
      const W = Math.max(...rows.map(r => r.length)), walls = [], boxes = [], goals = [];
      let pl = null;
      rows.forEach((row, y) => {
        walls.push([...row.padEnd(W, '#')].map(c => c === '#'));
        [...row].forEach((ch, x) => {
          if (ch === '@') pl = { x, y };
          if (ch === '$' || ch === '*') boxes.push({ x, y });
          if (ch === '.' || ch === '*') goals.push({ x, y });
        });
      });
      return { walls, boxes, goals, pl };
    },
    // 从「箱子全在目标上」开始，随机走动并倒着拉箱子；正着推回去就是解法
    gen(lv) {
      const R = n => Math.floor(Math.random() * n), D = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      const d = lv - this.levels.length;
      const W = Math.min(12, 7 + Math.floor(d / 2)), H = Math.min(12, 6 + Math.floor((d + 1) / 2));
      const nb = Math.min(7, 2 + Math.floor(d / 3)), steps = 60 + d * 30;
      let best = null;
      for (let tries = 0; tries < 60; tries++) {
        const walls = Array.from({ length: H }, () => Array(W).fill(true));
        let x = 1 + R(W - 2), y = 1 + R(H - 2), n = 0, guard = 0;
        const want = Math.floor((W - 2) * (H - 2) * (0.5 + Math.random() * 0.2));
        while (n < want && guard++ < 8000) {
          if (walls[y][x]) { walls[y][x] = false; n++; }
          const [dx, dy] = pick(D);
          x = Math.max(1, Math.min(W - 2, x + dx));
          y = Math.max(1, Math.min(H - 2, y + dy));
        }
        const floor = [];
        walls.forEach((r, yy) => r.forEach((w, xx) => { if (!w) floor.push({ x: xx, y: yy }); }));
        if (floor.length < nb * 3 + 4) continue;
        floor.sort(() => Math.random() - 0.5);
        const goals = floor.slice(0, nb).map(c => ({ ...c })), boxes = goals.map(c => ({ ...c }));
        let pl = { ...floor[nb] }, pulls = 0;
        const boxAt = (bx, by) => boxes.find(b => b.x === bx && b.y === by);
        const wall = (wx, wy) => walls[wy]?.[wx] ?? true;
        for (let i = 0; i < steps; i++) {
          const [dx, dy] = pick(D), nx = pl.x + dx, ny = pl.y + dy;
          if (wall(nx, ny) || boxAt(nx, ny)) continue;
          const b = boxAt(pl.x - dx, pl.y - dy);
          if (b && Math.random() < 0.8) { b.x = pl.x; b.y = pl.y; pulls++; }
          pl = { x: nx, y: ny };
        }
        const onGoal = boxes.filter(b => goals.some(gl => gl.x === b.x && gl.y === b.y)).length;
        const sc = pulls - onGoal * 20;
        if (!best || sc > best.sc) best = { sc, walls, goals, boxes, pl };
        if (!onGoal && pulls >= nb * 4 + d) break;
      }
      return best || this.parse(this.levels.at(-1));
    },
    start(p, cv, ui, done) {
      const ctx = cv.getContext('2d');
      p.games ??= {};
      let lv = p.games.box || 1, solved = 0, score = 0, finished = false, L, boxes, pl, hist, cs;
      const make = () => lv <= this.levels.length ? this.parse(this.levels[lv - 1]) : this.gen(lv);
      const boxAt = (x, y) => boxes.find(b => b.x === x && b.y === y);
      const wall = (x, y) => L.walls[y]?.[x] ?? true;
      const reset = () => { boxes = L.boxes.map(b => ({ ...b })); pl = { ...L.pl }; hist = []; draw(); };
      const load = (fresh = true) => {
        if (fresh) L = make();
        const W = L.walls[0].length, H = L.walls.length;
        cs = Math.floor(240 / Math.max(W, H));
        cv.width = W * cs; cv.height = H * cs;
        reset();
      };
      const draw = () => {
        ctx.fillStyle = cvar('them'); ctx.fillRect(0, 0, cv.width, cv.height);
        L.walls.forEach((row, y) => row.forEach((w, x) => {
          if (!w) return;
          ctx.fillStyle = cvar('accent2'); ctx.fillRect(x * cs, y * cs, cs, cs);
          ctx.fillStyle = cvar('border'); ctx.fillRect(x * cs, y * cs + cs - 3, cs, 3); ctx.fillRect(x * cs + cs - 3, y * cs, 3, cs);
        }));
        ctx.fillStyle = cvar('border'); ctx.font = `${cs * 0.6}px monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (const gl of L.goals) ctx.fillText('✕', gl.x * cs + cs / 2, gl.y * cs + cs / 2);
        for (const b of boxes) {
          const on = L.goals.some(gl => gl.x === b.x && gl.y === b.y);
          ctx.fillStyle = on ? cvar('me') : cvar('accent');
          ctx.fillRect(b.x * cs + 3, b.y * cs + 3, cs - 6, cs - 6);
          ctx.strokeStyle = cvar('border'); ctx.lineWidth = 2; ctx.strokeRect(b.x * cs + 3, b.y * cs + 3, cs - 6, cs - 6);
        }
        const map = Pet.mapOf(p), s = Math.max(1, Math.floor((cs - 4) / Math.max(map[0].length, map.length)));
        Pet.drawSprite(ctx, p, pl.x * cs + Math.floor((cs - map[0].length * s) / 2), pl.y * cs + Math.floor((cs - map.length * s) / 2), s);
        ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.font = '12px monospace'; ctx.fillStyle = cvar('text');
        ctx.fillText(`第${lv}关 · ${score}分`, 4, 2);
        ctx.textBaseline = 'alphabetic';
      };
      const move = (dx, dy) => {
        if (finished) return;
        const nx = pl.x + dx, ny = pl.y + dy;
        if (wall(nx, ny)) return;
        const b = boxAt(nx, ny);
        if (b && (wall(nx + dx, ny + dy) || boxAt(nx + dx, ny + dy))) return;
        hist.push({ pl: { ...pl }, boxes: boxes.map(x => ({ ...x })) });
        if (b) { b.x += dx; b.y += dy; }
        pl = { x: nx, y: ny };
        draw();
        if (!L.goals.every(gl => boxAt(gl.x, gl.y))) return;
        solved++;
        score += 5 + lv;
        toast(`第 ${lv} 关完成`);
        lv++;
        p.games.box = lv;
        Pet.save();
        finished = true; // 切关期间不响应操作
        setTimeout(() => { finished = false; load(); }, 500);
      };
      const end = () => { if (finished && !solved) return; finished = true; done(score); gameOverUI(ui, 'box'); };

      ui.innerHTML = `<div class="pg-pad">
        <button class="btn ghost" data-mv="undo" aria-label="撤销">↶</button><button class="btn ghost" data-mv="0,-1" aria-label="上">▲</button><button class="btn ghost" data-mv="reset" aria-label="重来">↺</button>
        <button class="btn ghost" data-mv="-1,0" aria-label="左">◀</button><button class="btn ghost" data-mv="skip" aria-label="换一张图">⏭</button><button class="btn ghost" data-mv="1,0" aria-label="右">▶</button>
        <span></span><button class="btn ghost" data-mv="0,1" aria-label="下">▼</button><button class="btn ghost" data-mv="end" aria-label="结束">✓</button></div>`;
      ui.onclick = e => {
        const m = e.target.closest('[data-mv]')?.dataset.mv;
        if (!m) return;
        if (m === 'reset') return reset();
        if (m === 'end') return end();
        if (m === 'undo') { const h = hist.pop(); if (h) { pl = h.pl; boxes = h.boxes; draw(); } return; }
        if (m === 'skip') { if (lv <= this.levels.length) return toast('教学关不能换'); return load(); }
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
      const key = e => {
        if (KEYS[e.key]) { e.preventDefault(); move(...KEYS[e.key]); }
        if (e.key === 'z' || e.key === 'Backspace') { const h = hist.pop(); if (h) { pl = h.pl; boxes = h.boxes; draw(); } }
      };
      addEventListener('keydown', key);
      load();
      return {
        stop() {
          removeEventListener('keydown', key);
          if (solved && ui.querySelector('.pg-pad')) done(score); // 没点结束就离开，也把分数结算掉
        },
      };
    },
  },

    // ===== 大富翁：和角色一起玩，棋子是各自的宠物，可以边玩边聊 =====
  monopoly: {
    name: '大富翁', w: 336, h: 336,
    tip: '和认识的角色一起玩，棋子是大家的宠物。经过起点 +200。集齐同色一整组过路费翻倍。踩到自己的地可以升级。下面可以和大家聊天。',
    TILES: [
      { n: '起点', k: 'start', i: '🏁' }, { n: '草莓田', g: 0, price: 60, i: '🍓' }, { n: '胡萝卜地', g: 0, price: 70, i: '🥕' },
      { n: '机会', k: 'chance', i: '❓' }, { n: '苹果园', g: 0, price: 80, i: '🍎' }, { n: '宠物税', k: 'tax', v: 80, i: '💸' },
      { n: '宠物医院', k: 'jail', i: '🏥' }, { n: '鱼塘', g: 1, price: 100, i: '🐟' }, { n: '猫爬架', g: 1, price: 110, i: '🐈' },
      { n: '命运', k: 'fate', i: '🔮' }, { n: '狗狗乐园', g: 1, price: 130, i: '🐕' }, { n: '公交站', k: 'bus', i: '🚌' },
      { n: '公园', k: 'park', i: '🌳' }, { n: '玩具店', g: 2, price: 150, i: '🧸' }, { n: '机会', k: 'chance', i: '❓' },
      { n: '零食铺', g: 2, price: 160, i: '🍪' }, { n: '美容院', g: 2, price: 180, i: '✂️' }, { n: '道具店', k: 'shop', i: '🛒' },
      { n: '运动会', k: 'sport', i: '🏅' }, { n: '宠物咖啡', g: 3, price: 200, i: '☕' }, { n: '宠物酒店', g: 3, price: 230, i: '🏨' },
      { n: '公交站', k: 'bus', i: '🚌' }, { n: '命运', k: 'fate', i: '🔮' }, { n: '豪华猫窝', g: 3, price: 280, i: '👑' },
    ],
    GROUPS: ['#f08a9a', '#6ab0e8', '#f0c040', '#a07ad8'],
    ITEMS: { remote: { n: '遥控骰子', i: '🎮', price: 90 }, double: { n: '双骰卡', i: '🎲', price: 60 }, free: { n: '免租卡', i: '🛡️', price: 80 } },

    start(p, cv, ui, done) {
      const ctx = cv.getContext('2d'), pid = activePid(), me = persona(pid);
      const S7 = Math.floor(cv.width / 7), N = 24, GROUPS = this.GROUPS, ITEMS = this.ITEMS;
      const COL = ['#e04a3a', '#3a7ae0', '#3aa050', '#c060d0'];
      const LV = ['空地', '小屋', '两栋小屋', '宠物乐园'];
      const SPD = { slow: 1.6, mid: 1, fast: 0.5 };
      const C = { bg: cvar('bg'), panel: cvar('panel'), them: cvar('them'), text: cvar('text'), line: cvar('border'), acc: cvar('accent') };
      const R = n => Math.floor(Math.random() * n);
      const wait = ms => new Promise(r => setTimeout(r, ms));
      p.games ??= {};
      let spd = SPD[p.games.monoSpd] || SPD.slow;
      const W8 = ms => wait(ms * spd); // 受速度设置影响的等待
      const tiles = this.TILES.map(t => ({ ...t, owner: null, lv: 0 }));
      let players = [], cur = 0, round = 1, MAX = 20, dice = [], logs = [], chat = [], evt = '', stopped = false;

      // ---- 规则 ----
      const byId = id => players.find(x => x.id === id);
      const others = pl => players.filter(x => x !== pl && !x.out);
      const setOwned = t => t.g != null && t.owner && tiles.filter(x => x.g === t.g).every(x => x.owner === t.owner);
      const rent = t => Math.round(t.price * 0.2 * [1, 2.5, 5, 9][t.lv] * (setOwned(t) ? (t.lv ? 1.3 : 2) : 1));
      const upCost = t => Math.round(t.price * 0.5);
      const worth = pl => pl.out ? -1 : pl.money + tiles.filter(t => t.owner === pl.id).reduce((s, t) => s + t.price + t.lv * upCost(t), 0);
      const standing = () => [...players].sort((a, b) => worth(b) - worth(a))
        .map(x => `${x.name}${x.out ? '（破产）' : ` 现金¥${x.money} 地${tiles.filter(t => t.owner === x.id).length}块`}`).join('，');

      // ---- 棋盘坐标：7×7 外圈，起点在右下角，顺时针 ----
      const pos = i => i <= 6 ? { x: (6 - i) * S7, y: 6 * S7 } : i <= 12 ? { x: 0, y: (12 - i) * S7 }
        : i <= 18 ? { x: (i - 12) * S7, y: 0 } : { x: 6 * S7, y: (i - 18) * S7 };

      const PIPS = { 1: [[.5, .5]], 2: [[.25, .25], [.75, .75]], 3: [[.25, .25], [.5, .5], [.75, .75]], 4: [[.25, .25], [.75, .25], [.25, .75], [.75, .75]],
        5: [[.25, .25], [.75, .25], [.5, .5], [.25, .75], [.75, .75]], 6: [[.25, .25], [.75, .25], [.25, .5], [.75, .5], [.25, .75], [.75, .75]] };
      const die = (x, y, v, sz) => {
        ctx.fillStyle = '#fff'; ctx.fillRect(x, y, sz, sz);
        ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.strokeRect(x, y, sz, sz);
        ctx.fillStyle = '#1e1e1e';
        PIPS[v].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(x + a * sz, y + b * sz, sz / 10, 0, 7); ctx.fill(); });
      };
      const wrap = (text, maxW) => {
        const out = []; let line = '';
        for (const ch of text) { if (ctx.measureText(line + ch).width > maxW) { out.push(line); line = ch; } else line += ch; }
        if (line) out.push(line);
        return out;
      };

      const draw = () => {
        const S = S7;
        ctx.fillStyle = C.bg; ctx.fillRect(0, 0, cv.width, cv.height);
        // 中间区域
        ctx.fillStyle = C.panel; ctx.fillRect(S, S, S * 5, S * 5);
        ctx.globalAlpha = 0.1; ctx.font = '22px sans-serif'; ctx.textAlign = 'center';
        [[1.7, 1.6], [5.2, 2.4], [2.2, 4.6], [5, 5.3]].forEach(([a, b]) => ctx.fillText('🐾', a * S, b * S));
        ctx.globalAlpha = 1;
        ctx.fillStyle = C.text; ctx.font = 'bold 14px sans-serif';
        ctx.fillText('🐾 宠物大富翁', S * 3.5, S + 20);
        ctx.font = '11px sans-serif';
        ctx.fillText(players.length ? `第 ${Math.min(round, MAX)} / ${MAX} 轮` : '选好对手就开始', S * 3.5, S + 36);
        if (dice.length === 1) die(S * 3.5 - 15, S + 44, dice[0], 30);
        if (dice.length === 2) { die(S * 3.5 - 34, S + 44, dice[0], 30); die(S * 3.5 + 4, S + 44, dice[1], 30); }
        // 最近一件事
        ctx.font = '11px sans-serif';
        wrap(evt, S * 4.6).slice(0, 3).forEach((l, i) => ctx.fillText(l, S * 3.5, S + 92 + i * 14));
        // 玩家
        ctx.textAlign = 'left';
        players.forEach((pl, i) => {
          const y = S + 140 + i * 22;
          if (i === cur && !pl.out) { ctx.globalAlpha = 0.18; ctx.fillStyle = pl.color; ctx.fillRect(S + 6, y - 2, S * 5 - 12, 20); ctx.globalAlpha = 1; }
          Pet.drawSprite(ctx, pl.pet, S + 10, y, 1.5);
          ctx.fillStyle = pl.color; ctx.fillRect(S + 28, y + 5, 6, 6);
          ctx.fillStyle = C.text; ctx.font = '11px sans-serif';
          const it = Object.entries(pl.items).filter(([, n]) => n).map(([k, n]) => ITEMS[k].i + (n > 1 ? n : '')).join('');
          ctx.fillText(`${pl.name.slice(0, 5)}  ¥${pl.money}${pl.out ? ' 破产' : pl.skip ? ' 住院' : ''} ${it}`, S + 38, y + 12);
        });
        // 格子
        ctx.textAlign = 'center';
        tiles.forEach((t, i) => {
          const { x, y } = pos(i), o = t.owner && byId(t.owner), corner = i % 6 === 0;
          ctx.fillStyle = corner ? C.acc : C.them; ctx.fillRect(x + 1, y + 1, S - 2, S - 2);
          if (o) { ctx.globalAlpha = 0.2; ctx.fillStyle = o.color; ctx.fillRect(x + 1, y + 1, S - 2, S - 2); ctx.globalAlpha = 1; }
          if (t.g != null) { ctx.fillStyle = GROUPS[t.g]; ctx.fillRect(x + 1, y + 1, S - 2, 6); }
          ctx.strokeStyle = o ? o.color : C.line; ctx.lineWidth = o ? 2 : 1;
          ctx.strokeRect(x + 1.5, y + 1.5, S - 3, S - 3);
          ctx.fillStyle = C.text; ctx.font = '8px sans-serif';
          ctx.fillText(t.n.slice(0, 4), x + S / 2, y + 15);
          ctx.font = corner ? '18px sans-serif' : '14px sans-serif';
          ctx.fillText(t.i, x + S / 2, y + 33);
          if (t.price) {
            ctx.font = '8px sans-serif'; ctx.fillStyle = C.text;
            if (t.lv === 3) { ctx.fillStyle = '#e04a3a'; ctx.fillRect(x + S / 2 - 8, y + S - 10, 16, 6); }
            else if (t.lv) for (let k = 0; k < t.lv; k++) { ctx.fillStyle = '#3aa050'; ctx.fillRect(x + S / 2 - 8 + k * 10, y + S - 10, 6, 6); }
            else ctx.fillText(o ? '租' + rent(t) : '¥' + t.price, x + S / 2, y + S - 4);
          }
        });
        // 棋子
        const bob = Math.floor(performance.now() / 300) % 2;
        players.forEach((pl, k) => {
          if (pl.out) return;
          const { x, y } = pos(pl.pos), ox = x + 5 + (k % 2) * 22, oy = y + 16 + (k >> 1) * 15;
          ctx.fillStyle = pl.color; ctx.fillRect(ox, oy + 14, 14, 2);
          Pet.drawSprite(ctx, pl.pet, ox, oy - (k === cur ? bob : 0), 1.4);
        });
      };
      // 棋子会上下跳，隔一会儿重画一次
      const animT = setInterval(() => { if (!stopped && players.length) draw(); }, 300);

      // ---- 下方界面：动态记录 / 操作按钮 / 聊天 ----
      const $u = s => $(s, ui);
      const log = (text, pl = null) => {
        evt = text;
        logs.unshift({ r: round, text, color: pl?.color || C.line });
        logs = logs.slice(0, 80);
        const box = $u('#mono-log');
        if (box) box.innerHTML = logs.map(l => `<div><i style="background:${l.color}"></i><small>第${l.r}轮</small> ${esc(l.text)}</div>`).join('');
        draw();
      };
      const setTurn = pl => { const t = $u('#mono-turn'); if (t) t.innerHTML = `轮到 <b style="color:${pl.color}">${esc(pl.name)}</b>`; };
      const actBox = html => { const b = $u('#mono-act'); if (b) b.innerHTML = html; };
      const ask = opts => new Promise(res => {
        const box = $u('#mono-act');
        if (!box) return;
        box.innerHTML = opts.map((o, i) => `<button class="btn ${i ? 'ghost' : ''}" data-o="${i}">${esc(o.label)}</button>`).join('');
        box.onclick = e => {
          const b = e.target.closest('[data-o]');
          if (!b) return;
          box.innerHTML = '';
          box.onclick = null;
          res(opts[b.dataset.o].value);
        };
      });

      // ---- 聊天：你发消息角色会回；游戏里发生大事时角色也会主动说几句 ----
      let talking = false, lastTalk = 0, pendingUser = '';
      const addChat = (id, name, text) => {
        chat.push({ id, name, text });
        const box = $u('#mono-msgs');
        if (!box) return;
        const color = byId(id)?.color || C.text;
        box.innerHTML = chat.slice(-40).map(c => `<div class="mono-c${c.id === 'user' ? ' me' : ''}"><b style="color:${byId(c.id)?.color || C.text}">${esc(c.name)}</b>：${esc(c.text)}</div>`).join('');
        box.scrollTop = box.scrollHeight;
      };
      const aiTalk = async (desc, sid, userText) => {
        const cs = players.slice(1).map(x => charById(x.id)).filter(Boolean), names = cs.map(c => c.name), sp = sid && charById(sid);
        const system = [
          `你在同时扮演${names.join('、')}。他们正在和${me.name}用手机玩一局宠物大富翁（棋子是各自的宠物），大家边玩边在游戏的聊天框里打字聊天。`,
          ...cs.map(c => `【${c.name}的设定】\n${(c.persona || '（无）').slice(0, 800)}\n和${me.name}的关系：${getRel(pid, c.id).desc || '认识'}`),
          `【要求】\n- 每行一条，格式：名字：内容。名字只能是${names.join('、')}，绝对不要替${me.name}说话。\n- 一共 1 到 3 条，都很短，像打游戏时随手打的字：得意、心疼钱、吐槽、起哄、互相拆台都可以，要符合各自的性格和关系。\n- 不写动作、神态和旁白。`,
        ].join('\n\n');
        const task = [
          `【局面】第 ${round}/${MAX} 轮。${standing()}`,
          `【刚才发生的】\n${logs.slice(0, 6).reverse().map(l => l.text).join('\n')}`,
          chat.length && `【聊天框】\n${chat.slice(-8).map(x => x.name + '：' + x.text).join('\n')}`,
          userText ? `${me.name}刚刚在聊天框说：${userText}。要有人回应。` : `${desc}。${sp ? `这次主要是${sp.name}开口，` : ''}说一两句就行。`,
        ].filter(Boolean).join('\n\n');
        const out = await API.claude(system, [{ role: 'user', content: task }], { maxTokens: 250 });
        return Prompt.parseLines(out, names).msgs.filter(m => m.content && m.type !== 'sys').slice(0, 3)
          .map(m => ({ id: cs.find(c => c.name === m.name).id, name: m.name, content: m.content }));
      };
      const localTalk = sid => {
        const c = byId(sid) || pick(players.slice(1));
        return [{ id: c.id, name: c.name, content: pick(['哈哈哈哈', '等着瞧', '这把我要赢', '我的钱啊😭', '稳住', '你运气也太好了吧', '下一个就是你']) }];
      };
      const talk = async (desc, sid = null, userText = '') => {
        if (talking) { if (userText) pendingUser = userText; return; }
        talking = true;
        try {
          const lines = S.settings.claude.key ? await aiTalk(desc, sid, userText) : localTalk(sid);
          for (const l of lines) { if (stopped) break; await wait(900); addChat(l.id, l.name, l.content); }
        } catch (e) { Log.add('大富翁聊天失败', e.message); }
        finally {
          talking = false; lastTalk = Date.now();
          if (pendingUser && !stopped) { const u = pendingUser; pendingUser = ''; talk('', null, u); }
        }
      };
      // 自动反应：至少隔 15 秒，而且不是每次都说，省 API 费用
      const react = (desc, sid = null) => {
        if (talking || Date.now() - lastTalk < 15000 || Math.random() > 0.55) return;
        talk(desc, sid);
      };

      // ---- 钱 ----
      const liquidate = pl => {
        const mine = () => tiles.filter(t => t.owner === pl.id);
        while (pl.money < 0) {
          const h = mine().filter(t => t.lv).sort((a, b) => b.lv - a.lv)[0];
          if (h) { h.lv--; const v = Math.round(upCost(h) / 2); pl.money += v; log(`${pl.name}卖掉了${h.n}的一级房子，换回 ¥${v}`, pl); continue; }
          const t = mine().sort((a, b) => a.price - b.price)[0];
          if (t) { t.owner = null; const v = Math.round(t.price / 2); pl.money += v; log(`${pl.name}把${t.n}卖给了银行，换回 ¥${v}`, pl); continue; }
          pl.out = true;
          log(`💀 ${pl.name}破产出局了`, pl);
          react(`${pl.name}破产出局了`, pl.id === 'user' ? null : pl.id);
          break;
        }
      };
      const pay = (from, to, amt) => {
        if (from.out || amt <= 0) return;
        from.money -= amt;
        if (to && !to.out) to.money += amt;
        if (from.money < 0) liquidate(from);
      };

      // ---- 移动 ----
      const walk = async (pl, n) => {
        for (let i = 0; i < n && !stopped; i++) {
          pl.pos = (pl.pos + 1) % N;
          if (pl.pos === 0) { pl.money += 200; log(`${pl.name}经过起点，领了 ¥200`, pl); }
          draw();
          await W8(280);
        }
      };
      const back = async (pl, n) => {
        for (let i = 0; i < n && !stopped; i++) { pl.pos = (pl.pos - 1 + N) % N; draw(); await W8(280); }
      };
      const moveTo = (pl, idx) => walk(pl, (idx - pl.pos + N) % N);

      // ---- 卡片 ----
      const CHANCE = [
        ['宠物选美拿了第一名，奖金 ¥150', pl => { pl.money += 150; }],
        ['在草丛里捡到一袋小鱼干，卖了 ¥60', pl => { pl.money += 60; }],
        ['获得一个遥控骰子 🎮', pl => { pl.items.remote++; }],
        ['获得一张免租卡 🛡️', pl => { pl.items.free++; }],
        ['获得一张双骰卡 🎲', pl => { pl.items.double++; }],
        ['宠物撒腿狂奔，向前 3 格', async pl => { await walk(pl, 3); await land(pl); }],
        ['宠物想家了，直接跑回起点', async pl => { await moveTo(pl, 0); }],
        ['朋友叫你们去公园玩', async pl => { await moveTo(pl, 12); await land(pl); }],
      ];
      const FATE = [
        ['宠物打翻了邻居的花盆，赔 ¥80', pl => pay(pl, null, 80)],
        ['宠物随地便便被罚款 ¥50', pl => pay(pl, null, 50)],
        ['宠物吃坏了肚子，直接去医院住一轮', pl => { pl.pos = 6; pl.skip = 1; }],
        ['给所有房子做维修，每级 ¥25', pl => { const n = tiles.filter(t => t.owner === pl.id).reduce((s, t) => s + t.lv, 0); pay(pl, null, n * 25); log(`一共 ${n} 级，付了 ¥${n * 25}`, pl); }],
        ['今天是你宠物的生日，每人送你 ¥30', pl => others(pl).forEach(o => pay(o, pl, 30))],
        ['请大家喝奶茶，每人 ¥25', pl => others(pl).forEach(o => pay(pl, o, 25))],
        ['宠物被路边的猫吓得后退 2 格', async pl => { await back(pl, 2); await land(pl); }],
        ['一场暴风雨，你最贵的房子降了一级', pl => {
          const t = tiles.filter(x => x.owner === pl.id && x.lv).sort((a, b) => b.price - a.price)[0];
          log(t ? `${t.n}降到了${LV[--t.lv]}` : '还好你没有房子', pl);
        }],
      ];

      // ---- 角色的决策（本地规则，不调 AI） ----
      const aiBuy = (pl, t) => {
        const completes = tiles.filter(x => x.g === t.g && x !== t).every(x => x.owner === pl.id);
        return pl.money - t.price >= 120 + (1 - pl.greed) * 280 || (completes && pl.money - t.price >= 50);
      };
      const aiUp = (pl, c) => pl.money - c >= 200 + (1 - pl.greed) * 300;
      const aiRemote = pl => {
        let best = 0, bv = 0;
        for (let v = 1; v <= 6; v++) {
          const t = tiles[(pl.pos + v) % N];
          const sc = t.price ? (!t.owner ? (pl.money > t.price ? t.price : 0) : t.owner === pl.id ? 50 : -rent(t)) : 0;
          if (sc > bv) { bv = sc; best = v; }
        }
        return bv > 0 && Math.random() < 0.7 ? best : 0;
      };

      // ---- 落地 ----
      const land = async pl => {
        if (stopped || pl.out) return;
        const t = tiles[pl.pos], mine = pl.id === 'user';
        if (t.price) {
          if (!t.owner) {
            if (pl.money < t.price) return log(`${pl.name}想买${t.n}，可惜钱不够`, pl);
            const yes = mine ? await ask([{ label: `买下${t.n}（¥${t.price}）`, value: true }, { label: '不买', value: false }]) : aiBuy(pl, t);
            if (stopped) return;
            if (!yes) return log(`${pl.name}没买${t.n}`, pl);
            pl.money -= t.price; t.owner = pl.id;
            log(`${pl.name}买下了${t.i}${t.n}`, pl);
            if (setOwned(t)) log(`${pl.name}集齐了一整组，这组过路费翻倍`, pl);
            if (!mine) react(`${pl.name}刚买下了${t.n}${setOwned(t) ? '，还集齐了一整组' : ''}`, pl.id);
          } else if (t.owner === pl.id) {
            if (t.lv >= 3) return log(`${pl.name}在自己的${t.n}转了一圈`, pl);
            const c = upCost(t);
            if (pl.money < c) return log(`${pl.name}想升级${t.n}，钱不够`, pl);
            const yes = mine
              ? await ask([{ label: `升级成${LV[t.lv + 1]}（¥${c}，过路费 ${rent(t)}→${rent({ ...t, lv: t.lv + 1 })}）`, value: true }, { label: '先不升级', value: false }])
              : aiUp(pl, c);
            if (stopped || !yes) return;
            pl.money -= c; t.lv++;
            log(`${pl.name}把${t.n}升级成了${LV[t.lv]}`, pl);
            if (!mine && t.lv === 3) react(`${pl.name}把${t.n}升成了宠物乐园，过路费很贵`, pl.id);
          } else {
            const o = byId(t.owner), r = rent(t);
            if (pl.items.free) {
              const use = mine ? await ask([{ label: `用免租卡（还剩 ${pl.items.free} 张）`, value: true }, { label: `付 ¥${r}`, value: false }]) : r >= 60;
              if (stopped) return;
              if (use) {
                pl.items.free--;
                log(`${pl.name}用免租卡躲过了${o.name}的 ¥${r}`, pl);
                if (mine || o.id === 'user') react(`${pl.name}用免租卡躲过了${o.name}的过路费`, mine ? o.id : pl.id);
                return;
              }
            }
            log(`${pl.name}踩到${o.name}的${t.n}，付过路费 ¥${r}`, pl);
            pay(pl, o, r);
            if (mine || o.id === 'user') react(`${pl.name}踩到${o.name}的${t.n}，付了 ¥${r} 过路费`, mine ? o.id : pl.id);
          }
          return;
        }
        if (t.k === 'start') { pl.money += 100; log(`${pl.name}正好停在起点，额外奖励 ¥100`, pl); }
        else if (t.k === 'tax') { log(`${pl.name}交了宠物税 ¥${t.v}`, pl); pay(pl, null, t.v); }
        else if (t.k === 'jail') { log(`${pl.name}带宠物去体检，花了 ¥30`, pl); pay(pl, null, 30); }
        else if (t.k === 'sport') {
          await W8(500);
          const d = 1 + R(6); dice = [d]; draw();
          pl.money += d * 30;
          log(`${pl.name}的宠物在运动会上掷出 ${d}，拿到奖金 ¥${d * 30}`, pl);
        } else if (t.k === 'park') {
          const a = mine ? await ask([{ label: '捡 ¥50', value: 'money' }, { label: '随机拿一个道具', value: 'item' }]) : 'money';
          if (stopped) return;
          if (a === 'money') { pl.money += 50; log(`${pl.name}在公园捡到 ¥50`, pl); }
          else { const k = pick(Object.keys(ITEMS)); pl.items[k]++; log(`${pl.name}在公园捡到一个${ITEMS[k].i}${ITEMS[k].n}`, pl); }
        } else if (t.k === 'bus') {
          const to = pl.pos === 11 ? 21 : 11;
          const yes = mine ? await ask([{ label: `花 ¥30 坐车去另一个公交站`, value: true }, { label: '不坐', value: false }]) : pl.money > 300 && Math.random() < 0.5;
          if (stopped || !yes || pl.money < 30) return;
          pay(pl, null, 30);
          if (to < pl.pos) { pl.money += 200; log(`${pl.name}坐车路过起点，领了 ¥200`, pl); }
          pl.pos = to;
          log(`${pl.name}坐公交到了另一边`, pl);
        } else if (t.k === 'shop') {
          const can = Object.entries(ITEMS).filter(([, v]) => pl.money >= v.price);
          if (!can.length) return log(`${pl.name}逛了逛道具店，什么都买不起`, pl);
          const k = mine
            ? await ask([...can.map(([k, v]) => ({ label: `买${v.i}${v.n}（¥${v.price}）`, value: k })), { label: '不买', value: null }])
            : pl.money > 700 && Math.random() < pl.greed ? pick(can)[0] : null;
          if (stopped) return;
          if (!k) return log(`${pl.name}在道具店逛了一圈，没买`, pl);
          pl.money -= ITEMS[k].price; pl.items[k]++;
          log(`${pl.name}买了一个${ITEMS[k].i}${ITEMS[k].n}`, pl);
        } else if (t.k === 'chance' || t.k === 'fate') {
          const [text, fn] = pick(t.k === 'chance' ? CHANCE : FATE);
          log(`${pl.name}抽到${t.k === 'chance' ? '机会' : '命运'}：${text}`, pl);
          await W8(900);
          await fn(pl);
        }
        draw();
      };

      // ---- 一个回合 ----
      const turn = async pl => {
        cur = players.indexOf(pl);
        setTurn(pl); draw();
        if (pl.skip) {
          if (pl.id === 'user') {
            const a = await ask([{ label: '等一轮', value: 'wait' }, ...(pl.money >= 50 ? [{ label: '花 ¥50 提前出院', value: 'pay' }] : [])]);
            if (a === 'pay') { pay(pl, null, 50); pl.skip = 0; log(`${pl.name}花 ¥50 让宠物提前出院`, pl); }
          } else if (pl.money > 600 && Math.random() < 0.6) { pay(pl, null, 50); pl.skip = 0; log(`${pl.name}花 ¥50 让宠物提前出院`, pl); }
          if (pl.skip) { pl.skip--; log(`${pl.name}的宠物还在住院，这轮休息`, pl); await W8(1200); return; }
        }
        let two = false, fixed = 0;
        if (pl.id === 'user') {
          const opts = [{ label: '🎲 掷骰子', value: 'roll' }];
          if (pl.items.double) opts.push({ label: `🎲🎲 双骰卡（${pl.items.double}）`, value: 'double' });
          if (pl.items.remote) opts.push({ label: `🎮 遥控骰子（${pl.items.remote}）`, value: 'remote' });
          const a = await ask(opts);
          if (a === 'double') { pl.items.double--; two = true; }
          if (a === 'remote') {
            fixed = await ask([1, 2, 3, 4, 5, 6].map(v => ({ label: `走 ${v} 步 → ${tiles[(pl.pos + v) % N].n}`, value: v })));
            pl.items.remote--;
          }
        } else {
          actBox(`<p class="mono-wait">${esc(pl.name)}在想……</p>`);
          await W8(1000);
          if (pl.items.remote) { const v = aiRemote(pl); if (v) { pl.items.remote--; fixed = v; } }
          if (!fixed && pl.items.double && Math.random() < 0.3) { pl.items.double--; two = true; }
        }
        if (stopped) return;
        let n;
        if (fixed) { dice = [fixed]; n = fixed; log(`${pl.name}用了遥控骰子，走 ${n} 步`, pl); }
        else {
          for (let i = 0; i < 8; i++) { dice = Array.from({ length: two ? 2 : 1 }, () => 1 + R(6)); draw(); await wait(80); }
          n = dice.reduce((a, b) => a + b, 0);
          log(`${pl.name}${two ? '用了双骰卡，' : ''}掷出了 ${dice.join(' + ')}${two ? ' = ' + n : ''}`, pl);
        }
        await W8(700);
        await walk(pl, n);
        if (stopped) return;
        await land(pl);
        if (pl.id !== 'user') actBox('');
        await W8(pl.id === 'user' ? 500 : 1000);
      };

      const finishGame = async () => {
        clearInterval(animT);
        const rank = [...players].sort((a, b) => worth(b) - worth(a)), win = rank[0];
        const place = rank.indexOf(players[0]) + 1;
        const summary = `${win.name}赢了。` + rank.map((x, i) => `第${i + 1}名${x.name}（${x.out ? '破产' : '总资产¥' + worth(x)}）`).join('，');
        log(`🏆 ${win.name}赢了`, win);
        const t = $u('#mono-turn'); if (t) t.textContent = '游戏结束';
        const box = $u('#mono-act');
        if (box) {
          box.onclick = null;
          box.innerHTML = `<div class="mono-result"><b>🏆 ${esc(win.name)} 赢了</b><ol>${rank.map(x => `<li>${esc(x.name)}：${x.out ? '破产' : '¥' + worth(x)}</li>`).join('')}</ol></div>
            <button class="btn" data-again>再来一局</button><button class="btn ghost" data-pa="back">返回</button>`;
          $('[data-again]', box).onclick = () => Pet.renderGame('monopoly');
        }
        done(place === 1 ? 20 : Math.max(2, 12 - place * 3));
        // 写进每个角色的私聊，之后聊天时角色会记得这局
        const chars = players.slice(1).map(x => charById(x.id)).filter(Boolean);
        for (const c of chars) await addMsg(Conv.dm(pid, c.id), 'user', `${me.name} 和 ${chars.map(x => x.name).join('、')} 一起玩了一局宠物大富翁。${summary}`, 'sys');
        for (let i = 0; i < 40 && talking; i++) await wait(250);
        if (!stopped) talk(`游戏结束了。${summary}说说赛后感想`);
      };

      const loop = async () => {
        while (!stopped) {
          const pl = players[cur];
          if (!pl.out) await turn(pl);
          if (stopped) return;
          if (players.filter(x => !x.out).length <= 1 || players[0].out) break;
          cur = (cur + 1) % players.length;
          if (cur === 0) {
            if (++round > MAX) break;
            log(`—— 第 ${round} 轮 ——`);
            if (round % 6 === 0) react(`已经第 ${round} 轮了，现在的局势：${standing()}`);
          }
        }
        if (!stopped) finishGame();
      };

      const begin = chars => {
        const sps = Object.keys(SPECIES), items = () => ({ remote: 0, double: 0, free: 0 });
        players = [
          { id: 'user', name: me.name, pet: p, money: 1500, pos: 0, out: false, skip: 0, color: COL[0], items: items() },
          ...chars.map((c, i) => {
            // 优先用角色自己养的宠物，没有就临时借一只
            let pet = Pet.list.find(x => x.owners.includes(c.id) && Pet.visible(x));
            if (!pet) { const sp = pick(sps); pet = { sp, color: R(SPECIES[sp].colors.length) }; }
            return { id: c.id, name: c.name, pet, money: 1500, pos: 0, out: false, skip: 0, color: COL[i + 1], greed: 0.3 + Math.random() * 0.6, items: items() };
          }),
        ];
        ui.innerHTML = `<div class="mono-bar"><span id="mono-turn"></span>
            <select id="mono-spd" aria-label="速度"><option value="slow">慢</option><option value="mid">中</option><option value="fast">快</option></select></div>
          <div class="pet-acts" id="mono-act"></div>
          <h3>动态</h3><div class="mono-log" id="mono-log"></div>
          <h3>聊天</h3><div class="mono-msgs" id="mono-msgs"><p class="mono-wait">可以和大家说点什么</p></div>
          <div class="mono-inp"><input id="mono-in" maxlength="60" placeholder="比如：这把我赢定了" aria-label="聊天内容"><button class="btn" data-send>发送</button></div>`;
        const sel = $u('#mono-spd');
        sel.value = Object.keys(SPD).find(k => SPD[k] === spd) || 'slow';
        sel.onchange = () => { spd = SPD[sel.value]; p.games.monoSpd = sel.value; Pet.save(); };
        const send = () => {
          const inp = $u('#mono-in'), text = inp.value.trim();
          if (!text) return;
          inp.value = '';
          addChat('user', me.name, text);
          talk('', null, text);
        };
        $('[data-send]', ui).onclick = send;
        $u('#mono-in').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); send(); } };
        log('游戏开始，大家都有 ¥1500');
        talk('游戏刚开始，大家打个招呼、放放狠话');
        loop();
      };

      // ---- 开局设置 ----
      const cands = S.chars.filter(c => knows(pid, c.id) && !getRel(pid, c.id).theyBlock);
      draw();
      if (!cands.length) {
        ui.innerHTML = '<p class="empty">还没有认识的角色，先去关系网里设置一下吧。</p>';
        return { stop() { stopped = true; clearInterval(animT); } };
      }
      ui.innerHTML = `<h3>和谁一起玩（1 到 3 个）</h3><div class="card">${cands.map(c => `<label class="row"><span>${esc(c.name)}</span>
          <input type="checkbox" data-mc="${c.id}"></label>`).join('')}</div>
        <div class="flex" style="gap:8px">
          <label class="field" style="flex:1"><span>轮数</span><select id="mono-r"><option>20</option><option>30</option><option>40</option></select></label>
          <label class="field" style="flex:1"><span>速度</span><select id="mono-s"><option value="slow">慢</option><option value="mid">中</option><option value="fast">快</option></select></label>
        </div>
        <button class="btn" data-start style="margin-top:8px">开始</button>`;
      $u('#mono-s').value = p.games.monoSpd || 'slow';
      $('[data-start]', ui).onclick = () => {
        const ids = $$('[data-mc]', ui).filter(x => x.checked).map(x => x.dataset.mc);
        if (!ids.length) return toast('至少选一个角色');
        if (ids.length > 3) return toast('最多 3 个');
        MAX = Number($u('#mono-r').value);
        p.games.monoSpd = $u('#mono-s').value;
        spd = SPD[p.games.monoSpd];
        begin(ids.map(charById));
      };
      return { stop() { stopped = true; clearInterval(animT); } };
    },
  },
};
