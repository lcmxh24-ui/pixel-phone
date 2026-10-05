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
  hamster: { name: '仓鼠', map: ['.DD....DD.', '.DBBBBBBD.', 'BBEBBBBEBB', 'BBBBPPBBBB', 'BWWWNNWWWB', 'BWWWWWWWWB', '.BWWWWWWB.', '..BBBBBB..', '..P....P..'],
    colors: [{ n: '金丝熊', B: '#f0b860', D: '#c08040', W: '#fff4e0' }, { n: '银灰', B: '#c8c8cc', D: '#909098', W: '#ffffff' }, { n: '布丁', B: '#f4d890', D: '#d0a850', W: '#fffaf0' }] },
  penguin: { name: '企鹅', map: ['...BBBB...', '..BBBBBB..', '..WEWWEW..', '..WWKKWW..', '.BBWWWWBB.', 'BBWWWWWWBB', '.BWWWWWWB.', '.BWWWWWWB.', '..BWWWWB..', '..KK..KK..'],
    colors: [{ n: '帝企鹅', B: '#2a2e3a', D: '#1a1e28', W: '#ffffff' }, { n: '小蓝', B: '#5a80b0', D: '#3a5a88', W: '#f4f8ff' }] },
  fox: { name: '狐狸', map: ['B.......B.', 'BB.....BB.', 'BBBBBBBBB.', 'BWEBBBEWB.', '.WWWNWWW..', '..WWWWW..D', '.BBBBBBBDD', '.BBBBBBBDW', '.BB.BB.B..', '.DD.DD.D..'],
    colors: [{ n: '赤狐', B: '#e07830', D: '#3a2418', W: '#ffffff' }, { n: '北极狐', B: '#f4f4f8', D: '#c0c4cc', W: '#ffffff', E: '#3a3a48' }, { n: '银狐', B: '#5a5a64', D: '#2a2a30', W: '#e8e8ee' }] },
  // 水豚：侧身，头朝左，头顶顶着一个小橘子（K 是公共色板里的橘色）
  capybara: { name: '水豚', map: [
      '.KK.......',
      'DBBD......',
      'BBBBBBBBB.',
      'BEBBBBBBBB',
      'BBBBBBBBBB',
      'NBBWWWWBBB',
      '.BBWWWWBB.',
      '.BB....BB.',
      '.DD....DD.'],
    colors: [
      { n: '原味', B: '#a87850', D: '#6a4a2a', W: '#c89a70' },
      { n: '奶茶', B: '#d0a878', D: '#9a7448', W: '#ecd0a8' },
      { n: '巧克力', B: '#6e4a30', D: '#3e2818', W: '#8e6a4a' },
    ] },
  // 北极熊：正面，圆耳朵，白肚皮
  polarbear: { name: '北极熊', map: [
      'BB....BB..',
      'BBBBBBBB..',
      'BEBBBBEB..',
      'BBBNNBBB..',
      '.BBBBBB...',
      'BBBBBBBBD.',
      'BWWWWWWBD.',
      'BWWWWWWB..',
      'BB.BB.BB..',
      '.DD..DD...'],
    colors: [
      { n: '雪白', B: '#f4f4f0', D: '#c8c8c0', W: '#ffffff' },
      { n: '奶油', B: '#f4ead2', D: '#cdbf9c', W: '#fffaf0' },
      { n: '冰川蓝', B: '#e4eef8', D: '#a8bccf', W: '#ffffff' },
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
// 小院里的场景，画法和宠物一样：一个字符一个像素
const YARD_PROPS = {
  tree: { pal: { G: '#5f9a3a', L: '#7cc850', T: '#8a5a2a' }, map: [
    '..GGGGG..', '.GGLGGGG.', 'GGGGGLGGG', 'GLGGGGGGG', 'GGGGGGLGG', '.GGGGGGG.', '..GGGGG..', '....T....', '....T....', '...TTT...'] },
  house: { pal: { R: '#e04a3a', W: '#f0d8a8', D: '#5a3a18' }, map: [
    '....R....', '...RRR...', '..RRRRR..', '.RRRRRRR.', '.WWWWWWW.', '.WWDDDWW.', '.WWDDDWW.', '.WWDDDWW.'] },
  bowl: { pal: { F: '#e8902a', B: '#4a90d0' }, map: ['.FFFF.', 'BBBBBB', '.BBBB.'] },
  flower: { pal: { P: '#f490b0', Y: '#f8d838', G: '#4f8a2a' }, map: ['.P.', 'PYP', '.P.', '.G.', '.G.'] },
  flower2: { pal: { P: '#a888d8', Y: '#ffffff', G: '#4f8a2a' }, map: ['.P.', 'PYP', '.P.', '.G.'] },
  grass: { pal: { G: '#4f8a2a' }, map: ['.G..G.', 'GG.GGG'] },
};
// 每种动物的性格：想调整某只动物的表现改这里
// speed 速度倍数；gait 走路方式 walk/hop(蹦着走)/leap(大跳)/float(飘)/waddle(摇摆)
// acts 专属动作；sleep 睡姿 curl(蜷)/side(侧躺)/float(飘着)/stand(站着)/perch(停树上)
// home 睡觉去哪 house/tree；say 叫声；dream 梦话；nightOwl 睡前会嚎一声
const TRAITS = {
  chick:   { speed: 0.8, gait: 'hop',  acts: ['peck', 'peck', 'flap', 'roll'], sleep: 'curl', home: 'house', say: ['叽', '叽叽'], dream: '🌾' },
  rabbit:  { speed: 1,   gait: 'hop',  acts: ['binky', 'thump', 'groom', 'loaf'], sleep: 'curl', home: 'house', say: ['…'], dream: '🥕' },
  dog:     { speed: 1.2, gait: 'walk', acts: ['roll', 'roll', 'dig', 'wag', 'stretch'], sleep: 'side', home: 'house', say: ['汪', '汪汪'], dream: '🦴' },
  wolf:    { speed: 1.3, gait: 'walk', acts: ['howl', 'stretch', 'roll'], sleep: 'curl', home: 'tree', say: ['嗷呜~'], dream: '🌕', nightOwl: true },
  cat:     { speed: 0.9, gait: 'walk', acts: ['groom', 'groom', 'stretch', 'roll', 'loaf', 'pounce'], sleep: 'curl', home: 'tree', say: ['喵'], dream: '🐟' },
  jelly:   { speed: 0.5, gait: 'float', acts: ['glow', 'glow', 'spin'], sleep: 'float', say: ['~'], dream: '🫧' },
  cheetah: { speed: 2,   gait: 'walk', acts: ['sprint', 'stretch', 'loaf', 'groom'], sleep: 'side', home: 'tree', say: ['呼噜'], dream: '💨' },
  tit:     { speed: 1,   gait: 'hop',  acts: ['flutter', 'flutter', 'peck'], sleep: 'perch', home: 'tree', say: ['啾', '啾啾'], dream: '🌸' },
  cow:     { speed: 0.5, gait: 'walk', acts: ['graze', 'graze', 'moo', 'loaf'], sleep: 'stand', say: ['哞~'], dream: '🌿' },
  frog:    { speed: 0.8, gait: 'leap', acts: ['croak', 'tongue', 'loaf'], sleep: 'curl', say: ['呱', '呱呱'], dream: '🪰' },
  dino:    { speed: 1.1, gait: 'walk', acts: ['roar', 'stomp', 'roll'], sleep: 'curl', home: 'tree', say: ['嗷!'], dream: '🍖' },
  hamster: { speed: 1.1, gait: 'walk', acts: ['groom', 'dig', 'roll', 'loaf'], sleep: 'curl', home: 'house', say: ['吱'], dream: '🌻' },
  penguin: { speed: 0.6, gait: 'waddle', acts: ['slide', 'slide', 'flap'], sleep: 'stand', say: ['嘎'], dream: '🐟' },
  fox:     { speed: 1.2, gait: 'walk', acts: ['pounce', 'pounce', 'groom', 'roll'], sleep: 'curl', home: 'tree', say: ['嘤'], dream: '🐭' },
  capybara:  { speed: 0.5, gait: 'walk', acts: ['loaf', 'loaf', 'graze', 'groom'], sleep: 'side', home: 'house', say: ['咕'], dream: '🍊' },
  polarbear: { speed: 0.9, gait: 'walk', acts: ['roll', 'slide', 'stretch', 'dig'], sleep: 'curl', home: 'house', say: ['呜~'], dream: '🐟' },
};
// 动作持续时间（毫秒，最短-最长）
const ACT_MS = { roll: [2000, 3000], stretch: [1600, 1600], loaf: [4000, 7000], groom: [2500, 4000], wag: [1500, 2500], dig: [2000, 3000],
  howl: [2500, 3000], peck: [2000, 3500], flap: [1500, 2000], flutter: [2500, 4000], sprint: [1500, 2500], graze: [3000, 5000],
  moo: [1500, 1500], croak: [1500, 2000], tongue: [1200, 1200], roar: [1500, 1500], stomp: [1500, 2000], glow: [2500, 3500],
  binky: [2000, 2500], thump: [1500, 2000], slide: [1500, 2500], pounce: [2000, 2000], spin: [2000, 3000] };
// ===== 装扮：所有宠物通用 =====
// 头饰用小点阵（自动戴在头顶）；脸部和脖子用 gen 按眼睛位置生成，换动物不用改
const WEAR_SLOTS = { head: '头饰', face: '脸部', neck: '脖子' };
const WEAR = {
  bow:    { slot: 'head', n: '蝴蝶结', i: '🎀', pal: { R: '#f06080', D: '#b83058' }, map: ['RR.RR', 'RRDRR'] },
  crown:  { slot: 'head', n: '小皇冠', i: '👑', pal: { Y: '#f0c030', R: '#e04a3a', B: '#4a90d0' }, map: ['Y.Y.Y', 'YRYBY', 'YYYYY'] },
  tophat: { slot: 'head', n: '小礼帽', i: '🎩', pal: { K: '#2a2a30', R: '#e04a3a' }, map: ['.KKK.', '.KKK.', '.RRR.', 'KKKKK'] },
  straw:  { slot: 'head', n: '草帽', i: '👒', pal: { S: '#e8c870', R: '#e04a3a' }, map: ['..SSS..', '.SRRRS.', 'SSSSSSS'] },
  santa:  { slot: 'head', n: '圣诞帽', i: '🎅', pal: { R: '#e04a3a', W: '#ffffff' }, map: ['....W', '..RR.', '.RRR.', 'WWWWW'] },
  party:  { slot: 'head', n: '生日帽', i: '🥳', pal: { Y: '#f8d838', P: '#f490b0', B: '#6ab0e8' }, map: ['..Y..', '..P..', '.PBP.', 'PBPBP'] },
  flower: { slot: 'head', n: '花环', i: '🌸', pal: { P: '#f490b0', Y: '#f8d838', G: '#5f9a3a', W: '#ffffff' }, map: ['P.W.Y', 'GPGYG'] },
  glasses: { slot: 'face', n: '圆眼镜', i: '👓', gen(a, put) {
    const c = '#3a3030';
    for (const e of a.eyes) { put(e - 1, a.ey, c); put(e + 1, a.ey, c); put(e, a.ey - 1, c); put(e, a.ey + 1, c); }
    for (let x = a.l + 1; x < a.r; x++) put(x, a.ey, c);
  } },
  sun: { slot: 'face', n: '墨镜', i: '🕶️', gen(a, put) {
    for (let x = a.l - 1; x <= a.r + 1; x++) put(x, a.ey, '#1e1e24');
    for (const e of a.eyes) put(e, a.ey, '#6a6a7a');
  } },
   blush: { slot: 'face', n: '腮红', i: '😊', gen(a, put) {
    // 侧脸的动物只画一边
    const xs = a.side === 'l' ? [a.l - 1] : a.side === 'r' ? [a.r + 1] : [a.l - 1, a.r + 1];
    for (const x of xs) if (a.solid(x, a.ey + 1)) put(x, a.ey + 1, '#f490a0');
  } },
  scarf: { slot: 'neck', n: '红围巾', i: '🧣', gen(a, put) {
    let end = -1;
    for (let x = a.l - 2; x <= a.r + 2; x++) if (a.solid(x, a.ny)) { put(x, a.ny, '#e04a3a'); end = x; }
    if (end >= 0) { put(end, a.ny + 1, '#a83020'); if (a.ny + 2 < a.H) put(end, a.ny + 2, '#e04a3a'); }
  } },
  bell: { slot: 'neck', n: '铃铛项圈', i: '🔔', gen(a, put) {
    for (let x = a.l - 2; x <= a.r + 2; x++) if (a.solid(x, a.ny)) put(x, a.ny, '#4a90d0');
    put(a.cx, a.ny + 1, '#f0c030');
  } },
  bowtie: { slot: 'neck', n: '领结', i: '🤵', gen(a, put) {
    const c = '#e04a3a';
    put(a.cx - 1, a.ny, c); put(a.cx, a.ny, '#a02030'); put(a.cx + 1, a.ny, c);
    put(a.cx - 1, a.ny + 1, c); put(a.cx + 1, a.ny + 1, c);
  } },
beret:   { slot: 'head', n: '贝雷帽', i: '🎨', pal: { R: '#c03040', D: '#801828' }, map: ['..D..', '.RRR.', 'RRRRR'] },
  chef:    { slot: 'head', n: '厨师帽', i: '👨‍🍳', pal: { W: '#ffffff', G: '#d8d8d8' }, map: ['.W.W.', 'WWWWW', '.WWW.', '.GGG.'] },
  catears: { slot: 'head', n: '猫耳发箍', i: '🐱', pal: { K: '#2a2a30', P: '#f4a0b0' }, map: ['K...K', 'KP.PK', 'KKKKK'] },
  halo:    { slot: 'head', n: '天使光环', i: '😇', pal: { Y: '#f8e060' }, map: ['.YYY.', 'Y...Y', '.YYY.', '.....'] },
  unicorn: { slot: 'head', n: '独角兽角', i: '🦄', pal: { Y: '#f8d838', P: '#f490b0', W: '#ffffff' }, map: ['..Y..', '..P..', '.YWY.', '.PPP.'] },
  leaf:    { slot: 'head', n: '小叶子', i: '🌱', pal: { G: '#5fbf4a', D: '#3f7a28' }, map: ['.GG', 'GG.', '.D.'] },
  // ---- 新脸部 ----
  mask: { slot: 'face', n: '口罩', i: '😷', gen(a, put) {
    for (let x = a.l - 1; x <= a.r + 1; x++) if (a.solid(x, a.ey + 1)) put(x, a.ey + 1, '#e8f4ff');
  } },
  monocle: { slot: 'face', n: '单片眼镜', i: '🧐', gen(a, put) {
    const e = a.eyes[a.eyes.length - 1], c = '#c8a030';
    put(e - 1, a.ey, c); put(e + 1, a.ey, c); put(e, a.ey - 1, c); put(e, a.ey + 1, c);
    put(e + 1, a.ey + 2, c); // 垂下来的小链子
  } },
  // ---- 新脖子 ----
  pearl: { slot: 'neck', n: '珍珠项链', i: '📿', gen(a, put) {
    let k = 0;
    for (let x = a.l - 2; x <= a.r + 2; x++) if (a.solid(x, a.ny)) put(x, a.ny, k++ % 2 ? '#e8e0f0' : '#ffffff');
  } },
  tie: { slot: 'neck', n: '小领带', i: '👔', gen(a, put) {
    const c = '#3a60c0';
    put(a.cx, a.ny, '#203a80');
    if (a.ny + 1 < a.H) put(a.cx, a.ny + 1, c);
    if (a.ny + 2 < a.H) put(a.cx, a.ny + 2, c);
  } },
};
// 个别动物的装扮位置修正，哪只戴着别扭就改它那一行：
//   hy：头饰上下移动，-1 是往上一格，1 是往下一格
//   hx：头饰左右移动，-1 是往左一格，1 是往右一格
//   top：头顶在第几行（从 0 数），用来让头饰避开耳朵
//   ny：脖子饰品在第几行（从 0 数），数字越大越往下
//   nx：领结、铃铛左右移动，-1 是往左一格
//   side：侧脸的动物腮红只画一边，'l' 画左边，'r' 画右边
const WEAR_FIX = {
  frog:      { ny: 5 },
  dog:       { ny: 5 },            // 脖子饰品往下一格，不再挡嘴
  rabbit:    { top: 3 },           // 头饰戴在脑袋上，不戴在耳朵尖上
  chick:     { hx: -1 },           // 头饰往左一格
  cat:       { hy: -1 },           // 头饰往上一格
  wolf:      { ny: 7, nx: -1 },    // 脖子饰品往下两格，往左一格
  cheetah:   { hy: -1, ny: 5 },    // 头饰往上一格，脖子饰品往下一格
  cow:       { hx: -1, ny: 6 },    // 头饰往左一格，脖子饰品往下两格
  penguin:   { hx: -1 },           // 头饰往左一格
  dino:      { side: 'r' },        // 侧脸，腮红只画一边
  hamster:   { ny: 5 },            // 脖子饰品往下一格
  fox:       { hy: -1, ny: 6 },    // 头饰往上一格，脖子饰品往下一格
  capybara:  { side: 'l', ny: 6 }, // 侧脸，腮红只画一边；脖子饰品往下一格
};

const Pet = {
  list: [], view: 'list', curId: null, fx: [], _raf: 0, game: null, back: null, updStats: null,

  async init() {
  this.list = (await DB.get('kv', 'pets'))?.value || [];
  for (const p of this.list) {
    p.exp ??= 80; p.neglect ??= 0; p.sick ??= false; p.lastShow ??= Date.now();
    // 旧宠物没有所属人设：有人设主人就用主人，否则归到当前人设
    p.pid ??= this.petPid(p) || activePid();
  }
  this.mountFab();
  await this.tickAll();
  setInterval(() => this.tickAll(), 60e3);
},
  save() { return DB.put('kv', { id: 'pets', value: this.list }); },
  get(id) { return this.list.find(p => p.id === id); },
  // 把 ID 转成名字：'p:人设ID' 是人设，'sys' 是系统记录（不显示名字），其余是角色 ID
  who(o) {
    if (!o || o === 'sys') return '';
    if (String(o).startsWith('p:')) return persona(o.slice(2))?.name || '?';
    return charById(o)?.name || '?';
  },
  me: () => 'p:' + activePid(),
  isMine(p) { return p.owners.includes(this.me()); },
  hasPersona: p => p.owners.some(o => o.startsWith('p:')),
  charOwners: p => p.owners.filter(o => !o.startsWith('p:')).map(charById).filter(Boolean),
  // 宠物属于哪个人设：有人设主人就是那个人设，否则看 pid 字段
petPid(p) { const o = p.owners.find(x => x.startsWith('p:')); return o ? o.slice(2) : p.pid; },
visible(p) { return this.isMine(p) || (!this.hasPersona(p) && this.charOwners(p).length > 0 && this.petPid(p) === activePid()); },
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
    if (cs.length) return { cs, help: false };
    // 去角色家串门时，由那个角色帮忙照顾
    const host = p.visit && p.visit.until > Date.now() && charById(p.visit.host);
    return { cs: host ? [host] : this.helpers(p), help: true };
  },
  // 照顾的规则：主人认真，和你一起养的少一些，帮忙的人只在状态很差时出手
  careRule(p, help) {
        if (help) return { lim: 25, poop: 3, q: 0.08, doc: 0.03 };
    const withMe = this.hasPersona(p);
    return withMe ? { lim: 25, poop: 3, q: 0.15, doc: 0.03 } : { lim: 40, poop: 2, q: 0.5, doc: 0.2 };
  },
  // 你能不能照顾：自己的，或者主人里有你认识的角色
  canCare(p) {
  return this.isMine(p) || (this.petPid(p) === activePid() && this.charOwners(p).some(c => knows(activePid(), c.id)));
},
  ownerText(p) {
    const ns = p.owners.map(o => o === this.me() ? '我' : this.who(o));
    return (ns.length > 1 ? '一起养：' : '主人：') + ns.join('、');
  },
  mapOf(p) { const s = SPECIES[p.sp]; return s.colors[p.color]?.map || s.map; },
  trait(p) { return { speed: 1, gait: 'walk', acts: ['roll', 'stretch'], sleep: 'curl', say: ['♪'], ...TRAITS[p.sp] }; },

  // 根据动作算出变形：sx/sy 拉伸，rot 旋转，lift 离地，alpha 透明度，jx 抖动
  pose(p, m, t, now, dir = 1, frame = 0) {
    const tr = this.trait(p), wob = (sp, a) => Math.sin(now / sp) * a;
    let sx = 1, sy = 1, rot = 0, lift = 0, alpha = 1, jx = 0;
    switch (m) {
      case 'sleep':
        if (tr.sleep === 'side') rot = dir * Math.PI / 2;
        else if (tr.sleep === 'float') { lift = 6 + wob(900, 4); alpha = 0.8; }
        else if (tr.sleep !== 'stand') { sx = 1.1; sy = 0.72; }
        sy *= 1 + wob(700, 0.03); // 呼吸起伏
        break;
      case 'sit': case 'sick': case 'lie': sx = 1.1; sy = 0.75; break;
      case 'loaf': sx = 1.15; sy = 0.65; break;
      case 'held': sx = sy = 1.08; break;
      case 'roll': rot = dir * t / 1000 * Math.PI * 1.6; break;
      case 'stretch': { const q = Math.sin(Math.min(1, t / 1600) * Math.PI); sx = 1 + q * 0.35; sy = 1 - q * 0.2; break; }
      case 'wag': rot = wob(80, 0.08); break;
      case 'groom': rot = wob(200, 0.1); break;
      case 'howl': rot = -dir * 0.35; break;
      case 'peck': rot = dir * (Math.floor(now / 150) % 2 ? 0.3 : 0); break;
      case 'graze': rot = dir * (Math.floor(now / 400) % 2 ? 0.25 : 0.15); break;
      case 'roar': case 'stomp': jx = frame % 4 < 2 ? 1 : -1; break;
      case 'dig': jx = frame % 4 < 2 ? 1 : -1; sy = 0.9; break;
      case 'glow': alpha = 0.6 + wob(200, 0.4); break;
      case 'thump': sy = Math.floor(now / 200) % 3 === 0 ? 0.85 : 1; break;
      case 'pounce': if (t < 800) { sx = 1.15; sy = 0.7; } break;
      case 'slide': rot = dir * Math.PI / 2; break;
    }
    if (tr.gait === 'waddle' && (m === 'walk' || m === 'run')) rot = wob(120, 0.12);
    if (tr.gait === 'float' && m !== 'sleep') lift += 4 + wob(500, 4);
    return { sx, sy, rot, lift, alpha, jx };
  },

  // 以脚底中点为基准画变形后的精灵，旋转后也贴着地面。返回点击框
  blit(ctx, img, cx, bottom, w, h, o) {
    const dw = w * o.sx, dh = h * o.sy, c = Math.abs(Math.cos(o.rot)), s = Math.abs(Math.sin(o.rot));
    const hw = (c * dw + s * dh) / 2, hh = (c * dh + s * dw) / 2, base = bottom - o.lift;
    ctx.save();
    ctx.globalAlpha *= o.alpha;
    ctx.translate(Math.round(cx + o.jx), Math.round(base - hh));
    if (o.rot) ctx.rotate(o.rot);
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
    return { x: cx - hw, y: base - 2 * hh, w: 2 * hw, h: 2 * hh };
  },

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
  const cs = this.charOwners(p), pid = this.momentPid(p);
  if (!pid || !cs.length || !S.settings.proactive?.enabled || !S.settings.claude.key || this.asleep(p)) return;
  if (Date.now() - (p.lastShow || 0) < 12 * 3600e3 || Math.random() > 1 / 240) return;
  p.lastShow = Date.now();
  const c = pick(cs);
  Moments.post(c.id, pid, null, this.showTopic(p, c.id)).catch(e => Log.add('角色晒宠物失败', e.message));
},
momentPid(p) {
  const pid = this.petPid(p);
  return S.settings.personas.some(x => x.id === pid) ? pid : null;
},
  showTopic(p, charId) {
    const co = p.owners.filter(o => o !== charId).map(o => this.who(o));
    const recent = p.log.slice(0, 2).map(l => this.who(l.who) + l.text).join('；');
    return `这次你想在朋友圈晒一下${co.length ? '和' + co.join('、') + '一起' : '自己'}养的${SPECIES[p.sp].name}「${p.name}」（${this.colorName(p)}，${STAGES[this.stage(p)].n}），它现在${this.mood(p)}${this.wearText(p) ? '，戴着' + this.wearText(p) : ''}。
${recent ? '最近：' + recent + '。' : ''}这是养宠 App 里的像素电子宠物，不是真的动物。配图用 [图片]宠物截图|${p.name}，也可以再配一张别的日常照片。`;
  },

    async tickAll() {
    for (const p of this.list) {
      this.decay(p);
      if (p.visit && p.visit.until <= Date.now()) this.endVisit(p);
      await this.autoCare(p);
      this.maybeShowOff(p);
      this.maybeVisit(p);
      this.maybeDress(p);
    }
    await this.save();
    if (this.view === 'pet' && !$('#pet-root')?.hidden) this.updStats?.();
    this.drawFab();
  },

   // 给角色提示词用：自己参与养的 + 认识的人设（我）养的
 contextLines(charId, pid) {
  const me = 'p:' + pid;
  return this.list.filter(p => this.petPid(p) === pid && (
    this.loc(p) === charId
    || (p.owners.includes(charId) && (p.owners.includes(me) || !this.hasPersona(p)))
    || (p.owners.includes(me) && !p.owners.includes(charId) && knows(pid, charId))
  )).map(p => {
      this.decay(p);
      const own = p.owners.includes(charId);
      const co = p.owners.filter(o => o !== charId).map(o => this.who(o));
      const recent = p.log.slice(0, 3).map(l => `${this.who(l.who)}${l.text}（${ChatUI.timeLabel(l.ts)}）`).join('；');
      const whose = own
        ? `${charById(charId)?.name}${co.length ? '和' + co.join('、') + '一起' : '自己'}养的`
        : `${co.join('、')}养的`;
      return { ts: p.log[0]?.ts || p.born, t: `[手机养宠App里的像素电子宠物，不是真实动物] ${whose}${this.colorName(p)}${SPECIES[p.sp].name}「${p.name}」（${STAGES[this.stage(p)].n}），现在${this.mood(p)}${this.wearText(p) ? '，戴着' + this.wearText(p) : ''}
${this.loc(p) !== this.homeOf(p) ? `，正在${this.who(this.loc(p))}家串门` : ''}
${recent ? '。最近：' + recent : ''}` };
    });
  },

  // ===== 角色自己领养 / 邀请一起养 / 改名 =====
  rules(p) {
    const sps = Object.values(SPECIES).map(s => `${s.name}（${s.colors.map(c => c.n).join('/')}）`).join('、');
        return `- 宠物（想养、符合性格和剧情时就用，可以自己主动决定，不用等别人提）：
  注意：这里的宠物都是大家手机上一个养宠小程序里的像素电子宠物，不是现实里的动物。喂食、洗澡、遛弯、看医生都是在 App 里点按钮，不能抱、不能带出门、不会真的掉毛。可以像聊手游一样聊它。
  自己领养：单独一行 ${p}[领养]动物|花色|名字
  想和对方一起养：单独一行 ${p}[一起领养]动物|花色|名字。名字可以空着，让对方起或者之后一起商量。对方同意了才算数。
  给自己参与养的宠物改名（比如商量好了新名字）：单独一行 ${p}[宠物改名]旧名字|新名字
  照顾宠物：对方让你帮忙照看，或者你自己想帮忙时，单独一行 ${p}[照顾宠物]宠物名字|喂食/铲屎/洗澡/摸摸/看医生。可以照顾自己养的，也可以帮认识的人照顾。一次一个动作，能做到就答应，不用推脱说做不到。
  宠物串门：想带自己养的宠物去对方家玩，单独一行 ${p}[宠物串门]自己宠物的名字|去；想邀请对方的宠物来自己家玩，单独一行 ${p}[宠物串门]对方宠物的名字|来。可以加小时数：名字|来|3。偶尔用。
  给宠物换装扮：单独一行 ${p}[宠物装扮]宠物名字|装扮名，摘掉写 ${p}[宠物装扮]宠物名字|摘掉。可选：${Object.values(WEAR).map(w => w.n).join('、')}。偶尔用，比如过节、心情好、想打扮一下的时候。
    ${p ? '群里几个人都想养的话，每人各自单独写一行。' : ''}能养的动物和花色：${sps}`;
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
  newPet(sp, color, name, owners, pid) {
  const p = { id: uid(), sp, color, name: name || SPECIES[sp].name, owners, pid, hunger: 80, clean: 100, happy: 80, poop: 0, poopAcc: 0,
    exp: 0, neglect: 0, sick: false, ts: Date.now(), born: Date.now(), lastShow: Date.now(), log: [] };
  this.log(p, owners[0], '领养了它');
  this.list.push(p);
  return p;
},

  petLabel(p) { return `${this.colorName(p)}${SPECIES[p.sp].name}「${p.name}」`; },
  // 角色晒宠物截图时找宠物：优先名字对得上的，否则用他养的第一只
  findForShot(charId, desc, pid) {
  const mine = this.list.filter(p => p.owners.includes(charId) && this.petPid(p) === pid);
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
  const i = Conv.parse(convId), pid = convPid(convId);
  if (!v || !pid || !charById(charId)) return null;
  const owners = [charId];
  if (i.type === 'cc') owners.push(charId === i.a ? i.b : i.a);
  const p = this.newPet(v.sp, v.color, v.name, owners, pid);
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
    const p = this.newPet(m.sp, m.color, name, ['p:' + pid, ch.id], pid);
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
 async charRename(charId, spec, convId) {
  const [a, b] = String(spec).split(/[|｜]/).map(x => x.trim());
  const n = (b || '').replace(/^["“「『]|["”」』]$/g, '').slice(0, 12);
  const pid = convPid(convId);
  const mine = this.list.filter(x => x.owners.includes(charId) && this.petPid(x) === pid);
    const p = mine.find(x => x.name === a) || (mine.length === 1 ? mine[0] : null);
    if (!p || !n || n === p.name) return null;
    const old = p.name;
    p.name = n;
    this.log(p, charId, `把名字从「${old}」改成了「${n}」`);
    await this.save();
    return { sender: charId, type: 'sys', content: `${this.who(charId)} 把${SPECIES[p.sp].name}「${old}」改名为「${n}」` };
  },
  // 角色在聊天里照顾宠物：自己参与养的，或者认识的人设养的
  async charCare(charId, spec, convId) {
    const [a, b] = String(spec).split(/[|｜]/).map(x => x.trim());
    const KIND = { 喂: 'feed', 吃: 'feed', 铲: 'clean', 屎: 'clean', 洗: 'bath', 澡: 'bath', 摸: 'pet', 医: 'doctor', 病: 'doctor' };
    const k = Object.keys(KIND).find(x => (b || a || '').includes(x));
    if (!k) return null;
    const pid = convPid(convId);
    const can = this.list.filter(p => this.petPid(p) === pid && (p.owners.includes(charId)
  || (pid && p.owners.includes('p:' + pid) && knows(pid, charId))));
    const p = can.find(x => a && a.includes(x.name)) || (can.length === 1 ? can[0] : can.find(x => x.owners.includes('p:' + pid)));
    if (!p) return null;
    const before = p.log[0];
    const msg = await this.act(p, KIND[k], charId);
    await this.save();
    this.drawFab();
    if (this.view === 'pet' && this.curId === p.id) this.updStats?.();
    // act 成功会写一条动态；没写说明没做成（睡着了、吃饱了之类）
    const ok = p.log[0] !== before;
    return { sender: charId, type: 'sys', content: ok ? `${msg}（「${p.name}」）` : `${this.who(charId)}想照顾「${p.name}」，但${msg}` };
  },

  // ===== 绘制 =====
  palette(p) { const s = SPECIES[p.sp]; return { ...PET_C, ...(s.colors[p.color] || s.colors[0]) }; },
    drawSprite(ctx, p, x, y, s, o = {}) {
    const map = this.mapOf(p), pal = this.palette(p), W = map[0].length;
    const px = (i, j, c) => { ctx.fillStyle = c; ctx.fillRect(x + (o.flip ? W - 1 - i : i) * s, y + j * s, s, s); };
    map.forEach((row, j) => [...row].forEach((ch, i) => {
      if (ch === '.') return;
      const c = ch === 'E' && o.blink ? pal.B || pal.W : pal[ch];
      if (c) px(i, j, c);
    }));
    // 装扮画在身体上面；头饰可能画到第 0 行上方（负数行）
    if (p.wear) for (const [i, j, c] of this.wearPixels(p)) px(i, j, c);
  },

  // 从点阵里找眼睛、头顶、脖子的位置，按点阵缓存
  anchor(map) {
    this._anc ??= new Map();
    let a = this._anc.get(map);
    if (a) return a;
    const W = map[0].length, H = map.length, solid = (x, y) => !!map[y]?.[x] && map[y][x] !== '.';
    let ey = map.findIndex(r => r.includes('E'));
    const eyes = ey < 0 ? [] : [...map[ey]].map((c, x) => (c === 'E' ? x : -1)).filter(x => x >= 0);
    if (ey < 0) { ey = Math.floor(H / 3); eyes.push(Math.floor(W / 2)); }
    const l = Math.min(...eyes), r = Math.max(...eyes), cx = Math.round((l + r) / 2);
    let top = H;
    for (let x = cx - 1; x <= cx + 1; x++) {
      const y = map.findIndex(row => row[x] && row[x] !== '.');
      if (y >= 0) top = Math.min(top, y);
    }
    if (top === H) top = 0;
    a = { W, H, ey, eyes, l, r, cx, top, ny: Math.min(H - 2, ey + 2), solid };
    this._anc.set(map, a);
    return a;
  },

  // 装扮要画的像素：[列, 行, 颜色]，坐标和宠物点阵一致
 wearPixels(p) {
    const fix = WEAR_FIX[p.sp] || {};
    const a = { ...this.anchor(this.mapOf(p)), ...fix }, out = [], w = p.wear || {};
    const put = (x, y, c) => { if (x >= 0 && x < a.W) out.push([x, y, c]); };
    const head = WEAR[w.head];
    if (head?.map) {
      const hw = head.map[0].length, hh = head.map.length;
      // hx 左右挪，hy 上下挪
      const left = Math.max(0, Math.min(a.W - hw, a.cx - Math.floor(hw / 2) + (fix.hx || 0)));
      const top = a.top - hh + 1 + (fix.hy || 0);
      head.map.forEach((row, j) => [...row].forEach((ch, i) => { const c = head.pal[ch]; if (c) put(left + i, top + j, c); }));
    }
    WEAR[w.face]?.gen(a, put);
    // nx 让领结、铃铛左右挪
    WEAR[w.neck]?.gen({ ...a, cx: a.cx + (fix.nx || 0) }, put);
    return out;
  },
  wearText(p) { return Object.values(p.wear || {}).map(k => WEAR[k]?.n).filter(Boolean).join('、'); },
  // 换装扮。k 为空表示摘掉。没变化返回 false
  setWear(p, slot, k, who) {
    p.wear ??= {};
    const old = p.wear[slot] || null;
    if (old === (k || null)) return false;
    if (k) p.wear[slot] = k; else delete p.wear[slot];
    const t = k ? `给它戴上了${WEAR[k].n}` : `摘掉了它的${WEAR[old]?.n || '装扮'}`;
    this.log(p, who, p.owners.includes(who) ? t : '帮忙' + t);
    return true;
  },
  // 角色偶尔自己给宠物换装扮（每只最多一天一次）
  maybeDress(p) {
    const cs = this.charOwners(p);
    if (!cs.length || this.asleep(p) || Date.now() - (p.lastDress || 0) < 24 * 3600e3 || Math.random() > 1 / 1440) return;
    p.lastDress = Date.now();
    const k = pick(Object.keys(WEAR)), slot = WEAR[k].slot;
    this.setWear(p, slot, p.wear?.[slot] === k ? null : k, pick(cs).id);
  },
  // 角色在聊天里换装扮：[宠物装扮]名字|装扮名 或 名字|摘掉
  async charDress(charId, spec, convId) {
    const [a, b = ''] = String(spec).split(/[|｜]/).map(x => x.trim());
    const pid = convPid(convId);
    const can = this.list.filter(p => this.petPid(p) === pid && (p.owners.includes(charId)
      || (pid && p.owners.includes('p:' + pid) && knows(pid, charId))));
    const p = can.find(x => a && a.includes(x.name)) || (can.length === 1 ? can[0] : null);
    if (!p) return null;
    let msg;
    if (/摘|脱|不戴|取下/.test(b)) {
      const worn = Object.keys(p.wear || {});
      const hit = worn.filter(s => b.includes(WEAR[p.wear[s]]?.n) || b.includes(WEAR_SLOTS[s]));
      const slots = hit.length ? hit : worn;
      if (!slots.length) return null;
      slots.forEach(s => this.setWear(p, s, null, charId));
      msg = `${this.who(charId)}摘掉了「${p.name}」的装扮`;
    } else {
      const k = Object.keys(WEAR).find(k => b && (b.includes(WEAR[k].n) || WEAR[k].n.includes(b)));
      if (!k || !this.setWear(p, WEAR[k].slot, k, charId)) return null;
      msg = `${this.who(charId)}给「${p.name}」戴上了${WEAR[k].i}${WEAR[k].n}`;
    }
    await this.save();
    if (this.view === 'pet' && this.curId === p.id) this.updStats?.();
    return { sender: charId, type: 'sys', content: msg };
  },

  // 装扮面板
  renderDress(p) {
    this.stopAll(); this.view = 'dress'; this.back = () => this.renderPet();
    p.wear ??= {};
    const draw = () => {
      const el = this.show(this.head('装扮') + `
        <div style="text-align:center"><canvas id="dress-prev" width="120" height="120" aria-label="${esc(p.name)}的装扮预览"></canvas></div>
        ${Object.entries(WEAR_SLOTS).map(([slot, n]) => `<h3>${n}</h3><div class="pet-acts">
          <button class="btn ${p.wear[slot] ? 'ghost' : ''}" data-w="${slot}|" aria-pressed="${!p.wear[slot]}">不戴</button>
          ${Object.entries(WEAR).filter(([, w]) => w.slot === slot).map(([k, w]) =>
            `<button class="btn ${p.wear[slot] === k ? '' : 'ghost'}" data-w="${slot}|${k}" aria-pressed="${p.wear[slot] === k}">${w.i} ${w.n}</button>`).join('')}
        </div>`).join('')}`);
      const cv = $('#dress-prev', el), ctx = cv.getContext('2d'), map = this.mapOf(p);
      const s = Math.floor(100 / Math.max(map[0].length, map.length + 4));
      ctx.clearRect(0, 0, 120, 120);
      this.drawSprite(ctx, p, Math.floor((120 - map[0].length * s) / 2), Math.floor((120 - (map.length + 4) * s) / 2) + 4 * s, s);
      el.addEventListener('click', async e => {
        const v = e.target.closest('[data-w]')?.dataset.w;
        if (!v) return;
        const [slot, k] = v.split('|');
        if (this.setWear(p, slot, k || null, this.me())) { await this.save(); draw(); }
      });
    };
    draw();
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


    // 不再显示悬浮按钮，入口改成小院里的宠物和小屋
  mountFab() { this.mountYard(); },

  // 宠物有变化时调用，动画循环下一帧会自动用新的宠物
  drawFab() {},
  // ===== 小院：屏幕底部，宠物自己跑来跑去 =====
      yardCfg() { const c = S.settings.petYard ??= { on: true, scene: true, bottom: 0 }; c.full ??= true; c.on = true; return c; },
  homeOf(p) { return p.owners.find(o => o.startsWith('p:')) || p.owners[0]; },
  // 宠物现在在谁家：串门中就是对方家，否则是自己家
  loc(p, now = Date.now()) { return p.visit && p.visit.until > now ? p.visit.host : this.homeOf(p); },
  hostName(h) { return h === this.me() ? '我' : this.who(h); },
  yardPets() { const me = this.me(); return this.list.filter(p => this.loc(p) === me).slice(0, 20); },

    mountYard() {
    const cv = document.createElement('canvas');
    cv.id = 'pet-yard';
    cv.setAttribute('aria-hidden', 'true');
    // 全屏透明，不挡点击：只有点到宠物身上才会被拦下来
    Object.assign(cv.style, { position: 'fixed', left: '0', top: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '40' });
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d'), off = document.createElement('canvas'), octx = off.getContext('2d');
    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      W = document.documentElement.clientWidth;
      H = document.documentElement.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
    };
    resize();
    addEventListener('resize', resize);

    const A = new Map();
    const R = (a, b) => a + Math.random() * (b - a);
    const cfg = () => this.yardCfg();
    // 地面：底部场景那条线。满屏模式下宠物能在 TOP 到 GROUND 之间随便跑
    const GROUND = () => H - (Number(cfg().bottom) || 0) - 6;
    const TOP = () => cfg().full ? 70 : GROUND();
    const ry = () => cfg().full ? R(TOP() + 20, GROUND()) : GROUND();
    const ball = { x: W * 0.6, y: GROUND(), h: 0, v: 0, vx: 0, vy: 0 };
    const flies = [0, 1, 2].map(i => ({ x: R(0, W), y: R(TOP(), GROUND() - 20), ph: R(0, 6), vx: R(0.3, 0.7) * (i % 2 ? -1 : 1), vy: R(-0.3, 0.3), c: ['#f8d838', '#f4a0b0', '#a8e8f8'][i] }));
    let bubbles = [], frame = 0, prev = 0, drag = null, eatClick = false, col = null;
    const props = () => ({ house: W * 0.08, bowl: W * 0.08 + 34, tree: W * 0.84, flowers: [0.3, 0.47, 0.64, 0.95].map(f => W * f) });
    const sizeOf = p => Math.max(2, Math.round(3.5 * STAGES[this.stage(p)].k));
    const bubble = (a, ch) => { if (bubbles.filter(b => b.a === a).length < 2) bubbles.push({ a, ch, life: 1 }); };
       const go = (a, mode, ms, extra = {}) => Object.assign(a, { mode, until: performance.now() + ms, t0: performance.now(), chew: false, met: false, jumped: false, ...extra });
    const busy = o => ['sleep', 'sick', 'held', 'fall', 'gosleep'].includes(o.mode);
    // 开始一个专属动作
    const doAct = (a, act) => {
      const [lo, hi] = ACT_MS[act] || [2000, 3000], tr = this.trait(a.p);
      const far = { tx: a.x < W / 2 ? W - a.w - 10 : 10, ty: a.y };
      go(a, act, R(lo, hi), act === 'sprint' || act === 'slide' ? far : {});
      if (['moo', 'croak', 'roar', 'howl'].includes(act)) bubble(a, pick(tr.say));
    };


        const choose = (a, all) => {
      const p = a.p, tr = this.trait(p);
      if (this.asleep(p)) {
        if (a.mode === 'sleep') return go(a, 'sleep', 6000, { perch: a.perch });
        // 狼这种夜猫子，睡前先嚎一嗓子
        if (tr.nightOwl && !a.howled && Math.random() < 0.4) { a.howled = true; bubble(a, pick(tr.say)); return go(a, 'howl', 3000); }
        // 先走回小屋 / 树下再睡
        const pr = props(), hx = !cfg().scene ? null : tr.home === 'house' ? pr.house + 6 : tr.home === 'tree' ? pr.tree + 6 : null;
        if (hx != null && Math.abs(a.x - hx) > 8) return go(a, 'gosleep', 15000, { tx: hx + R(-6, 6), ty: GROUND() });
        return go(a, 'sleep', 6000, { perch: tr.sleep === 'perch' && hx != null ? 22 : 0 });
      }
      a.howled = false;
      if (p.sick) return go(a, 'sick', 6000);
      if (cfg().scene && p.hunger < 35 && Math.random() < 0.6) return go(a, 'eat', 7000, { tx: props().bowl + 20, ty: GROUND() });
      const mates = all.filter(o => o !== a && !busy(o));
      const r = Math.random();
      if (mates.length && r < 0.2) {
        const o = pick(mates);
        if (Math.random() < 0.5) {
          go(a, 'chase', 6000, { tgt: o });
          go(o, 'run', 6000, { tx: o.x + (o.x > a.x ? 1 : -1) * R(80, 200), ty: ry() });
          bubble(a, '!');
        } else { go(a, 'meet', 4000, { tgt: o }); go(o, 'meet', 4000, { tgt: a }); }
        return;
      }
      if (r < 0.5) return doAct(a, pick(tr.acts)); // 专属动作
      if (r < 0.6) return go(a, 'ball', 6000);
      if (r < 0.67 && !this.isNight()) return go(a, 'bug', 4000, { fly: pick(flies) });
      if (p.happy < 30) return go(a, pick(['sit', 'sit', 'walk']), R(3000, 6000), { tx: R(0, W - a.w), ty: ry() });
      return go(a, pick(['walk', 'walk', 'run', 'idle', 'sit', 'hop']), R(2500, 5500), { tx: R(0, W - a.w), ty: ry() });
    };

    // 二维移动，到了返回 true
    const toward = (a, tx, ty, sp, k) => {
      tx = Math.max(0, Math.min(W - a.w, tx));
      ty = Math.max(TOP(), Math.min(GROUND(), ty));
      const dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy);
      if (d <= sp * k + 1) { a.x = tx; a.y = ty; return true; }
      if (Math.abs(dx) > 0.5) a.dir = Math.sign(dx);
      a.x += dx / d * sp * k; a.y += dy / d * sp * k;
      return false;
    };

    const update = (a, k, now, all) => {
      const m = a.mode;
      const tr = this.trait(a.p), cx = x => Math.max(0, Math.min(W - a.w, x));
      a.y = Math.max(TOP(), Math.min(GROUND(), a.y));
      if (m !== 'held') {
        a.v -= 0.35 * k;
        a.h += a.v * k;
        if (m === 'fall') {
          a.x += a.vx * k; a.vx *= 0.97;
          if (a.x < 0 || a.x > W - a.w) { a.vx *= -0.6; a.x = Math.max(0, Math.min(W - a.w, a.x)); }
        }
        if (a.h <= 0) {
          if (m === 'fall') { bubble(a, pick(['💢', '💫', '?', '!'])); go(a, 'idle', 1500); }
          a.h = 0; a.v = 0;
        }
      }
      const ground = a.h === 0;
            if (m === 'walk' || m === 'run') {
        const sp = (m === 'run' ? 1.8 : 0.7) * tr.speed;
        if (tr.gait === 'hop' || tr.gait === 'leap') {
          // 蹦着走：只在空中前进
          if (ground) { if (Math.random() < (tr.gait === 'leap' ? 0.04 : 0.1) * k) a.v = tr.gait === 'leap' ? R(4, 6) : R(2, 3); }
          else if (toward(a, a.tx, a.ty, sp * (tr.gait === 'leap' ? 2.5 : 1.6), k)) go(a, 'idle', R(800, 2000));
        } else if (toward(a, a.tx, a.ty, sp, k)) go(a, 'idle', R(800, 2000));
      }
      else if (m === 'gosleep') {
        if (frame % 90 === 0) bubble(a, '🥱');
        if (toward(a, a.tx, a.ty, 0.6, k)) go(a, 'sleep', 6000, { perch: tr.sleep === 'perch' ? 22 : 0 });
      }
      else if (m === 'roll') { a.x = cx(a.x + a.dir * 0.6 * k); if (frame % 60 === 0) bubble(a, pick(['♪', '✨'])); }
      else if (m === 'binky' || m === 'stomp' || m === 'flap') {
        if (ground && Math.random() < (m === 'stomp' ? 0.12 : 0.06) * k) {
          a.v = m === 'binky' ? R(4, 6) : m === 'flap' ? 2.5 : 1.5;
          if (m === 'binky') { a.dir *= -1; bubble(a, '♪'); }
        }
      }
      else if (m === 'flutter') {
        if (a.h < R(15, 40)) a.v = Math.max(a.v, 1.3);
        a.x = cx(a.x + a.dir * 0.6 * k);
        if (Math.random() < 0.01 * k) a.dir *= -1;
      }
      else if (m === 'sprint' || m === 'slide') {
        if (toward(a, a.tx, a.ty, m === 'sprint' ? 4 : 2.5, k)) go(a, m === 'sprint' ? 'loaf' : 'idle', 1500);
      }
      else if (m === 'pounce') {
        if (now - a.t0 > 800 && !a.jumped) { a.jumped = true; a.v = 5; bubble(a, '!'); }
        if (a.h > 0) a.x = cx(a.x + a.dir * 2.5 * k);
      }
      else if (m === 'graze' || m === 'peck') { if (frame % 100 === 0) bubble(a, m === 'graze' ? '🌿' : '·'); }
      else if (m === 'groom') { if (frame % 90 === 0) bubble(a, '✨'); }
      else if (m === 'dig') { if (frame % 70 === 0) bubble(a, pick(['🦴', '·', '?'])); }
      else if (m === 'tongue') { if (frame % 60 === 0) bubble(a, '👅'); }
      else if (m === 'wag') { if (frame % 60 === 0) bubble(a, '♥'); }
      else if (m === 'glow' || m === 'spin') { if (m === 'spin' && frame % 8 === 0) a.dir *= -1; if (frame % 60 === 0) bubble(a, '♪'); }
      else if (m === 'hop') {
        if (!ground) a.x = Math.max(0, Math.min(W - a.w, a.x + a.dir * 0.9 * k));
        else if (Math.random() < 0.05 * k) { a.v = R(3, 5); a.dir = a.tx > a.x ? 1 : -1; }
      } else if (m === 'eat') {
        if (toward(a, a.tx, a.ty, 1, k)) { a.dir = -1; a.chew = true; if (frame % 90 === 0) bubble(a, pick(['🍚', '😋'])); }
      } else if (m === 'ball') {
        if (toward(a, ball.x - a.w / 2, ball.y, 1.5, k) && ball.h < 4) {
          ball.vx = (a.dir || 1) * R(2, 4); ball.vy = cfg().full ? R(-1.5, 1.5) : 0; ball.v = R(2, 5);
          if (Math.random() < 0.3) bubble(a, '♪');
        }
      } else if (m === 'chase') {
        const t = a.tgt;
        if (!t || !all.includes(t)) go(a, 'idle', 1000);
        else if (toward(a, t.x, t.y, 2, k)) {
          bubble(a, pick(['♥', '♪'])); a.v = 3; t.v = 3;
          go(a, 'idle', 1500); go(t, 'idle', 1500);
        }
      } else if (m === 'meet') {
        const t = a.tgt;
        if (!t || !all.includes(t)) go(a, 'idle', 1000);
        else if (toward(a, a.x < t.x ? t.x - a.w - 2 : t.x + t.w + 2, t.y, 0.8, k)) {
          a.dir = a.x < t.x ? 1 : -1;
          if (!a.met) { a.met = true; if (Math.random() < 0.6) bubble(a, pick(['♥', '♪', '?', '!'])); }
        }
      } else if (m === 'bug') {
        toward(a, a.fly.x - a.w / 2, cfg().full ? a.fly.y + 20 : GROUND(), 1.6, k);
        if (ground && Math.random() < 0.03 * k) a.v = 4;
           } else if (m === 'sleep') { if (frame % 50 === 0) bubble(a, tr.dream && Math.random() < 0.15 ? tr.dream : 'z'); }
      else if (m === 'sick') { if (frame % 70 === 0) bubble(a, '💧'); }
      else if (m === 'idle' && Math.random() < 0.004 * k) a.dir *= -1;
      if (now > a.until && m !== 'held' && m !== 'fall') choose(a, all);
    };

    const drawMap = (def, x, bottom, s) => def.map.forEach((row, j) => [...row].forEach((ch, i) => {
      const c = def.pal[ch];
      if (!c) return;
      ctx.fillStyle = c;
      ctx.fillRect(Math.round(x + i * s), Math.round(bottom - (def.map.length - j) * s), s, s);
    }));

        const drawPet = (a, now) => {
      const p = a.p, s = a.s, map = this.mapOf(p), w = map[0].length * s, h = map.length * s, tr = this.trait(p);
      const o = this.pose(p, a.mode, now - (a.t0 || now), now, a.dir, frame);
      if (a.mode === 'sleep' && a.perch) o.lift += a.perch; // 山雀停在树枝上
      if (a.mode === 'sick' && frame % 4 < 2) o.jx += 1;
      const blink = a.mode === 'sleep' || (a.mode === 'groom' && Math.floor(now / 600) % 2) || (now + a.seed) % 3500 < 150;
      let bob = 0;
      if (['walk', 'run', 'chase', 'ball', 'bug', 'meet', 'sprint'].includes(a.mode) && a.h === 0 && tr.gait !== 'float')
        bob = Math.floor(now / (a.mode === 'walk' ? 180 : 100)) % 2;
      if (a.chew || a.mode === 'graze') bob = Math.floor(now / 250) % 2;
            // 戴了头饰就在上面多留 4 行，免得帽子被裁掉
      const PAD = p.wear?.head ? 4 : 0;
      off.width = map[0].length; off.height = map.length + PAD;
      octx.clearRect(0, 0, off.width, off.height);
      this.drawSprite(octx, p, 0, PAD, 1, { blink, flip: a.dir < 0 });
      // 影子：离地越高越淡
      ctx.globalAlpha = Math.max(0.05, 0.22 - (a.h + o.lift) / 300); ctx.fillStyle = '#000';
      ctx.fillRect(Math.round(a.x + 2), Math.round(a.y) - 1, w - 4, 2); ctx.globalAlpha = 1;
            a.box = this.blit(ctx, off, a.x + w / 2, a.y - a.h - bob, w, h + PAD * s, o);
    };

    const loop = now => {
      requestAnimationFrame(loop);
      const c = cfg(), panel = $('#pet-root');
      const show = c.on && !(panel && !panel.hidden) && !document.hidden;
      cv.style.display = show ? '' : 'none';
      if (!show) { prev = now; return; }
      const k = Math.min(3, (now - (prev || now)) / 16.7);
      prev = now; frame++;
      if (!col || frame % 60 === 0) col = { g: cvar('accent2'), t: cvar('text') };
      const G = GROUND();

      const pets = this.yardPets();
      for (const p of pets) {
        let a = A.get(p.id);
        if (!a) {
          a = { p, x: R(0, Math.max(1, W - 40)), y: ry(), h: 0, v: 0, vx: 0, dir: 1, mode: 'idle', until: 0, seed: R(0, 3000) };
          A.set(p.id, a);
          if (!this.isMine(p)) bubble(a, '👋');
        }
        a.p = p; a.s = sizeOf(p); a.w = this.mapOf(p)[0].length * a.s;
      }
      for (const id of [...A.keys()]) if (!pets.some(p => p.id === id)) A.delete(id);
      const all = [...A.values()];
      bubbles = bubbles.filter(b => all.includes(b.a) && b.life > 0);
      for (const a of all) update(a, k, now, all);

      // 球
      ball.v -= 0.3 * k; ball.h += ball.v * k;
      if (ball.h <= 0) { ball.h = 0; ball.v = ball.v < -1.5 ? -ball.v * 0.5 : 0; ball.vx *= 0.9; ball.vy *= 0.9; }
      ball.x += ball.vx * k; ball.vx *= 0.99;
      ball.y += ball.vy * k; ball.vy *= 0.99;
      if (!c.full) ball.y = G;
      if (ball.x < 4 || ball.x > W - 4) { ball.vx *= -1; ball.x = Math.max(4, Math.min(W - 4, ball.x)); }
      if (ball.y < TOP() || ball.y > G) { ball.vy *= -1; ball.y = Math.max(TOP(), Math.min(G, ball.y)); }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, W, H);
      const night = this.isNight();
      // 小屋是打开宠物面板的入口，隐藏场景时也保留
      drawMap(YARD_PROPS.house, props().house, G, 3);
      if (c.scene) {
        const pr = props();
        ctx.fillStyle = col.g; ctx.fillRect(0, G, W, 6);
        for (let x = 11; x < W; x += 41) drawMap(YARD_PROPS.grass, x, G, 2);
        drawMap(YARD_PROPS.tree, pr.tree, G, 3);
        drawMap(YARD_PROPS.bowl, pr.bowl, G, 2);
        pr.flowers.forEach((x, i) => drawMap(i % 2 ? YARD_PROPS.flower2 : YARD_PROPS.flower, x, G, 2));
        const poop = Math.min(5, this.list.filter(p => this.isMine(p) && this.loc(p) === this.me()).reduce((s, p) => s + (p.poop || 0), 0));
        ctx.fillStyle = '#7a4a20';
        [0.38, 0.55, 0.72, 0.24, 0.9].slice(0, poop).forEach(f => {
          const x = Math.round(W * f);
          ctx.fillRect(x, G - 4, 7, 4); ctx.fillRect(x + 1, G - 7, 5, 3); ctx.fillRect(x + 2, G - 9, 3, 2);
        });
      }

      // 蝴蝶 / 萤火虫：满屏模式下到处飞
      for (const f of flies) {
        f.ph += 0.05 * k; f.x += f.vx * k; f.y += f.vy * k;
        if (Math.random() < 0.01) f.vy = R(-0.4, 0.4);
        const lo = c.full ? TOP() - 30 : G - 60, hi = G - 20;
        if (f.y < lo || f.y > hi) { f.vy *= -1; f.y = Math.max(lo, Math.min(hi, f.y)); }
        if (f.x < -10) f.x = W + 10; if (f.x > W + 10) f.x = -10;
        const y = f.y + Math.sin(f.ph) * 8;
        if (night) {
          ctx.globalAlpha = 0.5 + Math.sin(f.ph * 3) * 0.4; ctx.fillStyle = '#f0f080';
          ctx.fillRect(Math.round(f.x), Math.round(y), 2, 2); ctx.globalAlpha = 1;
        } else {
          const up = Math.floor(now / 120) % 2;
          ctx.fillStyle = f.c;
          ctx.fillRect(Math.round(f.x) - 2, Math.round(y) - (up ? 1 : 0), 2, 2);
          ctx.fillRect(Math.round(f.x) + 1, Math.round(y) - (up ? 1 : 0), 2, 2);
          ctx.fillStyle = '#3a3030'; ctx.fillRect(Math.round(f.x), Math.round(y), 1, 2);
        }
      }

      // 球和宠物按前后顺序画，靠下的盖住靠上的
      const items = [...all.map(a => ({ y: a.y, a })), { y: ball.y, ball: true }].sort((p, q) => p.y - q.y);
      for (const it of items) {
        if (it.ball) {
          ctx.fillStyle = '#e04a3a'; ctx.beginPath(); ctx.arc(ball.x, ball.y - 4 - ball.h, 4, 0, 7); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(ball.x) - 1, Math.round(ball.y - 6 - ball.h), 2, 2);
        } else drawPet(it.a, now);
      }
      if (night && c.scene) { ctx.fillStyle = 'rgba(20,24,60,.22)'; ctx.fillRect(0, G - 40, W, 46); }

      ctx.textAlign = 'center';
      for (const b of bubbles) {
        if (!b.a.box) continue;
        ctx.globalAlpha = Math.min(1, b.life * 1.5);
        ctx.font = b.ch === 'z' ? 'bold 11px monospace' : '12px sans-serif';
        ctx.fillStyle = col.t;
        ctx.fillText(b.ch, b.a.box.x + b.a.box.w / 2 + (b.ch === 'z' ? 6 : 0), b.a.box.y - 3 - (1 - b.life) * 14);
        b.life -= 0.012 * k;
      }
      ctx.globalAlpha = 1;
    };
    requestAnimationFrame(loop);

    // ===== 点宠物打开面板，按住拖动可以拎到屏幕任何地方 =====
    const hitAt = (cx, cy) => {
      if (cv.style.display === 'none') return null;
      return [...A.values()].sort((p, q) => q.y - p.y).find(a => a.box && cx >= a.box.x - 6 && cx <= a.box.x + a.box.w + 6
        && cy >= a.box.y - 6 && cy <= a.box.y + a.box.h + 6) || null;
    };
    // 小屋：9×8 像素，放大 3 倍
    const hitHouse = (cx, cy) => {
      if (cv.style.display === 'none') return false;
      const hx = props().house, G = GROUND();
      return cx >= hx - 4 && cx <= hx + 27 + 4 && cy >= G - 24 - 4 && cy <= G + 4;
    };
    addEventListener('pointerdown', e => {
            const a = hitAt(e.clientX, e.clientY);
      if (!a) {
        if (!hitHouse(e.clientX, e.clientY)) return;
        e.preventDefault(); e.stopPropagation();
        eatClick = true; // 吞掉这次点击，免得刚打开的面板被当成点遮罩关掉
        this.renderList();
        return;
      }
      e.preventDefault(); e.stopPropagation();
      drag = { a, sx: e.clientX, sy: e.clientY, lx: e.clientX, vx: 0, moved: false };
    }, true);
    addEventListener('pointermove', e => {
      if (!drag) return;
      const { a } = drag;
      if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6) return;
      if (!drag.moved) { drag.moved = true; go(a, 'held', 1e9); bubble(a, '!'); }
      const hh = this.mapOf(a.p).length * a.s;
      a.x = Math.max(0, Math.min(W - a.w, e.clientX - a.w / 2));
      const feet = e.clientY + hh / 2;
      if (cfg().full && feet >= TOP() && feet <= GROUND()) { a.y = feet; a.h = 0; }
      else {
        // 拎到活动范围外面：脚落在最近的边上，剩下的算离地高度
        a.y = Math.max(TOP(), Math.min(GROUND(), feet));
        a.h = Math.max(0, a.y - feet);
      }
      drag.vx = e.clientX - drag.lx; drag.lx = e.clientX;
    }, true);
    const release = e => {
      if (!drag) return;
      e.stopPropagation();
      const { a, moved, vx } = drag;
      drag = null;
      eatClick = true;
      if (moved) { go(a, 'fall', 1e9, { vx: Math.max(-8, Math.min(8, vx * 0.6)) }); a.v = a.h > 0 ? 0 : 2; return; }
      this.curId = a.p.id;
      this.renderPet();
    };
    addEventListener('pointerup', release, true);
    addEventListener('pointercancel', release, true);
    addEventListener('touchmove', e => { if (drag?.moved) e.preventDefault(); }, { passive: false, capture: true });
    addEventListener('click', e => { if (eatClick) { eatClick = false; e.preventDefault(); e.stopPropagation(); } }, true);
  },

  async yardSettings() {
    const c = this.yardCfg();
    const a = await actionSheet([
      { label: c.full ? '只在底部跑' : '满屏幕跑', value: 'full' },
      { label: c.scene ? '隐藏场景（只留宠物）' : '显示场景', value: 'scene' },
      { label: `离屏幕底部的距离（现在 ${c.bottom || 0}px）`, value: 'bottom' },
    ]);
    if (!a) return;
    if (a === 'on') c.on = !c.on;
    if (a === 'scene') c.scene = !c.scene;
    if (a === 'full') c.full = !c.full;
    if (a === 'bottom') {
      const v = Number(await editText('离底部多少像素（挡住输入框时调大，比如 60）', String(c.bottom || 0), false));
      if (!(v >= 0)) return;
      c.bottom = Math.round(v);
    }
    await saveSettings();
    toast('已保存');
  },

  // ===== 串门 =====
  hm: ts => new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
  notify(charId, text) { return addMsg(Conv.dm(activePid(), charId), 'user', text, 'sys'); },
  pickHours() {
    return actionSheet([{ label: '玩 1 小时', value: 1 }, { label: '玩 3 小时', value: 3 }, { label: '玩 8 小时', value: 8 }]);
  },
  startVisit(p, host, hours, by, text) {
    p.visit = { host, until: Date.now() + hours * 3600e3, by };
    p.lastVisit = Date.now();
    this.log(p, by, text);
  },
  endVisit(p, who = 'sys', text = '') {
    if (!p.visit) return;
    const host = p.visit.host;
    delete p.visit;
    this.log(p, who, text || `在${this.who(host)}家玩够了，回家了`);
  },
  // 角色偶尔自己把宠物带来你家
  maybeVisit(p) {
  if (this.hasPersona(p) || this.loc(p) !== this.homeOf(p) || this.asleep(p) || p.sick) return;
  if (Date.now() - (p.lastVisit || 0) < 6 * 3600e3 || Math.random() > 1 / 720) return;
  const pid = this.momentPid(p);
  if (!pid) return;
  const c = this.charOwners(p).find(x => x.proactive !== false && knows(pid, x.id) && !getRel(pid, x.id).theyBlock);
  if (!c) return;
  this.startVisit(p, 'p:' + pid, 1 + Math.random(), c.id, `带它去${persona(pid).name}家玩`);
  addMsg(Conv.dm(pid, c.id), c.id, `${c.name} 把「${p.name}」带来 ${persona(pid).name} 家玩了`, 'sys');
},
  // 角色在聊天里发起串门：「名字|来」请别人的宠物来自己家，「名字|去」带自己的宠物去对方家
  async charVisit(charId, spec, convId) {
    const [a, b = '', c] = String(spec).split(/[|｜]/).map(x => x.trim());
    const i = Conv.parse(convId), pid = convPid(convId);
    if (!pid) return null;
    const hours = Math.max(0.5, Math.min(12, Number(c) || 2));
    const free = x => this.loc(x) === this.homeOf(x) && !x.sick;
    const byName = list => list.find(x => a && (a.includes(x.name) || x.name.includes(a))) || (list.length === 1 ? list[0] : null);
    const come = b.includes('来');
    let p, host;
    if (come) {
  p = byName(this.list.filter(x => this.petPid(x) === pid && !x.owners.includes(charId) && free(x)
    && x.owners.some(o => o.startsWith('p:') ? o === 'p:' + pid && knows(pid, charId) : knows(o, charId, pid))));
  host = charId;
} else {
  p = byName(this.list.filter(x => this.petPid(x) === pid && x.owners.includes(charId) && free(x)));
  host = i.type === 'cc' ? (charId === i.a ? i.b : i.a) : 'p:' + pid;
}
    if (!p || host === this.homeOf(p)) return null;
    this.startVisit(p, host, hours, charId, come ? '邀请它来家里玩' : `带它去${this.who(host)}家玩`);
    await this.save();
    return { sender: charId, type: 'sys', content: `${this.who(charId)}${come ? `邀请「${p.name}」来家里玩` : `带「${p.name}」去${this.who(host)}家玩`}（${hours}小时）` };
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
      <div class="grow"><b>${esc(p.name)}</b><small class="ellipsis">${SPECIES[p.sp].name} · ${STAGES[this.stage(p)].n} · ${esc(this.ownerText(p))} · ${this.mood(p)}${this.loc(p) !== this.homeOf(p) ? ' · 在' + esc(this.hostName(this.loc(p))) + '家' : ''}</small>
</div></button>`;
    const mine = vis.filter(p => this.isMine(p)), theirs = vis.filter(p => !this.isMine(p));
    const el = this.show(this.head('宠物', false) + `
      <h3>我养的</h3>${mine.map(row).join('') || '<p class="empty">还没有</p>'}
      <h3>角色们养的</h3>${theirs.map(row).join('') || '<p class="empty">还没有</p>'}
            <button class="btn" data-pa="adopt" style="margin-top:8px">＋ 领养</button>
      <button class="btn ghost" data-pa="yard" style="margin-top:8px">🌳 小院设置</button>`);
    $$('[data-mini]', el).forEach(c => this.drawMini(c, this.get(c.dataset.mini)));
    el.addEventListener('click', e => {
      if (e.target.closest('[data-pa="adopt"]')) return this.renderAdopt();
      if (e.target.closest('[data-pa="yard"]')) return this.yardSettings();
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
    const here = this.loc(p), away = here !== this.homeOf(p);
    const visitBtn = away
      ? `<p class="empty">现在在${esc(this.hostName(here))}家玩，${this.hm(p.visit.until)} 回来</p>
         ${this.isMine(p) || here === this.me() ? `<button class="btn ghost" data-pa="home">🏠 ${this.isMine(p) ? '接它回家' : '送它回家'}</button>` : ''}`
      : this.isMine(p) ? '<button class="btn ghost" data-pa="visit">🚪 送去串门</button>'
      : can ? '<button class="btn ghost" data-pa="invite">💌 邀请来我家玩</button>' : '';
    const el = this.show(this.head(p.name) + `
      <canvas id="pet-stage" width="240" height="160" aria-label="${esc(p.name)}的小窝"></canvas>
      <p class="pet-mood" id="pet-mood"></p><div id="pet-bars"></div>
      ${can ? `<div class="pet-acts">${acts}${p.sick ? `<button class="btn" data-do="doctor">🏥 看医生 ¥${DOCTOR_FEE}</button>` : ''}</div>
                <h3>小游戏</h3>${zz || p.sick ? `<p class="empty">${p.sick ? '生病了，先去看医生吧' : '睡着了，等它醒了再玩'}</p>` : `<div class="pet-acts">
        <button class="btn ghost" data-game="catch">🍎 接食物</button><button class="btn ghost" data-game="run">🏃 跑酷</button>
        <button class="btn ghost" data-game="box">📦 推箱子</button><button class="btn ghost" data-game="monopoly">🎲 大富翁</button></div>`}`
                : '<p class="empty">你还不认识它的主人，只能看看。</p>'}
           ${visitBtn}
      ${can ? '<button class="btn ghost" data-pa="dress">🎀 装扮</button>' : ''}
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
    // 在同一个地方的其他宠物（自己的其他宠物、来串门的），一起在小窝里跑
    const spot = this.loc(p);
    const mates = this.list.filter(o => o !== p && this.loc(o) === spot).slice(0, 6).map(o => {
      const om = this.mapOf(o), os = Math.max(2, Math.round(s * 0.75 * STAGES[this.stage(o)].k / STAGES[this.stage(p)].k));
      return { o, s: os, w: om[0].length * os, h: om.length * os, x: 10 + Math.random() * 200, dir: Math.random() < 0.5 ? 1 : -1 };
    });
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
      for (const m of mates) {
        const zzM = this.asleep(m.o);
        if (!zzM && !m.o.sick) { m.x += m.dir * 0.4; if (m.x < 8 || m.x > 232 - m.w) m.dir *= -1; }
        const mb = !zzM && Math.floor(t * 3 + m.w) % 2 ? 1 : 0;
        this.drawSprite(ctx, m.o, Math.round(m.x), 150 - m.h - mb, m.s, { blink: zzM || (t + m.w) % 3 < 0.15, flip: m.dir < 0 });
        if (Math.abs(m.x - x) < 20 && Math.floor(t * 2) % 4 === 0) {
          ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#e04a3a';
          ctx.fillText('♥', (m.x + x + w * s) / 2, top - 4);
        }
      }
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
      if (a === 'visit') {
        const pid = activePid();
        const list = S.chars.filter(c => knows(pid, c.id) && !getRel(pid, c.id).theyBlock && !p.owners.includes(c.id));
        if (!list.length) return toast('还没有认识的角色');
        const c = await actionSheet(list.map(c => ({ label: `去${c.name}家`, value: c })));
        if (!c) return;
        const h = await this.pickHours();
        if (!h) return;
        this.startVisit(p, c.id, h, this.me(), `送它去${c.name}家玩`);
        await this.save();
        this.notify(c.id, `${persona(pid).name} 把「${p.name}」送到 ${c.name} 家玩 ${h} 小时`);
        toast(`${p.name}去${c.name}家玩啦`);
        return this.renderPet();
      }
      if (a === 'invite') {
        const h = await this.pickHours();
        if (!h) return;
        const me = persona(activePid()).name;
        this.startVisit(p, this.me(), h, this.me(), `邀请它去${me}家玩`);
        await this.save();
        for (const c of cs) this.notify(c.id, `${me} 邀请「${p.name}」来家里玩 ${h} 小时`);
        toast(`${p.name}来你家玩啦，去小院看看`);
        return this.renderPet();
      }
      if (a === 'home') {
        const host = p.visit.host, mine = this.isMine(p);
        this.endVisit(p, this.me(), mine ? `把它从${this.who(host)}家接回来了` : '把它送回了家');
        await this.save();
        if (mine && charById(host)) this.notify(host, `${persona(activePid()).name} 把「${p.name}」接回家了`);
        if (!mine) for (const c of cs) this.notify(c.id, `${persona(activePid()).name} 把「${p.name}」送回家了`);
        return this.renderPet();
      }
      if (a === 'dress') return this.renderDress(p);
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
    const cands = this.list.filter(x => x.id !== p.id && !this.hasPersona(x) && this.charOwners(x).length && this.petPid(x) === pid);
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
  if (!knows(chars[i], chars[j], pid)) return toast(`${charById(chars[i]).name}和${charById(chars[j]).name}不认识，没法一起养`);
}
      const name = st.name || SPECIES[st.sp].name;
      if (edit) Object.assign(edit, { color: st.color, name, owners: own, pid });
else {
  const p = { id: uid(), sp: st.sp, color: st.color, name, owners: own, pid, hunger: 80, clean: 100, happy: 80, poop: 0, poopAcc: 0,
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

     // ===== 大富翁：人数不限，棋子是各自的宠物，可以边玩边聊 =====
  monopoly: {
    name: '大富翁', w: 360, h: 360,
    tip: '和认识的角色一起玩，人数不限，棋子是大家的宠物，每只宠物有天赋。经过起点 +¥200 并抽一张卡牌，集齐同色一组过路费翻倍，踩到自己的地可以升级。掷骰前可以出一张卡牌干扰对手（催眠、蜗牛、交换、拆迁、香蕉皮），掷完不满意可以花 ¥40 重掷。每 3 轮有一次全场事件。下面可以和大家聊天。',
    // 32 格，四个角在 0 / 8 / 16 / 24
    TILES: [
      { n: '起点', k: 'start', i: '🏁' }, { n: '草莓田', g: 0, price: 60, i: '🍓' }, { n: '胡萝卜地', g: 0, price: 70, i: '🥕' },
      { n: '机会', k: 'chance', i: '❓' }, { n: '苹果园', g: 0, price: 80, i: '🍎' }, { n: '宠物税', k: 'tax', v: 80, i: '💸' },
      { n: '鱼塘', g: 1, price: 100, i: '🐟' }, { n: '猫爬架', g: 1, price: 110, i: '🐈' },
      { n: '宠物医院', k: 'jail', i: '🏥' }, { n: '狗狗乐园', g: 1, price: 120, i: '🐕' }, { n: '命运', k: 'fate', i: '🔮' },
      { n: '公交站', k: 'bus', i: '🚌' }, { n: '玩具店', g: 2, price: 140, i: '🧸' }, { n: '零食铺', g: 2, price: 150, i: '🍪' },
      { n: '机会', k: 'chance', i: '❓' }, { n: '美容院', g: 2, price: 160, i: '✂️' },
      { n: '公园', k: 'park', i: '🌳' }, { n: '宠物咖啡', g: 3, price: 180, i: '☕' }, { n: '训练场', g: 3, price: 190, i: '🎾' },
      { n: '彩票站', k: 'lottery', i: '🎰' }, { n: '摄影棚', g: 3, price: 200, i: '📸' }, { n: '公交站', k: 'bus', i: '🚌' },
      { n: '温泉', g: 4, price: 220, i: '♨️' }, { n: '游泳池', g: 4, price: 230, i: '🏊' },
      { n: '运动会', k: 'sport', i: '🏅' }, { n: '宠物酒店', g: 4, price: 250, i: '🏨' }, { n: '命运', k: 'fate', i: '🔮' },
      { n: '道具店', k: 'shop', i: '🛒' }, { n: '游乐园', g: 5, price: 280, i: '🎡' }, { n: '水族馆', g: 5, price: 300, i: '🐠' },
      { n: '传送门', k: 'portal', i: '🌀' }, { n: '豪华猫窝', g: 5, price: 350, i: '👑' },
    ],
    GROUPS: ['#f08a9a', '#f0a040', '#6ab0e8', '#5fbf6a', '#f0c040', '#a07ad8'],
   ITEMS: {
      remote: { n: '遥控骰子', i: '🎮', price: 90 }, double: { n: '双骰卡', i: '🎲', price: 60 },
      free: { n: '免租卡', i: '🛡️', price: 80 }, steal: { n: '抢地卡', i: '🃏', price: 150 },
      // 下面是卡牌。card: 'target' 要选一个对手，'trap' 放在脚下，没有 card 的是被动生效
      nap: { n: '催眠卡', i: '💤', price: 120, card: 'target', d: '对手下回合睡过去' },
      snail: { n: '蜗牛卡', i: '🐌', price: 60, card: 'target', d: '对手下次最多走 3 步' },
      swap: { n: '交换卡', i: '🔄', price: 100, card: 'target', d: '和对手交换位置' },
      wreck: { n: '拆迁卡', i: '🚧', price: 130, card: 'target', d: '拆对手一级房子，没房子就赔你 ¥50' },
      banana: { n: '香蕉皮', i: '🍌', price: 50, card: 'trap', d: '扔在脚下，别人经过会滑倒停下，赔你 ¥60' },
      guard: { n: '护盾', i: '🪞', price: 70, d: '自动挡下一次别人对你出的牌' },
    },
    TALENTS: [
      { k: 'rich', n: '招财', i: '💰', d: '经过起点多拿 ¥80' },
      { k: 'bargain', n: '砍价', i: '✂️', d: '买地和升级打 8 折' },
      { k: 'tough', n: '铁头', i: '🪖', d: '付过路费少 25%' },
      { k: 'lucky', n: '好运', i: '🍀', d: '抽到命运时一半几率改抽机会' },
      { k: 'swift', n: '飞毛腿', i: '💨', d: '掷出 1 自动变成 3' },
      { k: 'landlord', n: '收租', i: '🏠', d: '自己的地过路费 +20%' },
    ],
    EVENTS: [
      { k: 'harvest', n: '丰收节', i: '🌾', d: '这一轮过路费 ×1.5' },
      { k: 'notax', n: '免税日', i: '🎉', d: '这一轮不用交税和罚款' },
      { k: 'sale', n: '地产大促', i: '🏷️', d: '这一轮买地 7 折' },
      { k: 'rain', n: '红包雨', i: '🧧', d: '每人领 ¥50' },
      { k: 'storm', n: '台风天', i: '🌀', d: '这一轮公交停运、传送门失灵' },
    ],

    start(p, cv, ui, done) {
      const ctx = cv.getContext('2d'), pid = activePid(), me = persona(pid);
            const N = this.TILES.length, CELL = Math.floor(cv.width / 9);
      const { GROUPS, ITEMS, TALENTS, EVENTS } = this;
       // 12 个差别明显的颜色；再多的人换深浅，配合编号区分
      const BASE = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#42a5c4', '#f032e6', '#9a6324',
        '#808000', '#000075', '#e6a800', '#008080'];
      const colorOf = i => BASE[i] || `hsl(${Math.round(i * 137.5) % 360},70%,${i % 2 ? 35 : 55}%)`;
      // 带编号的小圆牌：颜色 + 数字，颜色像的时候看数字
      const badge = (x, y, r, pl) => {
        ctx.save();
        ctx.fillStyle = pl.color; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(r * 1.3)}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(players.indexOf(pl) + 1, x, y + 0.5);
        ctx.restore();
      };
      const LV = ['空地', '小屋', '两栋小屋', '宠物乐园'];
      const SPD = { slow: 1.6, mid: 1, fast: 0.5 };
      const C = { bg: cvar('bg'), panel: cvar('panel'), them: cvar('them'), text: cvar('text'), line: cvar('border'), acc: cvar('accent') };
      const R = n => Math.floor(Math.random() * n);
      const wait = ms => new Promise(r => setTimeout(r, ms));
      p.games ??= {};
      let spd = SPD[p.games.monoSpd] || SPD.slow;
      const W8 = ms => wait(ms * spd);
      const tiles = this.TILES.map(t => ({ ...t, owner: null, lv: 0 }));
      let players = [], cur = 0, round = 1, MAX = 20, dice = [], logs = [], chat = [], evt = '', stopped = false, ev = null, hl = null;
      let diff = 1; // 简单 1.5，普通 1，困难 0.35
      // ===== 组队 =====
      let teams = null; // 组队赛时是 [{ n: 队名, i: 图标, ids: [玩家ID...] }]，个人赛是 null
 let talkCtx = ''; // 开局读到的最近聊天，整局固定不变，放进系统提示词，缓存才能一直命中
  let memCtx = {}; // 开局召回的每个角色的记忆，整局固定不变
      const TEAM_N = [['红队', '🔴'], ['蓝队', '🔵'], ['绿队', '🟢'], ['黄队', '🟡'], ['紫队', '🟣'], ['橙队', '🟠'], ['白队', '⚪'], ['黑队', '⚫']];
      const TEAM_C = ['#e04a3a', '#3a7ae0', '#3aa050', '#e0b828', '#9a50c8', '#f08a20', '#a0a0a0', '#303030'];
      const mkTeam = i => ({ n: TEAM_N[i]?.[0] || `${i + 1}队`, i: TEAM_N[i]?.[1] || '🏳️', c: TEAM_C[i] || `hsl(${i * 67 % 360},60%,50%)`, ids: [] });
      const teamOf = pl => teams?.find(t => t.ids.includes(pl.id));
      const sameTeam = (a, b) => !!teams && a !== b && teamOf(a) === teamOf(b);
      // 人少的队每人多发的起始资金（补偿掷骰次数少）
      const bonusOf = (money, big, n) => Math.round(money * (big / n - 1) * 0.5 / 10) * 10;
      // 随机分：打乱后轮流发牌，每队人数最多差 1
      const randomTeams = (chars, tn) => {
        const all = ['user', ...chars.map(c => c.id)].sort(() => Math.random() - 0.5);
        const list = Array.from({ length: tn }, (_, i) => mkTeam(i));
        all.forEach((id, i) => list[i % tn].ids.push(id));
        return list;
      };
         // 读最近的聊天，看有没有人说过想和谁组队
      const recentTalk = async chars => {
        const ids = new Set(chars.map(c => c.id)), out = [];
        const fmt = (ms, n) => ms.filter(m => ['text', 'voice'].includes(m.type)).slice(-n)
          .map(m => `${senderName(m, pid)}：${preview(m, false, pid).slice(0, 60)}`).join('\n');
        // 群聊：这一局里有人在的群（你不在的群至少要有两个参赛角色）
        for (const g of S.groups) {
          if (g.personaId !== pid) continue;
          const n = g.members.filter(id => ids.has(id)).length;
          if (n < (g.userIn === false ? 2 : 1)) continue;
          const t = fmt(await getMsgs(Conv.g(g.id)), 20);
          if (t) out.push(`【群「${g.name}」最近的聊天】\n${t}`);
        }
        // 私聊：你和每个参赛角色
        for (const c of chars) {
          const t = fmt(await getMsgs(Conv.dm(pid, c.id)), 10);
          if (t) out.push(`【${me.name}和${c.name}的私聊】\n${t}`);
        }
 // 角色之间的私聊：两个人都参赛、而且互相认识的才读
        for (let i = 0; i < chars.length; i++) for (let j = i + 1; j < chars.length; j++) {
          const a = chars[i], b = chars[j];
          if (!knows(a.id, b.id, pid)) continue;
          const t = fmt(await getMsgs(Conv.cc(pid, a.id, b.id)), 10);
          if (t) out.push(`【${a.name}和${b.name}的私聊】\n${t}`);
        }
        return out.join('\n\n').slice(-5000); // 太长就只留最近的，控制费用
      };
// 开局调用一次 AI：按性格、关系、记忆和聊天，定每个角色的性格底色和对每个人的态度
      const aiStance = async chars => {
        const names = chars.map(c => c.name), all = [me.name, ...names];
        const pairs = [];
        for (let i = 0; i < chars.length; i++) for (let j = i + 1; j < chars.length; j++) {
          const a = chars[i], b = chars[j];
          pairs.push(`${a.name} 和 ${b.name}：${knows(a.id, b.id, pid) ? (getRel(a.id, b.id, pid).desc || '认识') : '不认识'}`);
        }
        const system = [
          `${me.name}约了${names.join('、')}一起玩宠物大富翁。你要判断每个角色在这局里会怎么对待其他人。`,
          `【${me.name}的设定】\n${(me.persona || '（无）').slice(0, 400)}`,
          ...chars.map(c => `【${c.name}】\n${(c.persona || '（无）').slice(0, 600)}\n和${me.name}的关系：${getRel(pid, c.id).desc || '认识'}`),
          pairs.length && `【角色之间的关系】\n${pairs.join('\n')}`,
          ...chars.map(c => memCtx[c.id]).filter(Boolean),
          talkCtx && `【最近的聊天记录】\n${talkCtx}`,
          `【怎么判断】
- 先看这个人本身：好胜还是随和，嘴硬还是直接，心软还是较真。这决定他打牌的底色。
- 再看他和每个人真实的相处模式：最近关系有什么变化，有没有没说开的事、在意对方却不好意思、刚闹过别扭、互相较劲惯了、一直照顾对方，等等。这些大多和游戏无关，但会影响他玩的时候对谁手下留情、对谁不客气。
- 不要套刻板印象：关系好不等于放水，好胜的人可能偏要赢最熟的人；关系一般也不等于针对。铁面无私的人也可能有一两个例外，心软的人也会有不想让的人。
- 没有明显理由就写 0，别硬编。
- 心态和原因都用中文写，聊天记录里的外语只是原文。
【输出格式】
每个角色先写一行：名字｜胜负心：0到10｜心软：0到10｜心态：一句话（20 字以内）
再对其他每个人各写一行：名字→对象：-3到3的整数｜原因（15 字以内）
正数是想手下留情，负数是想针对，0 是没特别想法。对象只能是 ${all.join('、')}。`,
        ].filter(Boolean).join('\n\n');
        const out = await API.claude(system, [{ role: 'user', content: '开始' }], { maxTokens: 200 + chars.length * 120 });
        const plNames = players.map(x => x.name);
        const find = nm => { const n = Prompt.matchName(plNames, nm); return n ? players.find(x => x.name === n) : null; };
        const num = (s, re, lo, hi) => { const m = s.match(re); return m ? Math.max(lo, Math.min(hi, Number(m[1]))) : null; };
        for (const raw of out.split('\n')) {
          const line = raw.trim().replace(/^[*\-•]\s*/, '');
          const rel = line.match(/^(.+?)\s*(?:→|->|>)\s*(.+?)\s*[:：]\s*([+-]?\d)\s*(?:[|｜]\s*(.*))?$/);
          if (rel) {
            const pl = find(rel[1]), to = find(rel[2]);
            if (!pl || !to || pl === to || pl.id === 'user') continue;
            pl.bias[to.id] = Math.max(-3, Math.min(3, Number(rel[3])));
            if (rel[4]) pl.why[to.id] = rel[4].replace(/^原因\s*[:：]\s*/, '').slice(0, 30);
            continue;
          }
          if (!/胜负心|心软/.test(line)) continue;
          const pl = find(line.split(/[|｜]/)[0]);
          if (!pl || pl.id === 'user') continue;
          pl.comp = num(line, /胜负心\s*[:：]\s*(\d+)/, 0, 10) ?? pl.comp;
          pl.heart = num(line, /心软\s*[:：]\s*(\d+)/, 0, 10) ?? pl.heart;
          const md = line.match(/心态\s*[:：]\s*(.+)$/);
          if (md) pl.mood = md[1].trim().slice(0, 20);
        }
        players.forEach(refresh);
      };
      // 按态度分算出现在最想针对谁（≤-2）、最想放水给谁（≥2）
      const refresh = pl => {
        if (!pl.bias) return;
        const e = Object.entries(pl.bias).filter(([id]) => byId(id) && !byId(id).out);
        const lo = e.filter(([id, v]) => v <= -2 && !sameTeam(pl, byId(id))).sort((a, b) => a[1] - b[1])[0];
        const hi = e.filter(([, v]) => v >= 2).sort((a, b) => b[1] - a[1])[0];
        pl.foe = lo ? lo[0] : null;
        pl.soft = hi ? hi[0] : null;
      };
      // 态度变化，跨过门槛时写动态
      const shift = (pl, to, d, why = '') => {
        if (!pl?.bias || !to || pl === to || pl.id === 'user') return;
        const old = pl.bias[to.id] || 0, v = Math.max(-3, Math.min(3, old + d));
        if (v === old) return;
        pl.bias[to.id] = v;
        if (why) pl.why[to.id] = why.slice(0, 30);
        refresh(pl);
        const r = why ? `（${why}）` : '';
        if (v <= -2 && old > -2 && !sameTeam(pl, to)) { log(`😤 ${pl.name}跟${to.name}杠上了${r}`, pl); react(`${pl.name}决定这局跟${to.name}较劲${r}`, pl.id); }
        else if (v > -2 && old <= -2) log(`🕊️ ${pl.name}不跟${to.name}计较了${r}`, pl);
        else if (v >= 2 && old < 2) log(`🤝 ${pl.name}打算对${to.name}手下留情${r}`, pl);
        else if (v < 2 && old >= 2) log(`😼 ${pl.name}不打算再让着${to.name}了${r}`, pl);
      };
      // 记仇：被惹到攒怨气。好胜的人攒得快，心软的人攒得慢；对在意的人更不容易生气
      const annoy = (pl, by, n) => {
        if (!pl?.bias || !by || pl === by || pl.id === 'user' || !n || sameTeam(pl, by)) return;
        const b = pl.bias[by.id] || 0;
        n *= (0.6 + pl.comp / 10) * (1.3 - pl.heart / 10) * (b > 0 ? 0.6 : 1);
        pl.grudge[by.id] = (pl.grudge[by.id] || 0) + n;
        if (pl.grudge[by.id] >= 3) { pl.grudge[by.id] = 0; shift(pl, by, -1, '被惹急了'); }
      };
      // 每轮：心软的人慢慢消气，偶尔主动和好
      const cool = () => players.forEach(pl => {
        if (!pl.bias || pl.out) return;
        for (const k in pl.grudge) pl.grudge[k] *= 1 - pl.heart * 0.05;
        const foe = byId(pl.foe);
        if (foe && Math.random() < pl.heart * 0.02) shift(pl, foe, 1, '气消了一点');
      });
      // 现在每个角色的态度，给聊天用
      const stanceText = () => players.slice(1).filter(x => !x.out && x.bias).map(x => {
        const rel = Object.entries(x.bias).filter(([, v]) => v).map(([id, v]) =>
          `${v > 0 ? '想让着' : '想针对'}${byId(id)?.name}${x.why[id] ? '（' + x.why[id] + '）' : ''}`).join('，');
        return `${x.name}${x.mood ? `「${x.mood}」` : ''}${rel ? '：' + rel : ''}`;
      }).join('；');
      // 你在聊天框说话时，用这句话去召回记忆（开局已经放进去的不重复）
      const recallFor = async (cs, text) => {
        const list = [...cs].sort((a, b) => (text.includes(b.name) ? 1 : 0) - (text.includes(a.name) ? 1 : 0)).slice(0, 4);
        const out = [];
        for (const c of list) {
          try {
            const { normal } = await Memory.retrieve(c.id, pid, text);
            const ls = normal.filter(m => !(memCtx[c.id] || '').includes(m.text)).slice(-3).map(m => '- ' + m.text);
            if (ls.length) out.push(`${c.name}想起的事：\n${ls.join('\n')}`);
          } catch (e) { Log.add('大富翁召回记忆失败', e.message); }
        }
        return out.join('\n');
      };
      // 角色自己选：按设定、世界书、彼此关系和聊天记录分队，解析不出来返回 null
      const aiTeams = async (chars, tn) => {
        const names = chars.map(c => c.name);
        const wb = WB.build(chars.map(c => c.id), '').constant;
        // 角色两两之间的关系
        const pairs = [];
        for (let i = 0; i < chars.length; i++) for (let j = i + 1; j < chars.length; j++) {
          const a = chars[i], b = chars[j];
          pairs.push(`${a.name} 和 ${b.name}：${knows(a.id, b.id, pid) ? (getRel(a.id, b.id, pid).desc || '认识') : '不认识'}`);
        }
        const talkLog = await recentTalk(chars);
        const system = [
          `${me.name}约了${names.join('、')}一起玩宠物大富翁组队赛，一共 ${chars.length + 1} 个人，要分成 ${tn} 队。请按每个人的性格和彼此的关系，决定他们想和谁一队。`,
          wb && `【世界设定】\n${wb}`,
          ...chars.map(c => `【${c.name}】\n${(c.persona || '（见世界设定）').slice(0, 500)}\n和${me.name}的关系：${getRel(pid, c.id).desc || '认识'}`),
          pairs.length && `【角色之间的关系】\n${pairs.join('\n')}`,
          talkLog && `【最近的聊天记录】\n${talkLog}`,
          `【要求】\n- 聊天记录里有人明确说过想和谁组队（或者不想和谁一队），优先照办，除非这样人数会差太多。\n- 其次看关系：关系好的、有默契的、想一起赢的容易一队；有矛盾、想较劲的可以分开。\n- 正好 ${tn} 行，每行一队，格式：队1：名字、名字\n- 每个人（包括${me.name}）都要出现，只出现一次，每队至少 1 人，人数尽量平均。\n- 最后一行写：理由：用一句话说说为什么这样组。`,
        ].filter(Boolean).join('\n\n');
        const out = await API.claude(system, [{ role: 'user', content: '开始分队' }], { maxTokens: 300 });
        const all = [{ id: 'user', name: me.name }, ...chars.map(c => ({ id: c.id, name: c.name }))];
        const list = Array.from({ length: tn }, (_, i) => mkTeam(i)), used = new Set();
        let k = 0;
        for (const line of out.split('\n')) {
          const why = line.match(/^\s*理由\s*[:：]\s*(.+)/);
          if (why) { list.why = why[1].trim(); continue; }
          const m = line.match(/队[^:：]*[:：](.+)/);
          if (!m || k >= tn) continue;
          for (const raw of m[1].split(/[、,，\s]+/)) {
            const nm = raw.trim();
            const x = all.find(a => !used.has(a.id) && (a.name === nm || (a.id === 'user' && nm === '我')));
            if (x) { list[k].ids.push(x.id); used.add(x.id); }
          }
          if (list[k].ids.length) k++;
        }
        if (!k) return null;
        // 漏掉的人放进人最少的队；空队从人最多的队挪一个过来
        const minT = () => list.reduce((m, x) => (x.ids.length < m.ids.length ? x : m));
        const maxT = () => list.reduce((m, x) => (x.ids.length > m.ids.length ? x : m));
        for (const a of all) if (!used.has(a.id)) minT().ids.push(a.id);
        for (const t of list) if (!t.ids.length && maxT().ids.length > 1) t.ids.push(maxT().ids.pop());
        return list;
      };

      // ---- 规则 ----
      const byId = id => players.find(x => x.id === id);
      const has = (pl, k) => pl?.talent?.k === k;
      const evOn = k => ev && ev.k === k && ev.r === round;
      const others = pl => players.filter(x => x !== pl && !x.out);
      const setOwned = t => t.g != null && t.owner && tiles.filter(x => x.g === t.g).every(x => x.owner === t.owner);
      const rent = t => Math.round(t.price * 0.2 * [1, 2.5, 5, 9][t.lv] * (setOwned(t) ? (t.lv ? 1.3 : 2) : 1) * (evOn('harvest') ? 1.5 : 1));
      const rentFor = (t, payer) => Math.round(rent(t) * (has(byId(t.owner), 'landlord') ? 1.2 : 1) * (has(payer, 'tough') ? 0.75 : 1));
      const upCost = t => Math.round(t.price * 0.5);
      const cost = (pl, v, land = false) => Math.round(v * (has(pl, 'bargain') ? 0.8 : 1) * (land && evOn('sale') ? 0.7 : 1));
      const worth = pl => pl.out ? -1 : pl.money + tiles.filter(t => t.owner === pl.id).reduce((s, t) => s + t.price + t.lv * upCost(t), 0);
      const standing = (n = 99) => [...players].sort((a, b) => worth(b) - worth(a)).slice(0, n)
        .map(x => `${x.name}${x.out ? '（破产）' : ` 现金¥${x.money} 地${tiles.filter(t => t.owner === x.id).length}块`}`).join('，');
      // 队伍人均资产（破产的人算 0）
      const teamWorth = t => Math.round(t.ids.reduce((s, id) => s + Math.max(0, worth(byId(id))), 0) / t.ids.length);
      const aliveTeams = () => teams.filter(t => t.ids.some(id => !byId(id).out));
      const teamText = () => teams.map(t => `${t.i}${t.n}（${t.ids.map(id => byId(id).name).join('、')}）人均¥${teamWorth(t)}`).join('，');
      // ---- 棋盘坐标：9×9 外圈，起点在右下角，顺时针 ----
            const pos = i => {
        const S = CELL;
        return i <= 8 ? { x: (8 - i) * S, y: 8 * S } : i <= 16 ? { x: 0, y: (16 - i) * S }
          : i <= 24 ? { x: (i - 16) * S, y: 0 } : { x: 8 * S, y: (i - 24) * S };
      };

      const rr = (x, y, w, h, r) => {
        ctx.beginPath(); ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
      };
      const PIPS = { 1: [[.5, .5]], 2: [[.25, .25], [.75, .75]], 3: [[.25, .25], [.5, .5], [.75, .75]], 4: [[.25, .25], [.75, .25], [.25, .75], [.75, .75]],
        5: [[.25, .25], [.75, .25], [.5, .5], [.25, .75], [.75, .75]], 6: [[.25, .25], [.75, .25], [.25, .5], [.75, .5], [.25, .75], [.75, .75]] };
      const die = (x, y, v, sz) => {
        ctx.fillStyle = 'rgba(0,0,0,.25)'; rr(x + 2, y + 2, sz, sz, 5); ctx.fill();
        ctx.fillStyle = '#fff'; rr(x, y, sz, sz, 5); ctx.fill();
        ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = v === 1 ? '#e04a3a' : '#1e1e1e';
        PIPS[v].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(x + a * sz, y + b * sz, sz / 10, 0, 7); ctx.fill(); });
      };
      const house = (x, y, c) => {
        ctx.fillStyle = c; ctx.fillRect(x + 1, y + 3, 6, 4);
        ctx.beginPath(); ctx.moveTo(x, y + 3); ctx.lineTo(x + 4, y); ctx.lineTo(x + 8, y + 3); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillRect(x + 3, y + 5, 2, 2);
      };
      const wrap = (text, maxW) => {
        const out = []; let line = '';
        for (const ch of text) { if (ctx.measureText(line + ch).width > maxW) { out.push(line); line = ch; } else line += ch; }
        if (line) out.push(line);
        return out;
      };

            const drawNow = () => {
        const S = CELL, now = performance.now(), CW = S * 7;
        ctx.fillStyle = C.bg; ctx.fillRect(0, 0, cv.width, cv.height);
        // 中间区域
        ctx.fillStyle = C.panel; rr(S + 4, S + 4, CW - 8, CW - 8, 8); ctx.fill();
        ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
        ctx.globalAlpha = 0.08; ctx.font = '26px sans-serif'; ctx.textAlign = 'center';
        [[2, 2.2], [7, 2.8], [2.6, 6.6], [6.8, 7.2], [4.5, 4.8]].forEach(([a, b]) => ctx.fillText('🐾', a * S, b * S));
        ctx.globalAlpha = 1;
        ctx.fillStyle = C.acc; rr(S + CW / 2 - 64, S + 10, 128, 22, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = C.text; ctx.font = 'bold 13px sans-serif'; ctx.fillText('🐾 宠物大富翁', S + CW / 2, S + 26);
        ctx.font = '11px sans-serif';
        const evTxt = ev && ev.r === round ? ` · ${ev.i}${ev.n}` : '';
        ctx.fillText(players.length ? `第 ${Math.min(round, MAX)} / ${MAX} 轮${evTxt}` : '选好对手就开始', S + CW / 2, S + 46);
        if (dice.length === 1) die(S + CW / 2 - 13, S + 54, dice[0], 26);
        if (dice.length === 2) die(S + CW / 2 - 30, S + 54, dice[0], 26), die(S + CW / 2 + 4, S + 54, dice[1], 26);
        ctx.font = '11px sans-serif'; ctx.fillStyle = C.text;
        wrap(evt, CW - 24).slice(0, 2).forEach((l, i) => ctx.fillText(l, S + CW / 2, S + 96 + i * 13));
        // 玩家列表：人多时分两列，行高自动缩小
        const n = players.length, cols = n > 5 ? 2 : 1, top = S + 116, avail = CW - 126;
        const rh = Math.max(12, Math.min(22, Math.floor(avail / Math.max(1, Math.ceil(n / cols))))), cw = (CW - 16) / cols;
        const fs = Math.max(8, Math.min(11, rh - 8));
        ctx.textAlign = 'left';
        players.forEach((pl, i) => {
          const cx = S + 8 + (i % cols) * cw, cy = top + Math.floor(i / cols) * rh;
          if (i === cur && !pl.out) { ctx.globalAlpha = 0.22; ctx.fillStyle = pl.color; rr(cx, cy, cw - 4, rh - 2, 4); ctx.fill(); }
          ctx.globalAlpha = pl.out ? 0.4 : 1;
          badge(cx + 6, cy + rh / 2, Math.min(6, rh / 2 - 1), pl);
          ctx.fillStyle = C.text; ctx.font = `${fs}px sans-serif`;
          const it = Object.entries(pl.items).filter(([, v]) => v).map(([k, v]) => ITEMS[k].i + (v > 1 ? v : '')).join('');
          ctx.fillText(`${teamOf(pl)?.i || ''}${pl.talent.i}${pl.name.slice(0, cols > 1 ? 3 : 5)} ¥${pl.money}${pl.out ? ' 破产' : pl.skip ? ' 🏥' : ''}${pl.nap ? '💤' : ''}${pl.snail ? '🐌' : ''}${cols > 1 ? '' : ' ' + it}`,
            cx + 12, cy + rh / 2 + fs / 2 - 2);
          ctx.globalAlpha = 1;
        });
        // 格子
        ctx.textAlign = 'center';
        tiles.forEach((t, i) => {
          const { x, y } = pos(i), o = t.owner && byId(t.owner), corner = i % 8 === 0;
          ctx.fillStyle = corner ? C.acc : C.them; rr(x + 1, y + 1, S - 2, S - 2, 4); ctx.fill();
         if (o) { ctx.globalAlpha = teams ? 0.35 : 0.2; ctx.fillStyle = teamOf(o)?.c || o.color; ctx.fill(); ctx.globalAlpha = 1; }
          if (t.g != null) { ctx.fillStyle = GROUPS[t.g]; rr(x + 3, y + 3, S - 6, 5, 2); ctx.fill(); }
          const lit = hl && hl.i === i && now - hl.t < 1500;
          ctx.strokeStyle = lit ? hl.c : o ? o.color : C.line; ctx.lineWidth = lit ? 3 : o ? 2 : 1;
          rr(x + 1.5, y + 1.5, S - 3, S - 3, 4); ctx.stroke();
          ctx.fillStyle = C.text; ctx.font = '8px sans-serif';
          ctx.fillText(t.n.slice(0, 4), x + S / 2, y + (t.g != null ? 16 : 12));
          ctx.font = corner ? '18px sans-serif' : '14px sans-serif';
          ctx.fillText(t.i, x + S / 2, y + 30);
 if (t.trap) { ctx.font = '10px sans-serif'; ctx.fillText('🍌', x + S - 8, y + 13); }
          if (t.price) {
            if (t.lv === 3) { ctx.font = '10px sans-serif'; ctx.fillText('🏰', x + S / 2, y + S - 3); }
            else if (t.lv) for (let k = 0; k < t.lv; k++) house(x + S / 2 - t.lv * 5 + k * 10 + 1, y + S - 10, '#3aa050');
            else { ctx.font = '8px sans-serif'; ctx.fillStyle = C.text; ctx.fillText(o ? '租' + rent(t) : '¥' + t.price, x + S / 2, y + S - 4); }
          }
         if (o) badge(x + 8, y + S - 8, 6, o); // 主人的编号
        });
        // 棋子：同一格的人按网格排开，人多就缩小
        const at = {};
        players.forEach(pl => { if (!pl.out) (at[pl.pos] ??= []).push(pl); });
        const bob = Math.floor(now / 250) % 2;
        for (const [i, list] of Object.entries(at)) {
          const { x, y } = pos(Number(i)), m = list.length, cols2 = Math.ceil(Math.sqrt(m)), rows2 = Math.ceil(m / cols2);
          const cw2 = (S - 6) / cols2, ch2 = (S - 18) / rows2, ts = Math.max(0.5, Math.min(1.4, cw2 / 10, ch2 / 10));
          list.forEach((pl, k) => {
            const ox = x + 3 + (k % cols2) * cw2 + (cw2 - 10 * ts) / 2, oy = y + 16 + Math.floor(k / cols2) * ch2 + (ch2 - 10 * ts) / 2;
            const isCur = players[cur] === pl;
            ctx.globalAlpha = 0.25; ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.ellipse(ox + 5 * ts, oy + 10 * ts, 5 * ts, 1.6 * ts, 0, 0, 7); ctx.fill();
            ctx.globalAlpha = 1;
            ctx.fillStyle = pl.color; ctx.fillRect(ox, oy + 10 * ts, 10 * ts, Math.max(1.5, 2 * ts));
            Pet.drawSprite(ctx, pl.pet, ox, oy - (isCur ? bob * 2 : 0), ts);
            if (isCur) {
              ctx.fillStyle = pl.color; ctx.beginPath();
              ctx.moveTo(ox + 5 * ts - 4, oy - 8); ctx.lineTo(ox + 5 * ts + 4, oy - 8); ctx.lineTo(ox + 5 * ts, oy - 3); ctx.fill();
            }
          });
        }
      };
       // 同一帧里不管要求重画多少次，只真正画一次
      let drawQ = false;
      const draw = () => {
        if (drawQ || stopped) return;
        drawQ = true;
        requestAnimationFrame(() => { drawQ = false; if (!stopped) drawNow(); });
      };
      const animT = setInterval(() => { if (!stopped && players.length) draw(); }, 250);
// 点棋盘上的格子，显示这块地的情况
      cv.onclick = e => {
        if (!players.length) return;
        const r = cv.getBoundingClientRect();
        const mx = (e.clientX - r.left) * cv.width / r.width, my = (e.clientY - r.top) * cv.height / r.height;
        const i = tiles.findIndex((_, k) => { const q = pos(k); return mx >= q.x && mx < q.x + CELL && my >= q.y && my < q.y + CELL; });
        if (i < 0) return;
        const t = tiles[i], o = t.owner && byId(t.owner);
        const here = players.filter(x => !x.out && x.pos === i).map(x => `${players.indexOf(x) + 1}号${x.name}`);
        let s = `${t.i}${t.n}`;
        if (t.price) s += o ? ` · ${players.indexOf(o) + 1}号${o.name}${teamOf(o) ? `（${teamOf(o).n}）` : ''}的地 · ${LV[t.lv]} · 过路费 ¥${rent(t)}` : ` · 没人买 · ¥${t.price}`;
else s += ' · ' + ({
          start: '经过 +¥200 并抽一张卡，正好停下再 +¥100', tax: `交 ¥${t.v}`, jail: '体检费 ¥30；吃坏肚子会被送来住一轮',
          chance: '抽一张机会卡，多半是好事', fate: '抽一张命运卡，多半要花钱', bus: '花 ¥30 坐到另一个公交站',
          park: '选 ¥50 或一个随机道具', lottery: '花 ¥20 买彩票，最高中 ¥500', sport: '掷骰子，点数 × ¥30',
          portal: '随机传送到一块地', shop: '买道具和卡牌',
        }[t.k] || '');
        if (tiles[i].trap) s += ` · 有${byId(tiles[i].trap)?.name}的香蕉皮`;
        if (here.length) s += ` · 现在在这：${here.join('、')}`;
        hl = { i, t: performance.now(), c: o?.color || C.acc };
        draw();
        toast(s, 3000);
      };

      // ---- 下方界面 ----
      const $u = s => $(s, ui);
      const log = (text, pl = null) => {
        evt = text;
        logs.unshift({ r: round, text, color: pl?.color || C.line });
        logs = logs.slice(0, 80);
        const box = $u('#mono-log');
        if (box) {
          const l = logs[0];
          box.insertAdjacentHTML('afterbegin', `<div><i style="background:${l.color}"></i><small>第${l.r}轮</small> ${esc(l.text)}</div>`);
          while (box.children.length > 80) box.lastElementChild.remove();
        }
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
          box.innerHTML = ''; box.onclick = null;
          res(opts[b.dataset.o].value);
        };
      });

      // ---- 聊天：人多时每次最多带 4 个人的设定，控制 API 费用 ----
      let talking = false, lastTalk = 0, pendingUser = '';
      const addChat = (id, name, text) => {
        chat.push({ id, name, text });
        const box = $u('#mono-msgs');
        if (!box) return;
          box.querySelector('.mono-wait')?.remove();
        const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 40;
        box.insertAdjacentHTML('beforeend', `<div class="mono-c${id === 'user' ? ' me' : ''}"><b style="color:${byId(id)?.color || C.text}">${esc(name)}</b>：${esc(text)}</div>`);
        while (box.children.length > 40) box.firstElementChild.remove();
        // 你往上翻着看的时候不强行拉到底
        if (nearBottom) box.scrollTop = box.scrollHeight;
      };
            const aiTalk = async (desc, sid, userText) => {
        const sp = sid && charById(sid);
         // 所有还在场的角色都带上，这次主要说话的排在前面
         const allC = players.slice(1).map(x => charById(x.id)).filter(Boolean);
        const recent = logs.slice(0, 6).map(l => l.text).join(' ');
        // 顺序固定（按入场顺序），系统提示词每次都一样，才能命中缓存
        // 这次谁主要说话，已经写在下面的 task 里了，不用靠排序
        const cs = allC;
        const names = cs.map(c => c.name);
        const wb = WB.build(cs.map(c => c.id), '').constant;
        const system = [
          `你在同时扮演${names.join('、')}。他们正在和${me.name}用手机玩一局宠物大富翁（棋子是各自的宠物），大家边玩边在游戏的聊天框里打字聊天。`,
          wb && `【世界设定】\n${wb}`,
talkCtx && `【开局前大家最近的聊天，玩的时候可以自然提起】\n${talkCtx}`,
...cs.map(c => memCtx[c.id]).filter(Boolean),
          ...cs.map(c => `【${c.name}的设定】\n${(c.persona || '（见世界设定）').slice(0, 800)}\n和${me.name}的关系：${getRel(pid, c.id).desc || '认识'}`),
           `【要求】\n- 每行一条，格式：名字：内容。名字只能是${names.join('、')}，绝对不要替${me.name}说话。\n- 游戏聊天框里所有人一律用中文打字。聊天记录和记忆里的外语只是原文，不要跟着用外语。\n- 一共 1 到 5 条，都很短，像打游戏时随手打的字：得意、心疼钱、吐槽、起哄、互相拆台都可以，要符合各自的性格、和对方真实的相处模式，以及【大家现在的态度】。\n- 记忆和聊天记录里的事，只有当下真的碰到时才自然带一句，不要硬提。\n- 不写动作、神态和旁白。\n- 如果某人因为刚才的事或聊天内容，对某人的态度真的变了，另起一行写：#态度 名字>对象>变化>原因。变化是 -2 到 +2 的整数，正数是更想让着对方，负数是更想针对。要符合他的性格：较真、好胜的人被求情多半不为所动，但也不是绝对；心软的人容易被哄好，也会有不想让的时候。原因 15 字以内。大多数时候不用写。`,
        ].filter(Boolean).join('\n\n');
 const recall = userText ? await recallFor(cs, userText) : '';
        const task = [
            `【局面】第 ${round}/${MAX} 轮。${standing(6)}${teams ? `\n这是组队赛，队友之间不收过路费：${teamText()}` : ''}`,
stanceText() && `【大家现在的态度】${stanceText()}`,
           `【刚才发生的】\n${logs.filter(l => !l.text.startsWith('💭')).slice(0, 6).reverse().map(l => l.text).join('\n')}`,
          chat.length && `【聊天框】\n${chat.slice(-8).map(x => x.name + '：' + x.text).join('\n')}`,
recall && `【${me.name}刚才这句话让人想起的事（只有本人知道）】\n${recall}`,
          userText ? `${me.name}刚刚在聊天框说：${userText}。要有人回应。` : `${desc}。${sp ? `这次主要是${sp.name}开口，` : ''}说一两句就行。`,
        ].filter(Boolean).join('\n\n');
       const out = await API.claude(system, [{ role: 'user', content: task }], { maxTokens: 600, cache: true });
        // 先把 #态度 行挑出来执行，剩下的才是聊天内容
        const plNames = players.map(x => x.name);
        for (const tag of out.match(/^\s*#态度.*$/gm) || []) {
          const [a = '', b = '', d = '', why = ''] = tag.replace(/^\s*#态度\s*/, '').split(/[>＞]/).map(s => s.trim());
          const an = Prompt.matchName(plNames, a), bn = Prompt.matchName(plNames, b);
          const who = players.find(x => x.name === an && x.id !== 'user'), to = players.find(x => x.name === bn);
          const n = Math.max(-2, Math.min(2, parseInt(d, 10) || 0));
          if (who && to && n) shift(who, to, n, why);
        }
        const clean = out.replace(/^\s*#态度.*$/gm, '');
        // 名字对不上的那一条跳过，其他照常显示
        const lines = Prompt.parseLines(clean, names).msgs.filter(m => m.content && m.type !== 'sys')
          .map(m => ({ c: cs.find(c => c.name === m.name), content: m.content }))
          .filter(x => x.c).slice(0, 5)
          .map(x => ({ id: x.c.id, name: x.c.name, content: x.content }));
        if (!lines.length) Log.add('大富翁聊天：回复解析后为空', out.slice(0, 300));
        return lines;
      };
      const localTalk = sid => {
        const c = byId(sid) || pick(players.slice(1));
        return [{ id: c.id, name: c.name, content: pick(['哈哈哈哈', '等着瞧', '这把我要赢', '我的钱啊😭', '稳住', '你运气也太好了吧', '下一个就是你']) }];
      };
      const talk = async (desc, sid = null, userText = '') => {
        if (talking) { if (userText) pendingUser = pendingUser ? pendingUser + '；' + userText : userText; return; }
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
      // 税和罚款：免税日不用交
      const fine = (pl, amt, msg = '') => {
        if (evOn('notax')) return log(`${msg || pl.name + '要交 ¥' + amt}，但今天免税日，免了`, pl);
        if (msg) log(msg, pl);
        pay(pl, null, amt);
      };
 // ---- 卡牌和重掷：全是本地规则，不调 AI ----
      const CARDS = ['nap', 'snail', 'swap', 'wreck', 'banana', 'guard'];
      const REROLL = 40;
      const foes = pl => others(pl).filter(o => !sameTeam(pl, o));
      // 抽一张卡，手里道具最多 6 个
      const giveCard = (pl, why = '') => {
        if (Object.values(pl.items).reduce((a, b) => a + b, 0) >= 6) return;
        const k = pick(CARDS);
        pl.items[k]++;
        if (why) log(`${pl.name}${why}，抽到一张${ITEMS[k].i}${ITEMS[k].n}`, pl);
      };
      // 出牌
      const playCard = (pl, k, tg) => {
        const it = ITEMS[k];
        pl.items[k]--;
        const sid = pl.id === 'user' ? tg?.id : pl.id; // 让角色来接话，不替你说话
        if (k === 'banana') {
          tiles[pl.pos].trap = pl.id;
          log(`🍌 ${pl.name}在${tiles[pl.pos].n}扔了一块香蕉皮`, pl);
          return;
        }
        if (tg.items.guard) {
          tg.items.guard--;
          log(`🪞 ${tg.name}的护盾挡下了${pl.name}的${it.i}${it.n}`, pl);
 annoy(tg, pl, 0.5);
          react(`${pl.name}想对${tg.name}用${it.n}，被护盾挡住了`, sid);
          return;
        }
        let txt;
        if (k === 'nap') { tg.nap = 1; txt = `💤 ${pl.name}对${tg.name}用了催眠卡，${tg.name}下回合要睡一觉`; }
        else if (k === 'snail') { tg.snail = 1; txt = `🐌 ${pl.name}对${tg.name}用了蜗牛卡，${tg.name}下次最多走 3 步`; }
        else if (k === 'swap') { [pl.pos, tg.pos] = [tg.pos, pl.pos]; txt = `🔄 ${pl.name}和${tg.name}交换了位置`; }
        else if (k === 'wreck') {
          const t = tiles.filter(x => x.owner === tg.id && x.lv).sort((a, b) => b.price - a.price)[0];
          if (t) { t.lv--; txt = `🚧 ${pl.name}拆了${tg.name}在${t.n}的一级房子`; }
          else { pay(tg, pl, 50); txt = `🚧 ${tg.name}没有房子可拆，赔了${pl.name} ¥50`; }
        }
        log(txt, pl);
        draw();
        annoy(tg, pl, 1.5);
        react(txt, sid);
      };
      // 从某个位置往前 1~6 格，踩到对手地要付的过路费总和，用来判断前面危不危险
      const danger = (pos, pl) => {
        let s = 0;
        for (let v = 1; v <= 6; v++) {
          const t = tiles[(pos + v) % N];
          if (t.price && t.owner && t.owner !== pl.id && !sameTeam(pl, byId(t.owner))) s += rentFor(t, pl);
        }
        return s;
      };
      // 角色出不出牌、出给谁。难度越高越爱出
      const aiCard = pl => {
        const foeNow = foes(pl).find(o => o.id === pl.foe);
        // 好胜的人更爱出牌，较上劲了更爱
        const rate = (diff < 1 ? 0.75 : diff > 1 ? 0.25 : 0.5) + (pl.comp - 5) * 0.04 + (foeNow ? 0.25 : 0);
        if (Math.random() > rate) return null;
        // 要不要手下留情：在意的人、快输光的人，心软的更会留情，好胜的更不会。都是概率
        const spare = o => {
          if (o === foeNow) return false;
          const b = pl.bias[o.id] || 0;
          if (b > 0 && Math.random() < b * 0.25 + pl.heart * 0.04 - pl.comp * 0.03) return true;
          return worth(o) < worth(pl) * 0.5 && Math.random() < pl.heart * 0.06;
        };
        const fs = foes(pl).filter(o => !spare(o) && (o === foeNow || !o.items.guard || Math.random() < 0.3));
        if (pl.items.swap) {
          const t = [...fs].sort((a, b) => danger(a.pos, pl) - danger(b.pos, pl))[0];
          if (t && danger(pl.pos, pl) - danger(t.pos, pl) > (diff < 1 ? 120 : 200)) return { k: 'swap', tg: t };
        }
        // 有较劲的先对他，没有就打领先的人；态度是负的人更容易被选中
        const score = o => worth(o) * (1 - (pl.bias[o.id] || 0) * 0.15);
        const lead = [...fs].sort((a, b) => score(b) - score(a))[0];
        const top = fs.includes(foeNow) ? foeNow : lead && worth(lead) > worth(pl) * 0.9 ? lead : null;
        if (top) {
          if (pl.items.wreck && tiles.some(t => t.owner === top.id && t.lv)) return { k: 'wreck', tg: top };
          if (pl.items.nap && !top.nap && !top.skip) return { k: 'nap', tg: top };
          if (pl.items.snail && !top.snail) return { k: 'snail', tg: top };
        }
        const here = tiles[pl.pos];
        if (pl.items.banana && !here.trap && pl.pos !== 0 && (here.owner === pl.id || Math.random() < 0.4)) return { k: 'banana' };
        return null;
      };
 // ===== 角色的"思考"：困难模式按局面算，想法写进动态 =====
       const think = (pl, text) => {
        if (!text || pl.id === 'user') return;
        log(`💭 ${pl.name}：${text}`, pl);
        // 也显示在聊天框里，灰色斜体。不放进 chat，别的角色看不到
        const box = $u('#mono-msgs');
        if (!box) return;
        box.querySelector('.mono-wait')?.remove();
        const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 40;
        box.insertAdjacentHTML('beforeend', `<div class="mono-c" style="opacity:.6;font-style:italic">💭 ${esc(pl.name)}心里想：${esc(text)}</div>`);
        while (box.children.length > 40) box.firstElementChild.remove();
        if (nearBottom) box.scrollTop = box.scrollHeight;
      };
      const handN = pl => Object.values(pl.items).reduce((a, b) => a + b, 0);
      const handText = pl => Object.entries(pl.items).filter(([, v]) => v).map(([k, v]) => `${ITEMS[k].n}×${v}`).join('、') || '没有道具';
      const ITEM_DESC = { remote: '下次自己指定走几步', double: '下次掷两个骰子', free: '免一次过路费', steal: '把别人没盖房的地买过来' };
      const descOf = k => ITEMS[k].d || ITEM_DESC[k] || '';
      // 这个道具现在对他值多少钱，以及理由
      const itemValue = (pl, k) => {
        const fs = foes(pl), lead = [...fs].sort((a, b) => worth(b) - worth(a))[0];
        const atk = fs.reduce((s, o) => s + o.items.nap + o.items.snail + o.items.swap + o.items.wreck, 0);
        const hostile = fs.filter(o => (o.bias?.[pl.id] || 0) <= -2);
        const rents = tiles.filter(t => t.owner && t.owner !== pl.id && !sameTeam(pl, byId(t.owner))).map(t => rentFor(t, pl));
        const ahead = (a, b) => { let n = 0; for (let v = a; v <= b; v++) { const t = tiles[(pl.pos + v) % N]; if (t.price && !t.owner) n++; } return n; };
        const myN = tiles.filter(t => t.owner === pl.id).length, dg = danger(pl.pos, pl);
        let v = 0, why = '';
        if (k === 'guard') { v = 40 + atk * 25 + hostile.length * 40; why = hostile.length ? `${hostile[0].name}一直针对我，得防着` : atk ? '别人手里攻击卡不少' : '买个保险'; }
        if (k === 'wreck') { const ok = lead && tiles.some(t => t.owner === lead.id && t.lv); v = ok ? 160 : 30; why = ok ? `${lead.name}房子盖得太多了` : '先留着'; }
        if (k === 'nap') { const ok = lead && worth(lead) > worth(pl); v = ok ? 130 : 50; why = ok ? `让${lead.name}睡一觉` : '关键时候能用'; }
        if (k === 'snail') { const ok = lead && worth(lead) > worth(pl); v = ok ? 80 : 40; why = ok ? `拖一拖${lead.name}` : '便宜'; }
        if (k === 'free') { v = rents.length ? Math.max(...rents) * 0.6 : 20; why = rents.length ? '外面的过路费太贵了' : '暂时用不上'; }
        if (k === 'remote') { v = 50 + dg * 0.3 + ahead(1, 6) * 20; why = dg > 100 ? '前面太危险，得自己选步数' : '想精准踩空地'; }
        if (k === 'swap') { v = 50 + dg * 0.4; why = dg > 100 ? '前面全是别人的地' : '留着躲危险'; }
        if (k === 'banana') { v = myN ? 40 + myN * 8 : 30; why = myN ? '扔在自己地上，滑倒还得交钱' : '便宜'; }
        if (k === 'double') { v = 20 + ahead(7, 12) * 15; why = ahead(7, 12) >= 2 ? '远处空地多，想走远点' : '走得快一点'; }
        if (k === 'steal') {
          const n = tiles.filter(t => t.owner && t.owner !== pl.id && !t.lv && !sameTeam(pl, byId(t.owner))
            && tiles.some(x => x.g === t.g && x !== t && x.owner === pl.id)).length;
          v = n ? 120 + n * 40 : 40; why = n ? '有几块地抢过来就能凑齐一组' : '暂时没想抢的';
        }
        v /= 1 + (pl.items[k] || 0);            // 已经有的就没那么想要了
        if (round > MAX * 0.8) v *= 0.7;        // 快结束了，道具用不了几次
        return [Math.round(v), why];
      };
      // 困难模式 + 填了 Key：让角色按性格自己挑，顺便说出心里话
      const aiShopThink = async (pl, scored) => {
        const c = charById(pl.id);
        const att = Object.entries(pl.bias || {}).filter(([, v]) => v).map(([id, v]) => `${v > 0 ? '想让着' : '想针对'}${byId(id)?.name}`).join('，');
        const system = `你在替${pl.name}决定宠物大富翁里在道具店买什么。${pl.name}的性格：${(c?.persona || '（无）').slice(0, 200)}
按他的性格和局面盘算，想法要像他自己心里嘀咕的话，用中文写。
只输出一行：买：道具名｜心里想的话（20 字以内，用他的口吻）。不买就写：不买｜心里想的话`;
        const task = `第 ${round}/${MAX} 轮。${pl.name}现金 ¥${pl.money}，手里：${handText(pl)}。${pl.mood ? '这局心态：' + pl.mood + '。' : ''}${att ? '态度：' + att + '。' : ''}
局面：${standing(6)}
能买的（划算分是参考，越高越划算）：
${scored.map(s => `${ITEMS[s.k].n} ¥${ITEMS[s.k].price}：${descOf(s.k)}（${s.why}，划算分 ${s.net}）`).join('\n')}`;
        const out = await API.claude(system, [{ role: 'user', content: task }], { maxTokens: 80 });
        const m = out.match(/^(.*?)[|｜](.*)$/m);
        if (!m) return undefined;
        const thought = m[2].trim().slice(0, 30);
        if (/不买/.test(m[1])) { think(pl, thought); return null; }
        const s = scored.find(x => m[1].includes(ITEMS[x.k].n));
        if (!s) return undefined;
        think(pl, thought);
        return s.k;
      };
      const aiShop = async (pl, can) => {
        if (handN(pl) >= 6) return null;
        if (diff > 1) return pl.money > 700 * diff && Math.random() < pl.greed * 0.5 ? pick(can)[0] : null;
        const budget = pl.money - reserve(pl) * (diff < 1 ? 0.6 : 1);
        const scored = can.filter(([, v]) => v.price <= budget)
          .map(([k, v]) => { const [val, why] = itemValue(pl, k); return { k, net: val - v.price, why }; })
          .sort((a, b) => b.net - a.net);
        if (!scored.length) { think(pl, '钱得留着交过路费'); return null; }
        if (diff < 1 && S.settings.claude.key) {
          try { const r = await aiShopThink(pl, scored); if (r !== undefined) return r; }
          catch (e) { Log.add('大富翁道具店思考失败，改用本地计算', e.message); }
        }
        const best = scored[0];
        if (best.net <= (diff < 1 ? 0 : 30)) { if (diff < 1) think(pl, '没什么值得买的'); return null; }
        think(pl, best.why);
        return best.k;
      };
      // 出牌时的想法
      const cardWhy = (pl, c) => {
        const tg = c.tg;
        if (!tg) return '这格是我的地盘，扔块香蕉皮';
        if (c.k === 'swap') return `前面全是别人的地，跟${tg.name}换个位置`;
        if (tg.id === pl.foe) return `${pl.why[tg.id] || '看他不顺眼'}，这张给${tg.name}`;
        return `${tg.name}领先太多了，得压一压`;
      };
      // 双骰卡：前面近处危险、远处空地多才用
      const aiDouble = pl => {
        if (diff >= 1) return Math.random() < 0.3;
        let far = 0;
        for (let v = 7; v <= 12; v++) { const t = tiles[(pl.pos + v) % N]; if (t.price && !t.owner) far++; }
        const yes = danger(pl.pos, pl) >= 120 || far >= 3;
        if (yes) think(pl, far >= 3 ? '远处空地多，掷两个骰子' : '近处太危险，走远一点');
        return yes;
      };
      // 免租卡 / 抢地卡
      const aiDefend = (pl, t, o, r, opts) => {
        if (opts.some(x => x.value === 'steal')) {
          const grp = tiles.filter(x => x.g === t.g && x !== t);
          const completes = grp.every(x => x.owner === pl.id), mineN = grp.filter(x => x.owner === pl.id).length;
          const spare = (pl.bias?.[o.id] || 0) >= 2 && Math.random() < 0.6;
          const ok = diff < 1
            ? !spare && (completes || mineN >= 1 || o.id === pl.foe) && pl.money - t.price > 120
            : pl.money - t.price > 250;
          if (ok) { if (diff < 1) think(pl, completes ? `抢下${t.n}就集齐一整组了` : `${t.n}早就想要了`); return 'steal'; }
        }
        if (opts.some(x => x.value === 'free') && r >= (diff < 1 ? 40 : diff > 1 ? 100 : 60)) return 'free';
        return null;
      };
      // 公交：比较两边的危险和空地
      const aiBus = (pl, to) => {
        if (pl.money < 30) return false;
        if (diff >= 1) return pl.money > 300 && Math.random() < 0.5;
        const freeN = p0 => { let n = 0; for (let v = 1; v <= 6; v++) { const t = tiles[(p0 + v) % N]; if (t.price && !t.owner) n++; } return n; };
        const here = danger(pl.pos, pl), there = danger(to, pl);
        const gain = here - there + (freeN(to) - freeN(pl.pos)) * 40 + (to < pl.pos ? 200 : 0) - 30;
        if (gain > 30) { think(pl, there < here ? '这边太危险，坐车躲一躲' : '那边空地多，过去看看'); return true; }
        return false;
      };
      // 彩票平均每张回本 ¥65，困难模式有闲钱就买
      const aiLottery = pl => diff < 1 ? pl.money >= 60 : pl.money > 200 && Math.random() < 0.6;
      // 公园：道具少拿道具，缺钱拿钱
      const aiPark = pl => diff < 1 ? (pl.money >= 150 && handN(pl) < 4 ? 'item' : 'money') : Math.random() < 0.3 ? 'item' : 'money';
      // 住院：钱够留底就提前出院
      const aiBail = pl => diff < 1 ? pl.money - 50 >= reserve(pl) : pl.money > 600 && Math.random() < 0.6;
      // 掷骰子（含飞毛腿）
      const rollDice = async (pl, two) => {
        for (let i = 0; i < 8; i++) { dice = Array.from({ length: two ? 2 : 1 }, () => 1 + R(6)); draw(); await wait(80); }
        const raw = dice.join(' + ');
        if (has(pl, 'swift') && dice.includes(1)) dice = dice.map(d => (d === 1 ? 3 : d));
        const n = dice.reduce((a, b) => a + b, 0);
        log(`${pl.name}${two ? '用了双骰卡，' : ''}掷出了 ${raw}${raw !== dice.join(' + ') ? `（💨飞毛腿：变成 ${dice.join(' + ')}）` : ''}${two ? ' = ' + n : ''}`, pl);
        return n;
      };
      // ---- 移动 ----
      const walk = async (pl, n) => {
        for (let i = 0; i < n && !stopped; i++) {
          pl.pos = (pl.pos + 1) % N;
          if (pl.pos === 0) {
            const b = 200 + (has(pl, 'rich') ? 80 : 0); pl.money += b; log(`${pl.name}经过起点，领了 ¥${b}`, pl);
            giveCard(pl, '经过起点');
          }
          draw(); await W8(220);
          // 踩到别人的香蕉皮：停在这格，赔钱
          const tr = tiles[pl.pos].trap, o = tr && byId(tr);
          if (o && o !== pl && !sameTeam(pl, o)) {
            tiles[pl.pos].trap = null;
            log(`🍌 ${pl.name}踩到${o.name}的香蕉皮滑倒了，停在${tiles[pl.pos].n}，赔了 ¥60`, pl);
            pay(pl, o, 60);
annoy(pl, o, 1);
            react(`${pl.name}踩到${o.name}扔的香蕉皮滑倒了`, pl.id === 'user' ? o.id : pl.id);
            break;
          }
        }
      };
      const back = async (pl, n) => { for (let i = 0; i < n && !stopped; i++) { pl.pos = (pl.pos - 1 + N) % N; draw(); await W8(220); } };
      const moveTo = (pl, idx) => walk(pl, (idx - pl.pos + N) % N);

      // ---- 卡片 ----
      const CHANCE = [
        ['宠物选美拿了第一名，奖金 ¥150', pl => { pl.money += 150; }],
        ['在草丛里捡到一袋小鱼干，卖了 ¥60', pl => { pl.money += 60; }],
        ['获得一个遥控骰子 🎮', pl => { pl.items.remote++; }],
        ['获得一张免租卡 🛡️', pl => { pl.items.free++; }],
        ['获得一张双骰卡 🎲', pl => { pl.items.double++; }],
        ['获得一张抢地卡 🃏', pl => { pl.items.steal++; }],
        ['获得一张随机卡牌 🎴', pl => giveCard(pl)],
        ['宠物撒腿狂奔，向前 3 格', async pl => { await walk(pl, 3); await land(pl); }],
        ['宠物想家了，直接跑回起点', async pl => { await moveTo(pl, 0); }],
        ['朋友叫你们去公园玩', async pl => { await moveTo(pl, 16); await land(pl); }],
      ];
      const FATE = [
        ['宠物打翻了邻居的花盆，赔 ¥80', pl => fine(pl, 80)],
        ['宠物随地便便被罚款 ¥50', pl => fine(pl, 50)],
        ['宠物在美容院乱跑，付 ¥40 清洁费', pl => fine(pl, 40)],
        ['宠物吃坏了肚子，直接去医院住一轮', pl => { pl.pos = 8; pl.skip = 1; }],
        ['给所有房子做维修，每级 ¥25', pl => { const n = tiles.filter(t => t.owner === pl.id).reduce((s, t) => s + t.lv, 0); if (n) fine(pl, n * 25, `一共 ${n} 级，付了 ¥${n * 25}`); }],
        ['今天是你宠物的生日，每人送你 ¥30', pl => others(pl).forEach(o => pay(o, pl, 30))],
        ['请大家喝奶茶，每人 ¥25', pl => others(pl).forEach(o => pay(pl, o, 25))],
        ['宠物被路边的猫吓得后退 2 格', async pl => { await back(pl, 2); await land(pl); }],
        ['一场暴风雨，你最贵的房子降了一级', pl => {
          const t = tiles.filter(x => x.owner === pl.id && x.lv).sort((a, b) => b.price - a.price)[0];
          log(t ? `${t.n}降到了${LV[--t.lv]}` : '还好你没有房子', pl);
        }],
      ];

      // ---- 角色的决策（本地规则，不调 AI） ----
           // 买完要留多少钱：难度越高留得越少。后期（剩不到 1/4 轮数）买地回不了本，会收手一点
      const reserve = pl => (80 + (1 - pl.greed) * 200) * diff * (round > MAX * 0.75 ? 1.5 : 1);
      const aiBuy = (pl, t, price) => {
        const grp = tiles.filter(x => x.g === t.g && x !== t);
        const completes = grp.every(x => x.owner === pl.id);
        // 困难模式下会抢别人快集齐的组，防止对方翻倍
       const o0 = grp[0]?.owner;
        // 困难模式抢所有人快集齐的组；杠上了，不管什么难度都抢仇人的
        const block = grp.length && o0 && o0 !== pl.id && grp.every(x => x.owner === o0) && (diff < 1 || o0 === pl.foe) && o0 !== pl.soft;
        return pl.money - price >= reserve(pl) || ((completes || block) && pl.money - price >= 30);
      };
      // 困难模式：集齐一组的地优先升级，最后两轮不升（回不了本）
      const aiUp = (pl, c, t) => (diff < 1 && round > MAX - 2) ? false
        : pl.money - c >= reserve(pl) * (diff < 1 && t && setOwned(t) ? 0.8 : 1.5);
      const aiRemote = pl => {
        let best = 1, bv = -Infinity;
        for (let v = 1; v <= 6; v++) {
          const t = tiles[(pl.pos + v) % N];
          let sc = 0;
          if (t.price) {
            const o = t.owner && byId(t.owner);
            if (!t.owner) {
              const grp = tiles.filter(x => x.g === t.g && x !== t);
              sc = pl.money - cost(pl, t.price, true) >= 30 ? t.price * (diff < 1 && grp.every(x => x.owner === pl.id) ? 2 : 1) : 0;
            } else if (t.owner === pl.id) sc = t.lv < 3 && pl.money > cost(pl, upCost(t)) ? 60 : 10;
            else if (sameTeam(pl, o)) sc = 5;
            else sc = -rentFor(t, pl);
          } else if (diff < 1) sc = { start: 100, sport: 60, park: 40, chance: 30, shop: pl.money > 400 ? 30 : 0, fate: -20, jail: -30, tax: -80 }[t.k] || 0;
          if (diff < 1 && t.trap && t.trap !== pl.id) sc -= 60;
          if (sc > bv) { bv = sc; best = v; }
        }
        const use = diff < 1 ? bv >= 60 || (danger(pl.pos, pl) >= 100 && bv >= 0) : bv > 0 && Math.random() < 0.7;
        if (use && diff < 1) think(pl, `走 ${best} 步到${tiles[(pl.pos + best) % N].n}最划算`);
        return use ? best : 0;
      };

      // ---- 落地 ----
      const land = async pl => {
        if (stopped || pl.out) return;
        const t = tiles[pl.pos], mine = pl.id === 'user';
        hl = { i: pl.pos, t: performance.now(), c: pl.color };
        if (t.price) {
          if (!t.owner) {
            const price = cost(pl, t.price, true);
            if (pl.money < price) return log(`${pl.name}想买${t.n}，可惜钱不够`, pl);
            const yes = mine ? await ask([{ label: `买下${t.n}（¥${price}${price < t.price ? '，原价 ¥' + t.price : ''}）`, value: true }, { label: '不买', value: false }]) : aiBuy(pl, t, price);
            if (stopped) return;
            if (!yes) return log(`${pl.name}没买${t.n}`, pl);
            pl.money -= price; t.owner = pl.id;
            log(`${pl.name}买下了${t.i}${t.n}`, pl);
            if (setOwned(t)) log(`${pl.name}集齐了一整组，这组过路费翻倍`, pl);
            if (!mine) react(`${pl.name}刚买下了${t.n}${setOwned(t) ? '，还集齐了一整组' : ''}`, pl.id);
          } else if (t.owner === pl.id) {
            if (t.lv >= 3) return log(`${pl.name}在自己的${t.n}转了一圈`, pl);
            const c = cost(pl, upCost(t));
            if (pl.money < c) return log(`${pl.name}想升级${t.n}，钱不够`, pl);
            const yes = mine
              ? await ask([{ label: `升级成${LV[t.lv + 1]}（¥${c}，过路费 ${rent(t)}→${rent({ ...t, lv: t.lv + 1 })}）`, value: true }, { label: '先不升级', value: false }])
             : aiUp(pl, c, t);
            if (stopped || !yes) return;
            pl.money -= c; t.lv++;
            log(`${pl.name}把${t.n}升级成了${LV[t.lv]}`, pl);
            if (!mine && t.lv === 3) react(`${pl.name}把${t.n}升成了宠物乐园，过路费很贵`, pl.id);
          } else {
            const o = byId(t.owner), r = rentFor(t, pl);
  if (sameTeam(pl, o)) return log(`${pl.name}路过队友${o.name}的${t.n}，不用交过路费`, pl);
 // 角色踩到你的地：由你决定收多少
            if (o.id === 'user' && pl.id !== 'user') {
              const half = Math.round(r / 2);
              const a = await ask([
                { label: `收过路费 ¥${r}`, value: 1 },
                { label: `放水，只收一半 ¥${half}`, value: 0.5 },
                { label: '免了，不收', value: 0 },
              ]);
              if (stopped) return;
              if (a < 1) {
                const v = a ? half : 0;
                log(v ? `🤝 ${o.name}对${pl.name}放水，过路费只收 ¥${v}` : `🤝 ${o.name}免了${pl.name}的过路费`, pl);
                if (v) pay(pl, o, v);
                // 被你放水：心软的人更容易被打动，好胜的人不一定领情
                if (pl.bias && Math.random() < 0.3 + pl.heart * 0.05 - pl.comp * 0.02) shift(pl, o, 1, `${o.name}放了自己一马`);
                react(`${o.name}${v ? '只收了一半过路费' : '直接免了过路费'}，对${pl.name}放水`, pl.id);
                return;
              }
            }
            const opts = [];
            if (pl.items.free) opts.push({ label: `🛡️ 用免租卡（还剩 ${pl.items.free} 张）`, value: 'free' });
            if (pl.items.steal && t.lv === 0 && !setOwned(t) && pl.money >= t.price) opts.push({ label: `🃏 用抢地卡，付 ¥${t.price} 给${o.name}，把地买过来`, value: 'steal' });
            let use = null;
            if (opts.length) {
              use = mine ? await ask([...opts, { label: `付过路费 ¥${r}`, value: null }])
                 : aiDefend(pl, t, o, r, opts);
              if (stopped) return;
            }
            if (use === 'free') {
              pl.items.free--;
              log(`${pl.name}用免租卡躲过了${o.name}的 ¥${r}`, pl);
              if (mine || o.id === 'user') react(`${pl.name}用免租卡躲过了${o.name}的过路费`, mine ? o.id : pl.id);
              return;
            }
            if (use === 'steal') {
              pl.items.steal--;
              pay(pl, o, t.price); t.owner = pl.id;
              log(`🃏 ${pl.name}用抢地卡把${o.name}的${t.n}买走了`, pl);
annoy(o, pl, 2);
              react(`${pl.name}用抢地卡抢走了${o.name}的${t.n}`, mine ? o.id : pl.id);
              return;
            }
             // 放水：在意对方、或者对方快没钱了，按性格有几率只收一半。铁面无私的人也偶尔会心软
            const bb = o.bias?.[pl.id] || 0;
            const softChance = o.id === 'user' || !o.bias ? 0
              : (bb > 0 ? bb * 0.15 + o.heart * 0.04 - o.comp * 0.03 : 0) + (pl.money < 200 ? o.heart * 0.04 : 0);
            if (Math.random() < softChance) {
              const half = Math.round(r / 2);
              log(`🤝 ${o.name}对${pl.name}放水，过路费只收一半 ¥${half}`, pl);
              pay(pl, o, half);
              react(`${o.name}对${pl.name}放水，过路费只收了一半`, o.id);
              return;
            }
            log(`${pl.name}踩到${o.name}的${t.n}，付过路费 ¥${r}`, pl);
            pay(pl, o, r);
            annoy(pl, o, r >= 150 ? 1 : r >= 60 ? 0.4 : 0);
            if (mine || o.id === 'user') react(`${pl.name}踩到${o.name}的${t.n}，付了 ¥${r} 过路费`, mine ? o.id : pl.id);
          }
          return;
        }
        if (t.k === 'start') { pl.money += 100; log(`${pl.name}正好停在起点，额外奖励 ¥100`, pl); }
        else if (t.k === 'tax') fine(pl, t.v, `${pl.name}交了宠物税 ¥${t.v}`);
        else if (t.k === 'jail') fine(pl, 30, `${pl.name}带宠物去体检，花了 ¥30`);
        else if (t.k === 'sport') {
          await W8(500);
          const d = 1 + R(6); dice = [d]; draw();
          pl.money += d * 30;
          log(`${pl.name}的宠物在运动会上掷出 ${d}，拿到奖金 ¥${d * 30}`, pl);
        } else if (t.k === 'park') {
                   const a = mine ? await ask([{ label: '捡 ¥50', value: 'money' }, { label: '随机拿一个道具', value: 'item' }])
            : aiPark(pl);
          if (stopped) return;
          if (a === 'money') { pl.money += 50; log(`${pl.name}在公园捡到 ¥50`, pl); }
          else { const k = pick(Object.keys(ITEMS)); pl.items[k]++; log(`${pl.name}在公园捡到一个${ITEMS[k].i}${ITEMS[k].n}`, pl); }
        } else if (t.k === 'bus') {
          if (evOn('storm')) return log(`台风天公交停运，${pl.name}只能干等`, pl);
          const to = pl.pos === 11 ? 21 : 11;
           const yes = mine ? await ask([{ label: '花 ¥30 坐车去另一个公交站', value: true }, { label: '不坐', value: false }]) : aiBus(pl, to);
          if (stopped || !yes || pl.money < 30) return;
          pay(pl, null, 30);
          if (to < pl.pos) { pl.money += 200; log(`${pl.name}坐车路过起点，领了 ¥200`, pl); }
          pl.pos = to;
          log(`${pl.name}坐公交到了另一边`, pl);
        } else if (t.k === 'lottery') {
          if (pl.money < 20) return log(`${pl.name}连彩票都买不起`, pl);
          const yes = mine ? await ask([{ label: '花 ¥20 买一张彩票', value: true }, { label: '不买', value: false }]) : aiLottery(pl);
          if (stopped || !yes) return;
          pay(pl, null, 20);
          const r = Math.random(), win = r < 0.05 ? 500 : r < 0.2 ? 150 : r < 0.55 ? 50 : 0;
          pl.money += win;
          log(win ? `🎰 ${pl.name}刮中了 ¥${win}${win >= 500 ? '，头奖！' : ''}` : `${pl.name}的彩票什么都没中`, pl);
          if (win >= 150) react(`${pl.name}买彩票中了 ¥${win}`, mine ? null : pl.id);
        } else if (t.k === 'portal') {
          if (evOn('storm')) return log('台风天，传送门失灵了', pl);
          const idx = pick(tiles.map((x, i) => (x.price ? i : -1)).filter(i => i >= 0));
          await W8(500);
          pl.pos = idx;
          log(`🌀 ${pl.name}被传送到了${tiles[idx].n}`, pl);
          await W8(500);
          await land(pl);
        } else if (t.k === 'shop') {
          const can = Object.entries(ITEMS).filter(([, v]) => pl.money >= v.price);
          if (!can.length) return log(`${pl.name}逛了逛道具店，什么都买不起`, pl);
          const k = mine
            ? await ask([...can.map(([k, v]) => ({ label: `买${v.i}${v.n}（¥${v.price}）`, value: k })), { label: '不买', value: null }])
                      : await aiShop(pl, can);
          if (stopped) return;
          if (!k) return log(`${pl.name}在道具店逛了一圈，没买`, pl);
          pl.money -= ITEMS[k].price; pl.items[k]++;
          log(`${pl.name}买了一个${ITEMS[k].i}${ITEMS[k].n}`, pl);
        } else if (t.k === 'chance' || t.k === 'fate') {
          let kind = t.k;
          if (kind === 'fate' && has(pl, 'lucky') && Math.random() < 0.5) { kind = 'chance'; log(`🍀 ${pl.name}运气好，改抽了一张机会`, pl); await W8(600); }
          const [text, fn] = pick(kind === 'chance' ? CHANCE : FATE);
          log(`${pl.name}抽到${kind === 'chance' ? '机会' : '命运'}：${text}`, pl);
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
           } else if (aiBail(pl)) { pay(pl, null, 50); pl.skip = 0; log(`${pl.name}花 ¥50 让宠物提前出院`, pl); }
          if (pl.skip) { pl.skip--; log(`${pl.name}的宠物还在住院，这轮休息`, pl); await W8(1000); return; }
        }
        if (pl.nap) { pl.nap = 0; log(`💤 ${pl.name}的宠物被催眠了，这一轮睡过去了`, pl); await W8(1000); return; }
        let two = false, fixed = 0;
        if (pl.id === 'user') {
          let played = false;
          for (;;) {
            const opts = [{ label: '🎲 掷骰子', value: 'roll' }];
            if (pl.items.double) opts.push({ label: `🎲🎲 双骰卡（${pl.items.double}）`, value: 'double' });
            if (pl.items.remote) opts.push({ label: `🎮 遥控骰子（${pl.items.remote}）`, value: 'remote' });
            const cards = played ? [] : Object.keys(ITEMS).filter(k => ITEMS[k].card && pl.items[k]);
            if (cards.length) opts.push({ label: '🎴 出牌（每回合一张）', value: 'card' });
            const a = await ask(opts);
            if (stopped) return;
            if (a === 'card') {
              const k = await ask([...cards.map(k => ({ label: `${ITEMS[k].i}${ITEMS[k].n}×${pl.items[k]}：${ITEMS[k].d}`, value: k })), { label: '算了', value: null }]);
              if (stopped) return;
              if (!k) continue;
              let tg = null;
              if (ITEMS[k].card === 'target') {
                const fs = foes(pl);
                if (!fs.length) { toast('没有可以出牌的对手'); continue; }
                const id = await ask([...fs.map(o => ({ label: `${players.indexOf(o) + 1}号${o.name}（¥${o.money}${o.items.guard ? '，有护盾' : ''}）`, value: o.id })), { label: '算了', value: null }]);
                if (stopped) return;
                if (!id) continue;
                tg = byId(id);
              }
              if (ITEMS[k].card === 'trap' && (tiles[pl.pos].trap || pl.pos === 0)) { toast('这一格不能扔'); continue; }
              playCard(pl, k, tg);
              played = true;
              continue;
            }
            if (a === 'double') { pl.items.double--; two = true; }
            if (a === 'remote') {
              fixed = await ask([1, 2, 3, 4, 5, 6].map(v => ({ label: `走 ${v} 步 → ${tiles[(pl.pos + v) % N].n}`, value: v })));
              pl.items.remote--;
            }
            break;
          }
        } else {
          actBox(`<p class="mono-wait">${esc(pl.name)}在想……</p>`);
          await W8(800);
          const c = aiCard(pl);
          if (c) { think(pl, cardWhy(pl, c)); await W8(500); playCard(pl, c.k, c.tg); await W8(700); }
          if (pl.items.remote) { const v = aiRemote(pl); if (v) { pl.items.remote--; fixed = v; } }
          if (!fixed && pl.items.double && aiDouble(pl)) { pl.items.double--; two = true; }
        }
        if (stopped || pl.out) return;
        let n;
        if (fixed) { dice = [fixed]; n = fixed; log(`${pl.name}用了遥控骰子，走 ${n} 步`, pl); }
        else {
          n = await rollDice(pl, two);
          // 重掷：先看看要落到哪、要交多少过路费
          const dest = () => tiles[(pl.pos + n) % N];
          const rentAhead = () => { const t = dest(); return t.price && t.owner && t.owner !== pl.id && !sameTeam(pl, byId(t.owner)) ? rentFor(t, pl) : 0; };
          if (pl.money >= REROLL + 50 && !stopped) {
            const again = pl.id === 'user'
              ? await ask([{ label: `就走 ${n} 步 → ${dest().n}${rentAhead() ? `（过路费 ¥${rentAhead()}）` : ''}`, value: false }, { label: `花 ¥${REROLL} 重掷一次`, value: true }])
             : rentAhead() >= (diff < 1 ? 50 : diff > 1 ? 150 : 100) && pl.money > (diff < 1 ? 150 : 300);
            if (stopped) return;
            if (again) { pay(pl, null, REROLL); log(`${pl.name}花 ¥${REROLL} 重掷了一次`, pl); await W8(400); n = await rollDice(pl, two); }
          }
        }
        if (pl.snail) { pl.snail = 0; if (n > 3) { n = 3; log(`🐌 ${pl.name}中了蜗牛卡，只能走 3 步`, pl); } }
        await W8(600);
        await walk(pl, n);
        if (stopped) return;
        await land(pl);
        if (pl.id !== 'user') actBox('');
        await W8(pl.id === 'user' ? 400 : 800);
      };

      const finishGame = async () => {
        clearInterval(animT);
        const rank = [...players].sort((a, b) => worth(b) - worth(a));
        let title, listHtml, summary, place;
        if (teams) {
          const tr = [...teams].sort((a, b) => teamWorth(b) - teamWorth(a)), win = tr[0];
          const names = t => t.ids.map(id => byId(id).name).join('、');
          place = tr.indexOf(teamOf(players[0])) + 1;
          title = `${win.i}${win.n}赢了`;
          summary = `组队赛，${win.n}（${names(win)}）赢了。` + tr.map((t, i) => `第${i + 1}名${t.n}（${names(t)}，人均¥${teamWorth(t)}）`).join('，') + `。个人资产最高的是${rank[0].name}`;
          listHtml = tr.map(t => `<li>${t.i}${esc(t.n)}（${esc(names(t))}）：人均 ¥${teamWorth(t)}</li>`).join('');
        } else {
          const win = rank[0];
          place = rank.indexOf(players[0]) + 1;
          title = `${win.name}赢了`;
          summary = `${win.name}赢了。` + rank.map((x, i) => `第${i + 1}名${x.name}（${x.out ? '破产' : '总资产¥' + worth(x)}）`).join('，');
          listHtml = rank.map(x => `<li>${esc(x.name)}：${x.out ? '破产' : '¥' + worth(x)}</li>`).join('');
        }
        log(`🏆 ${title}`);
        const t = $u('#mono-turn'); if (t) t.textContent = '游戏结束';
        const box = $u('#mono-act');
        if (box) {
          box.onclick = null;
          box.innerHTML = `<div class="mono-result"><b>🏆 ${esc(title)}</b><ol>${listHtml}</ol></div>
            <button class="btn" data-again>再来一局</button><button class="btn ghost" data-pa="back">返回</button>`;
          $('[data-again]', box).onclick = () => Pet.renderGame('monopoly');
        }
        done(place === 1 ? 20 : Math.max(2, 12 - place * 3));
        const chars = players.slice(1).map(x => charById(x.id)).filter(Boolean);
        // 把这局谁让着谁、谁跟谁较劲写进去，记忆系统总结私聊时会记下来，下次聊天角色就记得
        const feud = players.slice(1).filter(x => x.bias).map(x => [
          x.soft && `${x.name}这局一直让着${byId(x.soft)?.name}`,
          x.foe && `${x.name}这局跟${byId(x.foe)?.name}较上劲了`,
        ]).flat().filter(Boolean).join('，');
        for (const c of chars) await addMsg(Conv.dm(pid, c.id), 'user', `${me.name} 和 ${chars.map(x => x.name).join('、')} 一起玩了一局宠物大富翁。${summary}${feud ? '。' + feud : ''}`, 'sys');
        for (let i = 0; i < 40 && talking; i++) await wait(250);
        if (!stopped) talk(`游戏结束了。${summary}说说赛后感想`);
      };

      const loop = async () => {
        while (!stopped) {
          const pl = players[cur];
          if (!pl.out) await turn(pl);
          if (stopped) return;
         if (teams ? aliveTeams().length <= 1 : (players.filter(x => !x.out).length <= 1 || players[0].out)) break;
          cur = (cur + 1) % players.length;
          if (cur === 0) {
            if (++round > MAX) break;
cool();
            log(`—— 第 ${round} 轮 ——`);
            if (round % 3 === 0) {
              const e = pick(EVENTS);
              ev = { ...e, r: round };
              log(`📣 全场事件：${e.i}${e.n}，${e.d}`);
              if (e.k === 'rain') players.filter(x => !x.out).forEach(x => { x.money += 50; });
              react(`全场事件：${e.n}（${e.d}）`);
            } else if (round % 6 === 1) react(`已经第 ${round} 轮了，现在的局势：${standing(6)}`);
          }
        }
        if (!stopped) finishGame();
      };

      // 天赋：跑得快的动物固定是飞毛腿，其他随机
      const talentFor = pet => (TRAITS[pet.sp]?.speed >= 1.3 ? TALENTS.find(t => t.k === 'swift') : pick(TALENTS.filter(t => t.k !== 'swift')));
      // 某人能当棋子的宠物：我的 / 某个角色参与养的
      const myPets = () => Pet.list.filter(x => Pet.isMine(x) && Pet.visible(x));
      const petsOf = cid => Pet.list.filter(x => x.owners.includes(cid) && Pet.visible(x));
      const petName = x => `${x.name}（${SPECIES[x.sp].name}）`;
        const begin = async (chars, money, myPet = p, picks = {}, teamList = null) => {
        const sps = Object.keys(SPECIES), items = () => Object.fromEntries(Object.keys(ITEMS).map(k => [k, 0]));
               players = [
          { id: 'user', name: me.name, pet: myPet, money, pos: 0, out: false, skip: 0, color: colorOf(0), items: items(), talent: talentFor(myPet) },
          ...chars.map((c, i) => {
            // 你选了的那只不给角色用，免得棋盘上出现两只一样的
            const own = petsOf(c.id).filter(x => x !== myPet);
            let pet = own.find(x => x.id === picks[c.id]) || (own.length ? pick(own) : null);
            if (!pet) { const sp = pick(sps); pet = { sp, color: R(SPECIES[sp].colors.length) }; }
            return { id: c.id, name: c.name, pet, money, pos: 0, out: false, skip: 0, color: colorOf(i + 1), greed: 0.3 + Math.random() * 0.6, items: items(), talent: talentFor(pet),
            grudge: {}, bias: {}, why: {}, comp: 5, heart: 5, foe: null, soft: null, mood: '' };
          }),
        ];
teams = teamList;
 players.forEach(x => giveCard(x)); // 开局每人发一张卡
        if (teams) {
          const big = Math.max(...teams.map(t => t.ids.length));
          for (const t of teams) {
            const b = bonusOf(money, big, t.ids.length);
            if (b) t.ids.forEach(id => { byId(id).money += b; });
          }
        }
        ui.innerHTML = `<div class="mono-bar"><span id="mono-turn"></span>
            <select id="mono-spd" aria-label="速度"><option value="slow">慢</option><option value="mid">中</option><option value="fast">快</option></select></div>
           <div class="pet-acts" id="mono-act" style="min-height:44px"></div>
            <h3>动态</h3><div class="mono-log" id="mono-log" style="max-height:160px;overflow-y:auto"></div>
           <h3>聊天</h3><div class="mono-msgs" id="mono-msgs" style="max-height:200px;overflow-y:auto"><p class="mono-wait">可以和大家说点什么</p></div>
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
        log(`游戏开始，${players.length} 个人，每人 ¥${money}`);
        log('宠物天赋：' + players.map(x => `${x.name}${x.talent.i}${x.talent.n}`).join('，'));
         if (teams) log('组队：' + teamText());
 // 读一次最近的聊天，定下赛前心态。整局只调这一次
        if (S.settings.claude.key) {
          log('大家在琢磨这局怎么玩……');
          try {
            talkCtx = (await recentTalk(chars)).slice(-3000);
 // 每个角色召回和这局玩家有关的记忆。大家用同一句查询，向量接口只请求一次
            const q = `${me.name}和${chars.map(c => c.name).join('、')}一起玩游戏\n${talkCtx.slice(-500)}`;
            for (const c of chars) {
              const t = await Memory.retrieveText(c.id, pid, q, c.name);
              if (t) memCtx[c.id] = t.slice(0, 1500);
            }
            await aiStance(chars);
          } catch (e) { Log.add('大富翁赛前心态生成失败', e.message); }
          if (stopped) return;
          if (stanceText()) log('赛前心态：' + stanceText());
        }
        talk(teams ? `游戏刚开始，是组队赛：${teamText()}。队友互相打气，对手之间放放狠话` : '游戏刚开始，大家打个招呼、放放狠话');
        loop();
      };

            // ---- 开局设置：人数不限 ----
      const cands = S.chars.filter(c => knows(pid, c.id) && !getRel(pid, c.id).theyBlock);
      draw();
      if (!cands.length) {
        ui.innerHTML = '<p class="empty">还没有认识的角色，先去关系网里设置一下吧。</p>';
        return { stop() { stopped = true; clearInterval(animT); } };
      }
      const mine = myPets();
      // 角色后面的棋子选择：一只就直接显示名字，多只给下拉框
      const charSel = c => {
        const own = petsOf(c.id);
        if (own.length <= 1) return `<small>${own.length ? esc(petName(own[0])) : '临时借一只'}</small>`;
        return `<select data-mp="${c.id}" style="width:auto;max-width:45%" aria-label="${esc(c.name)}的棋子">
          <option value="">随机</option>${own.map(x => `<option value="${x.id}">${esc(petName(x))}</option>`).join('')}</select>`;
      };
      ui.innerHTML = `${mine.length > 1 ? `<label class="field"><span>我的棋子</span><select id="mono-me">${mine.map(x =>
          `<option value="${x.id}" ${x === p ? 'selected' : ''}>${esc(petName(x))}</option>`).join('')}</select></label>` : ''}
        <h3>和谁一起玩</h3>
        <div class="flex" style="margin-bottom:6px"><button class="btn ghost sm" data-all>全选 / 全不选</button><small id="mono-cnt">已选 0 人</small></div>
        <div class="card mono-pick">${cands.map(c => `<div class="row" style="cursor:default">
          <label class="flex" style="flex:1;margin:0;cursor:pointer"><input type="checkbox" data-mc="${c.id}"><span>${esc(c.name)}</span></label>
          ${charSel(c)}</div>`).join('')}</div>
        <div class="flex" style="gap:8px">
          <label class="field" style="flex:1"><span>轮数</span><select id="mono-r"><option>15</option><option selected>20</option><option>30</option><option>40</option></select></label>
          <label class="field" style="flex:1"><span>起始资金</span><select id="mono-m"><option>1000</option><option selected>1500</option><option>2000</option></select></label>
          <label class="field" style="flex:1"><span>速度</span><select id="mono-s"><option value="slow">慢</option><option value="mid">中</option><option value="fast">快</option></select></label>
          <label class="field" style="flex:1"><span>难度</span><select id="mono-d"><option value="1.5">简单</option><option value="1" selected>普通</option><option value="0.35">困难</option></select></label>
        </div>
  <div class="flex" style="gap:8px">
          <label class="field" style="flex:1"><span>玩法</span><select id="mono-mode"><option value="solo">个人赛</option><option value="team">组队赛</option></select></label>
          <label class="field" style="flex:1"><span>分几队</span><select id="mono-tn">${[2, 3, 4, 5, 6, 7, 8].map(n => `<option>${n}</option>`).join('')}</select></label>
          <label class="field" style="flex:1"><span>怎么分</span><select id="mono-how"><option value="random">随机分</option><option value="ai">角色自己选</option></select></label>
        </div>
        <p class="hint">「分几队」和「怎么分」只在组队赛里生效。</p>
        <p class="hint">人越多一轮越久，建议人多时选「快」。</p>
        <button class="btn" data-start style="margin-top:8px">开始</button>`;
      $u('#mono-s').value = p.games.monoSpd || 'slow';
      const boxes = () => $$('[data-mc]', ui);
      const count = () => { $u('#mono-cnt').textContent = `已选 ${boxes().filter(x => x.checked).length} 人`; };
      boxes().forEach(b => { b.onchange = count; });
      $('[data-all]', ui).onclick = () => { const on = !boxes().every(x => x.checked); boxes().forEach(x => { x.checked = on; }); count(); };
       $('[data-start]', ui).onclick = async () => {
        const ids = boxes().filter(x => x.checked).map(x => x.dataset.mc);
        if (!ids.length) return toast('至少选一个角色');
        MAX = Number($u('#mono-r').value);
        diff = Number($u('#mono-d').value);
        p.games.monoSpd = $u('#mono-s').value;
        spd = SPD[p.games.monoSpd];
        const myPet = Pet.get($u('#mono-me')?.value) || p;
        const picks = Object.fromEntries($$('[data-mp]', ui).map(s => [s.dataset.mp, s.value]));
        const chars = ids.map(charById).filter(Boolean), money = Number($u('#mono-m').value);
        if ($u('#mono-mode').value !== 'team') return begin(chars, money, myPet, picks);
        // 组队赛：队数不能超过总人数
        const tn = Math.min(Number($u('#mono-tn').value), chars.length + 1), how = $u('#mono-how').value;
        const nm = id => (id === 'user' ? me.name : charById(id)?.name || '?');
        const preview = async () => {
          ui.innerHTML = '<p class="mono-wait">正在分队……</p>';
          let list = null;
          if (how === 'ai' && S.settings.claude.key) {
            try { list = await aiTeams(chars, tn); } catch (e) { Log.add('大富翁分队失败', e.message); }
            if (!list) toast('没分好，改成随机分');
          }
          if (stopped) return;
          list ||= randomTeams(chars, tn);
          const big = Math.max(...list.map(t => t.ids.length));
          ui.innerHTML = `<h3>分队结果</h3><div class="card">${list.map(t => `<div class="row" style="cursor:default">
              <span>${t.i} ${esc(t.n)}</span><small>${esc(t.ids.map(nm).join('、'))}${t.ids.length < big ? ` · 人少，每人多发 ¥${bonusOf(money, big, t.ids.length)}` : ''}</small></div>`).join('')}</div>
            ${list.why ? `<p class="hint">💬 ${esc(list.why)}</p>` : ''}
            <p class="hint">队友之间不收过路费，按全队「人均资产」排名。</p>
            <div class="pet-acts"><button class="btn" data-go>开始</button><button class="btn ghost" data-re>重新分</button><button class="btn ghost" data-pa="back">返回</button></div>`;
          $('[data-go]', ui).onclick = () => begin(chars, money, myPet, picks, list);
          $('[data-re]', ui).onclick = preview;
        };
        preview();
      };
      return { stop() { stopped = true; clearInterval(animT); } };
    },
  },
};
