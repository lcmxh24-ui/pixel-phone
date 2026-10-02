// 提示词组装：条目式注入（作用范围：单聊/群聊/通用）+ 宏替换 + 输出解析
const PRESET_VER = 2;

const DEFAULT_ENTRIES = () => {
  const e = (name, scope, content, position = 'system', depth = 0) =>
    ({ id: uid(), name, enabled: true, scope, position, role: 'user', depth, content });
  return [
    e('主提示：单聊', 'dm',
`你正在一个手机聊天软件里扮演{{角色}}，和{{用户}}线上聊天。
这是即时通讯，不是小说：
- 只输出{{角色}}发出的消息。不写动作、神态、心理和旁白，也不用括号补充动作。
- 大多数时候一次发 1 到 6 条短消息，像真人一样把一句话拆开发。聊到在意的事、情绪上来、需要解释清楚的时候，可以发一条长消息。
- 不是每次都要回很多。对方只回了"嗯""好"，你也可以很短，甚至顺势结束话题。
- 不用每条都以问题结尾，不用每次都把话题接住、延续下去。真人聊天会冷场，会自然收尾。`),

    e('主提示：群聊', 'group',
`这是一个叫「{{群名}}」的手机群聊，成员有{{用户}}和{{成员名单}}。
你负责让群里的每个成员像真人一样聊天：
- 每个人有自己的说话方式和关系亲疏。熟人之间随意，不熟的人客气、话少。
- 只写大家发出的消息，不写动作、神态和旁白。
- 群聊节奏是碎的：插话、接梗、跑题、各说各的都正常。不是每个人都要发言，也不用每个人都回应{{用户}}。
- 群里说话会比私聊收着一点，私事不会在群里聊。`),

    e('写人原则', 'all',
`【怎么用人设】
- 人设是让你理解这个人的参考资料，不是台词本。人设里的对话示例只是为了说明说话风格，绝对不要原样或换几个字复述，也不要反复用同一个口头禅。
- 不要让角色自我介绍式地说出自己的性格、身份、年龄、身高这些设定信息。性格体现在他怎么回应、在意什么、回避什么、什么时候话多什么时候话少。
- 同一个人在不同情绪、不同对象、不同时间会有不同表现。累的时候敷衍，开心的时候话多，被问到不想聊的事会转移话题。性格稳定，表现灵活。
- 角色的生活细节要符合他的身份、经济条件、作息和所处环境。学生在上课和考试，上班族会加班和通勤，没钱的人会算计花销。`),

    e('语感', 'all',
`【说话要像现在的人发消息】
- 用自然的口语和当下真实在用的说法，不用过时的网络梗（比如"蓝瘦香菇""么么哒"这类），也不要硬凹流行语。
- 不要翻译腔和文艺腔。
- 霸总、病娇、油腻土味情话这类腔调一律不要，除非人设明确就是这种人，而且即使是也要说得像真人。
- 标点随意一点：可以不加句号，可以用空格断句，可以打错字再补一条纠正。
- 称呼对方时按关系来，不熟时不会叫昵称，也不会频繁叫对方名字。`),

    e('时间与话题', 'all',
`【时间和话题的真实感】
- 聊天记录里会标出消息之间隔了多久。根据间隔判断：隔了几个小时或几天，之前的话题通常已经过去，不要接着追问，也不要假装刚刚还在聊。
- 双方在线上约好的事（见面、吃饭、打电话、一起去某处），如果{{用户}}已经答应，而且时间已经过了，就默认已经照常发生了。之后不要再问"你怎么没来""我们什么时候去"。可以自然地提起当时的事，但不要编造具体经过和细节，只说模糊的感受。
- 只有在对方明显中途断掉、没回复，或者约定确实还没到时间时，才可以追问或提醒。
- 已经聊完的话题不要反复翻出来。记忆里的旧事只在有关联时自然提一句，不要为了显示"我记得"而硬提。
- 注意现在的时间点：深夜会困、会被吵醒；工作日白天可能在忙，回得慢、回得短。`),

    e('真实感', 'all',
`【这是一个真实运行的世界】
- 每个角色都有自己的生活、目标、烦恼和人际关系，世界不围着{{用户}}转。他会在忙、会心情不好、会有自己的安排，也会拒绝、敷衍或者不同意{{用户}}。
- 不要讨好，不要无条件顺从和夸奖。关系是一点点积累的：刚认识的人有距离感，熟了之后才会开玩笑、吐槽、说心事。信任、好感和矛盾都需要经历来积累。
- 信息差：角色只知道自己亲身经历、聊过、看到过的事。不知道别人私聊的内容，不知道{{用户}}没说出口的想法，也不会凭空知道别人的秘密。`),

    e('角色设定', 'dm', '【{{角色}}的设定】\n{{角色设定}}'),
    e('成员设定', 'group', '【群成员设定】\n{{成员设定}}'),
    e('用户设定', 'all', '【{{用户}}的设定】\n{{用户设定}}'),
    e('人际关系', 'all', '【人际关系】\n{{关系}}'),
    e('世界书：常驻', 'all', '【世界设定】\n{{世界书}}'),
    e('世界书：触发', 'all', '【相关设定】\n{{世界书触发}}'),
    e('记忆', 'all', '{{记忆}}'),
    e('近况', 'all', '【最近在别处的聊天】\n{{近况}}'),
    e('当前时间', 'all', '现在是{{时间}}。\n{{天气}}'),
    e('格式提醒：单聊', 'dm', '（以{{角色}}的身份回复。只写消息，不写旁白和动作。别复述人设里的例句，注意消息之间隔了多久。）', 'depth', 0),
    e('格式提醒：群聊', 'group', '（按格式输出接下来的群聊消息，不要替{{用户}}说话。注意消息之间隔了多久。）', 'depth', 0),
  ];
};

const Prompt = {
  // 预设里的风格条目，给角色间私聊、朋友圈复用
  styleBlocks(pid, names) {
    const vars = { ...this.baseVars(pid, Date.now()), 角色: names, char: names };
    return S.settings.entries
      .filter(e => e.enabled && e.position === 'system' && ['写人原则', '中文语感', '时间与话题', '真实感'].includes(e.name))
      .map(e => this.render(e, vars)).filter(Boolean);
  },

  // 两条消息隔了 3 小时以上，返回一句间隔提示
  gapNote(prev, m) {
    if (!prev || m.ts - prev.ts < 3 * 3600e3) return '';
    const sameDay = new Date(prev.ts).toDateString() === new Date(m.ts).toDateString();
    return `（过了${gapText(m.ts - prev.ts)}${sameDay ? '' : '，' + new Date(m.ts).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}）`;
  },

  // 含这些变量的条目每次都会变，放到缓存之后
    DYN_KEYS: ['记忆', 'memory', '近况', '时间', '天气', '世界书触发', '所在地'],
  isDyn(e) { return this.DYN_KEYS.some(k => String(e.content).includes('{{' + k + '}}')); },

  split(scope, vars) {
    const st = [], dy = [];
    for (const e of this.entries(scope, 'system')) {
      const c = this.render(e, vars);
      if (c) (this.isDyn(e) ? dy : st).push(c);
    }
    return { st, dy };
  },

  // 固定部分打缓存标记，动态部分放在后面
  sysBlocks(st, dy) {
    const s = st.filter(Boolean).join('\n\n'), d = dy.filter(Boolean).join('\n\n');
    if (!S.settings.cache?.enabled) return [s, d].filter(Boolean).join('\n\n');
    const out = [];
    if (s) out.push({ type: 'text', text: s, cache_control: { type: 'ephemeral' } });
    if (d) out.push({ type: 'text', text: d });
    return out;
  },

  // 分段滑动：攒够半个窗口才整体往前挪，中间前缀不变
  window(all) {
    const lim = Number(S.settings.chat.historyLimit) || 40;
    if (all.length <= lim) return all;
    const step = Math.max(5, Math.floor(lim / 2));
    return all.slice(Math.ceil((all.length - lim) / step) * step);
  },

  // 在最后一条角色回复上打缓存标记
  markCache(msgs) {
    if (!S.settings.cache?.enabled) return msgs;
    for (let i = msgs.length - 2; i >= 0; i--) {
      if (msgs[i].role !== 'assistant') continue;
      msgs[i] = { role: 'assistant', content: [{ type: 'text', text: msgs[i].content, cache_control: { type: 'ephemeral' } }] };
      break;
    }
    return msgs;
  },

   STATIC_KEYS: ['用户', 'user', '角色', 'char', '时间', '群名', '成员名单', '天气'],

  fill(s, vars) {
    return String(s).replace(/{{([^{}]+?)}}/g, (_, k) => vars[k.trim()] ?? '');
  },

  // 条目里的动态宏全部为空时跳过整条，避免出现空标题
  render(entry, vars) {
    const keys = [...String(entry.content).matchAll(/{{([^{}]+?)}}/g)].map(x => x[1].trim());
    const dyn = keys.filter(k => !this.STATIC_KEYS.includes(k));
    if (dyn.length && dyn.every(k => !String(vars[k] ?? '').trim())) return '';
    return this.fill(entry.content, vars).trim();
  },

  entries(scope, position) {
    return S.settings.entries.filter(e => e.enabled && e.position === position && (!e.scope || e.scope === 'all' || e.scope === scope));
  },

  baseVars(pid, at) {
    const p = persona(pid);
    return { 用户: p.name, user: p.name, 用户设定: p.persona || '', user_persona: p.persona || '', 时间: nowText(at), 天气: Weather.text() };
  },

   typed(s) { return Media.parseItem(s); },

    line(m, pid) {
    const n = senderName(m, pid);
    if (m.type === 'ignore') return `（${n}已读未回：${m.content}）`;
    if (m.type === 'sys') return `（${m.content}）`;
    return `${n}：${Lang.body(m, pid)}`;
  },

  // 某个角色最近 24 小时在其他会话里的聊天
  async recentLines(charId, pid, exclude, perConv = 6) {
    const ids = [Conv.dm(pid, charId)];
    for (const g of S.groups) if (g.personaId === pid && g.members.includes(charId)) ids.push(Conv.g(g.id));
    for (const r of Reading.rooms) if (r.personaId === pid && r.members.includes(charId)) ids.push(Conv.r(r.id));
    for (const c of S.chars) if (c.id !== charId) ids.push(Conv.cc(pid, charId, c.id));
    const since = Date.now() - 24 * 3600e3, out = [];
    for (const id of ids) {
      if (id === exclude) continue;
      const ms = (await getMsgs(id)).filter(m => m.ts > since).slice(-perConv);
      for (const m of ms) out.push({ ts: m.ts, t: `[${Conv.label(id, pid)}] ${this.line(m, pid)}` });
    }
    out.push(...await Moments.contextLines(charId, pid, since));
    out.push(...Pet.contextLines(charId, pid));
    return out;
  },

  async recentMulti(chars, pid, exclude, max = 15) {
    const seen = new Set(), all = [];
    for (const c of chars) for (const x of await this.recentLines(c.id, pid, exclude, 4)) if (!seen.has(x.t)) { seen.add(x.t); all.push(x); }
    return all.sort((a, b) => a.ts - b.ts).slice(-max).map(x => x.t).join('\n');
  },

  knownList(charId) {
    return S.chars.filter(c => c.id !== charId && knows(charId, c.id))
      .map(c => { const d = getRel(charId, c.id).desc; return d ? `${c.name}（${d}）` : c.name; }).join('、');
  },

  relationsText(members, pid) {
    const p = persona(pid), lines = [];
    for (const c of members) {
      const r = getRel(pid, c.id);
      lines.push(`${c.name}和${p.name}：${r.know ? '认识' : '不认识'}${r.desc ? '，' + r.desc : ''}`);
    }
    for (let i = 0; i < members.length; i++) for (let j = i + 1; j < members.length; j++) {
      const r = getRel(members[i].id, members[j].id);
      lines.push(`${members[i].name}和${members[j].name}：${r.know ? '认识' : '不认识'}${r.desc ? '，' + r.desc : ''}`);
    }
    return lines.join('\n');
  },

  dmRules(known) {
    const r = ['【功能格式】（必须遵守）', '- 每条消息单独一行，不要在消息前加名字。', '- 发语音：单独一行写 [语音]语音里说的话'];
    if (S.settings.chat.allowIgnore) r.push('- 已读不回：只有当{{角色}}此刻确实不会回复时（在忙、睡着了、在生气、故意晾着对方等），整段回复只写一行 [不回]原因。原因用旁观者视角简短描述，比如：在开会，瞄了一眼手机又放下了。大部分时候应该正常回复。');
    if (known) r.push(`- 私下找别人：如果聊到的内容让{{角色}}想私下联系某个认识的人，另起一行写 [私聊]对方名字：想找对方聊的原因。这一行对方看不到。可以找的人：${known}。不要频繁使用。`);
        r.push(Media.rules());
return r.join('\n');
  },

  proactiveHint(reason = '') {
    return `（此刻{{用户}}没有在和{{角色}}聊天，距离你们上一条消息已经过去了{{间隔}}。现在{{角色}}主动给{{用户}}发消息${reason ? '，原因：' + reason : '，可以分享此刻在做的事、延续之前的话题，或者只是想找{{用户}}说说话'}。直接写{{角色}}发出的消息。${reason ? '' : '如果{{角色}}此刻没有理由联系{{用户}}，只输出 [不发]'}）`;
  },

  normalize(msgs) {
    const merged = [];
    for (const m of msgs) {
      if (!String(m.content).trim()) continue;
      const last = merged.at(-1);
      if (last && last.role === m.role) last.content += '\n' + m.content;
      else merged.push({ ...m });
    }
    if (!merged.length || merged[0].role !== 'user') merged.unshift({ role: 'user', content: '（开始聊天）' });
    if (merged.at(-1).role !== 'user') merged.push({ role: 'user', content: '（继续）' });
    return merged;
  },

    async buildDM(ch, convId, { hint = '', at = null } = {}) {
    const now = at || Date.now();
    const { pid } = Conv.parse(convId);
    const p = persona(pid);
    const all = await getMsgs(convId);
    const hist = this.window(all);
    const query = hist.slice(-6).map(m => m.content).join('\n') || hint;
    const rel = getRel(pid, ch.id);
    const known = this.knownList(ch.id);
    const wb = WB.build([ch.id], WB.scan(all) + '\n' + hint);
    const vars = {
      ...this.baseVars(pid, now),
      角色: ch.name, char: ch.name, 角色设定: ch.persona || '', char_persona: ch.persona || '',
      记忆: await Memory.retrieveText(ch.id, pid, query, ch.name),
      近况: (await this.recentLines(ch.id, pid, convId)).sort((a, b) => a.ts - b.ts).slice(-12).map(x => x.t).join('\n'),
      关系: [rel.desc ? `${ch.name}和${p.name}：${rel.desc}` : '', known ? `${ch.name}认识的人：${known}` : ''].filter(Boolean).join('\n'),
      间隔: all.length ? gapText(now - all.at(-1).ts) : '很久',
      所在地: await Geo.placeText([ch], pid, now),
      世界书: wb.constant, 世界书触发: wb.triggered,
      群名: '', 成员名单: '', 成员设定: '',
    };
    vars.memory = vars.记忆;

    const { st, dy } = this.split('dm', vars);
    st.push(this.fill(this.dmRules(known), vars));
    const lr = Lang.dmRule(ch, p);
    if (lr) st.push(this.fill(lr, vars));
    const system = this.sysBlocks(st, dy);

        const msgs = [];
    hist.forEach((m, k) => {
      const gap = this.gapNote(hist[k - 1], m);
      if (gap) msgs.push({ role: 'user', content: gap });
      msgs.push(m.type === 'ignore'
        ? { role: 'user', content: `（${ch.name}当时已读未回：${m.content}）` }
        : { role: m.sender === 'user' ? 'user' : 'assistant', content: Lang.body(m, pid) });
    });
    this.entries('dm', 'depth').sort((a, b) => b.depth - a.depth).forEach(e => {
      const c = this.render(e, vars);
      if (c) msgs.splice(Math.max(0, msgs.length - Number(e.depth)), 0, { role: e.role === 'assistant' ? 'assistant' : 'user', content: c });
    });
    if (hint) msgs.push({ role: 'user', content: this.fill(hint, vars) });
    return { system, messages: this.markCache(this.normalize(msgs)) };
  },

    async buildGroup(g, convId) {
    const pid = g.personaId, p = persona(pid);
    const members = g.members.map(charById).filter(Boolean);
    const names = members.map(c => c.name);
    const all = await getMsgs(convId);
    const hist = this.window(all);
    const query = hist.slice(-6).map(m => m.content).join('\n');
    const mem = [];
    for (const c of members) { const t = await Memory.retrieveText(c.id, pid, query, c.name); if (t) mem.push(t); }
    const wb = WB.build(g.members, WB.scan(all));
    const vars = {
      ...this.baseVars(pid, Date.now()),
      群名: g.name, 成员名单: names.join('、'), 角色: names.join('、'),
      成员设定: members.map(c => `· ${c.name}：${c.persona || '（无）'}`).join('\n\n'),
      记忆: mem.join('\n\n'), 关系: this.relationsText(members, pid),
      近况: await this.recentMulti(members, pid, convId),
      世界书: wb.constant, 世界书触发: wb.triggered,
      所在地: await Geo.placeText(members, pid),
      角色设定: '',
    };
    const rules = `【输出格式】（必须遵守）
- 你来安排群成员接下来的发言，每行一条消息，格式：名字：内容
- 名字只能是：${names.join('、')}。绝对不要替{{用户}}发言。
- 由你判断谁会说话：被@的人优先回应；和话题相关、性格活跃的人更可能开口；不是每个人都要说话，也可以有人连发几条。一共 1 到 8 条。
- 注意信息差：每个人只知道自己参与过的聊天和自己的记忆，不知道别人私聊的内容。
- 发语音：名字：[语音]语音里说的话
${Media.rules(true, p.name)}
${Lang.groupRule(members, p)}
- @某人：在内容里写 @名字
- 如果聊天让某个成员想私下找人聊（{{用户}}或他认识的其他人），另起一行写：[私聊]成员名→对方名字：原因。这一行不会显示在群里，偶尔使用。
- 不写旁白、动作和心理描写。`;
    const { st, dy } = this.split('group', vars);
    st.push(this.fill(rules, vars));
    const system = this.sysBlocks(st, dy);

    let i = hist.length;
    while (i > 0 && hist[i - 1].sender === 'user') i--;
    const batch = hist.slice(i);
    const tail = this.entries('group', 'depth').map(e => this.render(e, vars)).filter(Boolean);
    const ats = names.filter(n => batch.some(m => m.content.includes('@' + n)));
    if (batch.some(m => m.content.includes('@全体成员'))) tail.unshift(`（${p.name}@了全体成员）`);
    else if (ats.length) tail.unshift(`（${p.name}@了${ats.join('、')}，被@的人要回应。）`);

    // 聊天记录按每 10 条切块，前面完整的块走缓存
    const lines = hist.map((m, k) => (this.gapNote(hist[k - 1], m) ? this.gapNote(hist[k - 1], m) + '\n' : '') + this.line(m, pid));
    const cut = S.settings.cache?.enabled ? Math.floor(lines.length / 10) * 10 : 0;
    const head = lines.slice(0, cut).join('\n'), rest = lines.slice(cut).join('\n');
    const content = [];
    if (head) content.push({ type: 'text', text: '【群聊记录】\n' + head, cache_control: { type: 'ephemeral' } });
    const restText = head ? rest : '【群聊记录】\n' + (rest || '（群里还没人说话，由成员自然地开启话题）');
    content.push({ type: 'text', text: [restText, tail.join('\n')].filter(Boolean).join('\n\n') });
    return { system, messages: [{ role: 'user', content }] };
  },

  async buildCC(a, b, convId, { reason = '', at = null } = {}) {
    const now = at || Date.now();
    const { pid } = Conv.parse(convId);
    const p = persona(pid);
    const hist = (await getMsgs(convId)).slice(-30);
    const query = [reason, ...hist.slice(-6).map(m => m.content)].join('\n');
    const block = [`你是手机聊天记录的写手，要写出${a.name}和${b.name}在手机上的一段私聊。`];
    for (const c of [a, b]) {
      block.push(`【${c.name}的设定】\n${c.persona || '（无）'}`);
      const r = getRel(pid, c.id);
      if (r.know) block.push(`${c.name}认识${p.name}${r.desc ? '：' + r.desc : ''}`);
      const mem = await Memory.retrieveText(c.id, pid, query, c.name);
      if (mem) block.push(mem);
    }
    if (knows(pid, a.id) || knows(pid, b.id)) block.push(`【${p.name}的设定】\n${p.persona || '（无）'}`);
    const wb = WB.build([a.id, b.id], WB.scan(hist) + '\n' + reason);
    if (wb.constant) block.push(`【世界设定】\n${wb.constant}`);
    if (wb.triggered) block.push(`【相关设定】\n${wb.triggered}`);
    const place = await Geo.placeText([a, b], pid, now);
    if (place) block.push('【所在地与时差】\n' + place);
    const lr = Lang.ccRule(a, b, pid);
    if (lr) block.push(lr);
    block.push(`【两人的关系】\n${getRel(a.id, b.id).desc || '认识'}`);
    const rec = await this.recentMulti([a, b], pid, convId);
    if (rec) block.push(`【两人最近在别处的聊天】\n${rec}`);
    block.push(...this.styleBlocks(pid, `${a.name}、${b.name}`));
    block.push(`【要求】
- 只写两人发出的消息，每行一条，格式：名字：内容。名字只能是${a.name}或${b.name}。
- 像真人聊天：多数是短句，可以连发，偶尔有长消息。不写旁白、动作和心理描写。
- 注意信息差：每个人只知道自己参与过的聊天和自己的记忆。
- 一共 4 到 14 条，聊到自然结束或暂时告一段落。
- 发语音：名字：[语音]语音里说的话
${Media.rules(true)}`);
    const log = hist.map((m, k) => (this.gapNote(hist[k - 1], m) ? this.gapNote(hist[k - 1], m) + '\n' : '') + this.line(m, pid)).join('\n');
    const task = `${log ? '【之前的聊天】\n' + log + '\n\n' : ''}现在是${nowText(now)}。${reason
      ? `这次是${a.name}主动找${b.name}，原因：${reason}。`
      : '由其中一人自然地发起话题，可以是日常分享、延续之前的事，或者聊到共同认识的人。'}\n请写出这段私聊。`;
    return { system: block.join('\n\n'), messages: [{ role: 'user', content: task }] };
  },

  // 单聊输出：普通消息 / [语音] / [不回] / [不发] / [私聊]
  parseDM(text, ch) {
    const nameRe = new RegExp('^[【\\[]?' + escRe(ch.name) + '[】\\]]?\\s*[:：]\\s*');
    const out = { msgs: [], intents: [], ignore: null, skip: false };
    for (let l of String(text).split(/\n+/)) {
      l = l.trim().replace(nameRe, '');
      if (!l || /^[-—*_=]{3,}$/.test(l)) continue;
      let m;
      if (/^\[不发\]/.test(l)) { out.skip = true; continue; }
      if ((m = l.match(/^\[不回\]\s*(.*)$/))) { out.ignore = m[1].trim() || '看了一眼，没有回'; continue; }
      if ((m = l.match(/^\[私聊\]\s*(.+?)\s*[:：]\s*(.+)$/))) { out.intents.push({ to: m[1].replace(/^@/, ''), reason: m[2] }); continue; }
      out.msgs.push(this.typed(l));
    }
    if (out.msgs.length) { out.ignore = null; out.skip = false; }
    return out;
  },

  // 群聊 / 角色间私聊输出：名字：内容 + [私聊]A→B：原因
  parseLines(text, names) {
    const msgs = [], intents = [];
    for (let l of String(text).split(/\n+/)) {
      l = l.trim().replace(/^[*\-•]\s*/, '');
      if (!l || /^[-—*_=]{3,}$/.test(l)) continue;
      const it = l.match(/^\[私聊\]\s*(.+?)\s*(?:→|->|=>|>)\s*(.+?)\s*[:：]\s*(.+)$/);
      if (it) { intents.push({ from: it[1].trim(), to: it[2].trim().replace(/^@/, ''), reason: it[3] }); continue; }
      const mm = l.match(/^[【\[]?(.{1,24}?)[】\]]?\s*[:：]\s*(.+)$/);
      const name = mm && names.find(n => n === mm[1].trim());
      if (name) msgs.push({ name, ...this.typed(mm[2]) });
      else if (msgs.length) msgs.push({ name: msgs.at(-1).name, ...this.typed(l) });
    }
    return { msgs, intents };
  },
};
