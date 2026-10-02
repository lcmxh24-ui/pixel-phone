// 所在地 / 时差 / 多地天气 + 语言与翻译规则
const Geo = {
  // 某时区相对 UTC 的分钟数
  offset(tz, ts = Date.now()) {
    try {
      const d = new Date(ts);
      const local = new Date(d.toLocaleString('en-US', { timeZone: tz }));
      const utc = new Date(d.toLocaleString('en-US', { timeZone: 'UTC' }));
      return Math.round((local - utc) / 60e3);
    } catch { return 0; }
  },
  deviceTz: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
  userLoc() {
    const w = S.settings.weather;
    return { city: w.city || '本地', lat: w.lat, lon: w.lon, tz: w.tz || this.deviceTz() };
  },
  hasLoc: c => c && c.lat != null && c.tz,

  diffText(mins, otherName) {
    if (!mins) return '';
    const h = Math.abs(mins) / 60, n = Number.isInteger(h) ? h : h.toFixed(1);
    return `（比${otherName}那边${mins > 0 ? '快' : '慢'}${n}小时）`;
  },

  // 给提示词的所在地说明。没有人设置所在地时返回空，整个条目会被跳过
  async placeText(chars, pid, ts = Date.now()) {
    const withLoc = chars.filter(c => this.hasLoc(c));
    if (!withLoc.length) return '';
    const u = this.userLoc(), pname = persona(pid).name;
    const lines = [`${pname}在${u.city}，当地时间${nowText(ts, u.tz)}`];
    for (const c of withLoc) {
      let wx = '';
      try { const d = await Weather.forLoc(c); if (d) wx = '，' + Weather.brief(d); } catch { /* 天气拿不到就不写 */ }
      const diff = this.offset(c.tz, ts) - this.offset(u.tz, ts);
      lines.push(`${c.name}在${c.city}，当地时间${nowText(ts, c.tz)}${wx}${this.diffText(diff, pname)}`);
    }
    const others = chars.filter(c => !this.hasLoc(c)).map(c => c.name);
    if (others.length) lines.push(`${others.join('、')}和${pname}在同一个地方。`);
        lines.push('以上是背景信息，只用来让作息、问候和状态符合当地时间。不要主动报时间、报天气、提时差，除非对方问起、话题刚好聊到，或者情况特殊（比如对方那边已经是凌晨、当地下暴雨影响出门）。真人不会每次聊天都说"我这边现在几点"。');
    return lines.join('\n');
  },
};

const Lang = {
  of: x => String(x?.lang || '').trim() || '中文',
  set(x) {
    const s = new Set([this.of(x)]);
    String(x?.langs || '').split(/[,，、\s]+/).map(t => t.trim()).filter(Boolean).forEach(t => s.add(t));
    return s;
  },
  knows(x, lang) { return this.set(x).has(lang); },
  viewer: pid => Lang.of(persona(pid)),

  // 拆分 "原文 [译]翻译"
  split(text) {
    const s = String(text ?? ''), i = s.indexOf('[译]');
    if (i < 0) return { content: s, trans: '' };
    return { content: s.slice(0, i).trim() || s.slice(i + 3).trim(), trans: s.slice(i + 3).trim() };
  },

  // 给 AI 看的消息内容，带上译文，让它保持格式
  body(m, pid) {
    const b = Media.body(m, pid);
    return m.trans ? `${b} [译]${m.trans}` : b;
  },

  transFmt: v => `每条消息后面加上${v}翻译，格式：原文 [译]翻译。原文就是${v}的消息不用加。`,

  // 单聊
  dmRule(ch, p) {
    const L = this.of(ch), U = this.of(p);
    const sameBase = L === U;
    const r = [];
    const wantUser = ch.chatLang === 'user';
    const canUser = this.knows(ch, U) || ch.translator;
    if (sameBase && !String(ch.langs || '').trim()) return '';
    r.push('【语言】');
    if (sameBase || (wantUser && canUser)) {
      r.push(`{{角色}}用${U}和{{用户}}聊天。`);
      if (!sameBase && !this.knows(ch, U)) r.push(`{{角色}}其实不会${U}，是用翻译软件打字的，偶尔有一点机翻腔或用词不太对，但不要刻意，大多数句子是通顺的。`);
    } else {
      r.push(`{{角色}}的母语是${L}，默认用${L}发消息，可以偶尔夹杂几个${U}词。`);
      r.push(this.transFmt(U));
    }
    if (!this.knows(ch, U)) {
      r.push(ch.translator
        ? `{{角色}}看不懂${U}，是靠翻译软件看{{用户}}的消息的，极少数时候会理解偏。`
        : `{{角色}}看不懂${U}，偶尔会理解错，看不懂时才会让{{用户}}换个说法。`);
    }
    r.push(`会说的语言：{{角色}} ${[...this.set(ch)].join('、')}；{{用户}} ${[...this.set(p)].join('、')}。`);
    r.push('语言和翻译只体现在说话方式上，不要主动提"我在用翻译""我的中文不好"这类话，除非真的出现误会或对方问起。');
    return r.join('\n');
  },

  // 角色间私聊：先找共同语言
  ccRule(a, b, pid) {
    const v = this.viewer(pid);
    const la = this.of(a), lb = this.of(b);
    const common = [...this.set(a)].filter(x => this.set(b).has(x));
    let use = la === lb ? la : common.includes(la) ? la : common.includes(lb) ? lb : common[0];
    const r = [`【语言】${a.name}会${[...this.set(a)].join('、')}；${b.name}会${[...this.set(b)].join('、')}。`];
    if (use) {
      r.push(`两人用${use}聊天${la !== lb ? '，偶尔夹杂各自母语的词' : ''}。`);
      if (use !== v) r.push(this.transFmt(v) + '（翻译是给旁观者看的，不是他们发的）');
      else if (la === lb && la === v) return '';
      return r.join('\n');
    }
    const ts = [a, b].filter(c => c.translator).map(c => c.name);
    r.push(ts.length
      ? `两人没有共同语言，各自用母语发消息，${ts.join('和')}用翻译软件看对方的话、偶尔用翻译软件回复，会有误解和机翻腔。`
      : '两人没有共同语言，只能用很简单的英语和表情交流，经常鸡同鸭讲。');
    r.push(this.transFmt(v) + '（翻译是给旁观者看的）');
    r.push('语言和翻译只体现在说话方式上，不要主动提"我在用翻译""我的中文不好"这类话，除非真的出现误会或对方问起。');
    return r.join('\n');
  },

  // 群聊 / 共读
  groupRule(members, p) {
    const v = this.of(p);
    if (members.every(c => this.of(c) === v && !String(c.langs || '').trim())) return '';
    return `- 语言：${members.map(c => `${c.name}母语${this.of(c)}${String(c.langs || '').trim() ? '，也会' + c.langs : ''}${c.translator ? '，会用翻译软件' : ''}`).join('；')}。${p.name}说${v}。
  每个人按自己的习惯和能力选择语言，照顾到群里的人时可以改用大家都懂的语言。不是${v}的消息后面加 [译]${v}翻译。`;
  },
};
