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
    ...OFFLINE_ENTRIES(),
  ];

};
// 线下模式专用预设。只在写线下剧情时使用，不影响单聊和群聊
const OFFLINE_ENTRIES = () => {
  const e = (name, content) => ({ id: uid(), name, enabled: true, scope: 'offline', position: 'system', role: 'user', depth: 0, content });
  return [
    e('主提示：线下', `你要写一段{{用户}}和{{角色}}在现实里见面时发生的短剧情。
- 剧情发生在{{时间}}。参考线上聊天记录里的约定和话题，要和之前聊过的内容衔接，不能和已知的事实矛盾。
- 用第三人称叙述，可以写动作、神态、环境和对话。
- 300 到 600 字，写一个完整的小片段，自然收尾，不要写成长篇。
- {{用户}}的言行少写、写得克制，不写{{用户}}的心理，不替{{用户}}做重要决定。
- 不要凭空制造大事件（表白、吵架、受伤、意外之类），除非聊天记录里已经有铺垫，或者剧情方向里写了。
- 只输出剧情正文，不加标题和说明。`),
    e('线下：角色设定', '【{{角色}}的设定】\n{{角色设定}}'),
    e('线下：用户设定', '【{{用户}}的设定】\n{{用户设定}}'),
    e('线下：关系', '【两人的关系】\n{{关系}}'),
    e('线下：世界书', '【世界设定】\n{{世界书}}'),
    e('线下：世界书触发', '【相关设定】\n{{世界书触发}}'),
    e('线下：记忆', '{{记忆}}'),
    e('线下：时间', '剧情发生的时间：{{时间}}。\n{{天气}}'),
  ];
};

const Prompt = {
  // 预设里的风格条目，给角色间私聊、朋友圈复用
  styleBlocks(pid, names) {
    const vars = { ...this.baseVars(pid, Date.now()), 角色: names, char: names };
    return S.settings.entries
      .filter(e => e.enabled && e.position === 'system' && ['写人原则', '语感', '时间与话题', '真实感'].includes(e.name))
      .map(e => this.render(e, vars)).filter(Boolean);
  },

    // 日期文字，比如：3月5日周三
  dayText(ts) {
    return new Date(ts).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });
  },

  // 第一条消息和每次换了一天，都标上日期；同一天隔了 3 小时以上，标上间隔
  gapNote(prev, m) {
    const day = this.dayText(m.ts);
    if (!prev) return `（${day}）`;
    const d = m.ts - prev.ts;
    if (day !== this.dayText(prev.ts)) {
      return `（${day}${d >= 3 * 3600e3 ? '，距上一条过了' + gapText(d) : ''}）`;
    }
    return d >= 3 * 3600e3 ? `（过了${gapText(d)}）` : '';
  },

  // 告诉 AI 怎么换算"今天""明天"
  TIME_RULE: '（聊天记录里的"今天""明天""昨天"，是按发那条消息的那天说的，要换算成现在的日期。比如昨天说"明天去"，指的就是今天。约好的时间已经过了，就当已经发生了。）',
  // 人设只当背景用：不复述、不介绍别人、标签和能力不挂嘴边
  PERSONA_RULE: `【人设怎么用】（重要）
- 设定里的特点（性格标签、特殊能力、喜好、口头禅、身世）是背景，不是话题。真人不会把自己的特点挂在嘴边。
- 性格要靠做出来，不要说出来。比如设定写"一本正经地骗人"，就让他直接这样逗人，任何人（包括他自己和别人）都不要说"他很会一本正经地骗人"。
- 喜好只在话题碰到时才可能出现，而且不是每次都提。最近已经提过的喜好，很长时间内不要再提。
- 特殊能力、特殊体质这类设定平时藏在行为里，只有剧情真的碰到时才提，提过一次后很久都不要再强调。
- 其他人的设定是写手才看得到的参考资料，角色本人并不知道。一个人只能凭自己和对方相处的经历评价对方，而且很少主动向别人介绍某人的性格。`,

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
  // 开缓存时：system 只放固定部分，动态部分（时间、记忆、近况等）挪到消息末尾，不打断聊天记录的缓存
    cacheSys(st, dy) {
    // 没开缓存时，换算规则直接放进 system
    if (!S.settings.cache?.enabled) return { system: this.sysBlocks(st, [...dy, this.TIME_RULE]), dyn: '' };
    const s = st.filter(Boolean).join('\n\n'), d = dy.filter(Boolean).join('\n\n');
    return { system: [{ type: 'text', text: s, cache_control: { type: 'ephemeral' } }], dyn: d };
  },

   dynText: d => `【当前情况（背景信息，不用复述）】\n${d}\n${Prompt.TIME_RULE}`,
  // 把动态部分放进最后一条 user 消息的开头
  withDyn(msgs, dyn) {
    if (!dyn) return msgs;
    const last = msgs.at(-1);
    const blocks = typeof last.content === 'string' ? [{ type: 'text', text: last.content }] : last.content;
    msgs[msgs.length - 1] = { role: 'user', content: [{ type: 'text', text: this.dynText(dyn) }, ...blocks] };
    return msgs;
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

      // list 有值时带上消息编号和引用，给群聊、私聊、共读用
  line(m, pid, list = null) {
    const n = senderName(m, pid);
        if (m.type === 'ignore') return this.ignoreText(m, n);
    if (m.type === 'sys') return `（${m.content}）`;
       if (m.type === 'offline') return this.offlineText(m, pid);
    const sa = Lang.sentAs(m);
    const head = list ? `[#${Quote.code(m)}] ` : '', ref = list ? Quote.ref(m, list, pid) : '';
    return `${head}${n}：${ref}${Lang.body(m, pid)}${sa ? `（实际是用${sa}发的）` : ''}`;
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
            for (const m of ms) out.push({ ts: m.ts, t: `[${Conv.label(id, pid)} ${ChatUI.timeLabel(m.ts)}] ${this.line(m, pid)}` });
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

  knownList(charId, pid) {
  return S.chars.filter(c => c.id !== charId && knows(charId, c.id, pid))
    .map(c => { const d = getRel(charId, c.id, pid).desc; return d ? `${c.name}（${d}）` : c.name; }).join('、');
},

  relationsText(members, pid) {
    const p = persona(pid), lines = [];
    for (const c of members) {
      const r = getRel(pid, c.id);
      lines.push(`${c.name}和${p.name}：${r.know ? '认识' : '不认识'}${r.desc ? '，' + r.desc : ''}`);
    }
    for (let i = 0; i < members.length; i++) for (let j = i + 1; j < members.length; j++) {
  const r = getRel(members[i].id, members[j].id, pid);
  lines.push(`${members[i].name}和${members[j].name}：${r.know ? '认识' : '不认识'}${r.desc ? '，' + r.desc : ''}`);
}
    return lines.join('\n');
  },

      dmRules(known, invGroups = [], blocked = false, iBlocked = false) {
    const r = ['【功能格式】（必须遵守）', '- 每条消息单独一行，不要在消息前加名字。', '- 发语音：单独一行写 [语音]语音里说的话'];
        if (S.settings.chat.allowIgnore) r.push(`- 不回复：只有当{{角色}}此刻确实不会回复时才用，整段回复只写一行，大部分时候应该正常回复。分两种：
  · 看了但不回（在忙顾不上、在生气、故意晾着对方等）：[不回]原因
  · 根本没看到消息（睡着了、手机没电、在开车、静音没注意等）：[没看]原因
  原因用旁观者视角简短描述，比如：[不回]在开会，瞄了一眼手机又放下了 / [没看]已经睡着了，手机扣在床头`);
    if (known) r.push(`- 私下找别人：如果聊到的内容让{{角色}}想私下联系某个认识的人（包括请对方帮忙说情、传话），另起一行写 [私聊]对方名字：想找对方聊的原因。这一行对方看不到。可以找的人：${known}。不要频繁使用。`);
    if (invGroups.length) r.push(`- 拉{{用户}}进群：{{用户}}现在不在这些群里，{{角色}}是群主或管理员，能把{{用户}}拉进去：${invGroups.join('、')}。只有{{用户}}想进、而且{{角色}}愿意，或者{{角色}}自己想拉的时候才用，单独一行写 [拉进群]群名。`);
    if (!blocked) r.push('- 拉黑：极少使用。只有{{角色}}被惹到极点、真的不想再收到{{用户}}的消息时，在最后单独一行写 [拉黑]。拉黑后{{角色}}还能看到{{用户}}的消息，但不会回复。');
    if (iBlocked) r.push(`- {{用户}}把{{角色}}拉黑了，{{角色}}知道。{{角色}}发的消息{{用户}}能看到，但{{用户}}不会回。按{{角色}}的性格反应：道歉、解释、生气、冷处理都可以${known ? '，也可以用 [私聊] 找共同认识的人帮忙说情' : ''}。不要每次都在说这件事。`);
    r.push(Quote.RULE);
    r.push(Media.rules());
    return r.join('\n');
  },

  proactiveHint(reason = '') {
    return `（此刻{{用户}}没有在和{{角色}}聊天，距离你们上一条消息已经过去了{{间隔}}。现在{{角色}}主动给{{用户}}发消息${reason ? '，原因：' + reason : '，可以分享此刻在做的事、延续之前的话题，或者只是想找{{用户}}说说话'}。直接写{{角色}}发出的消息。${reason ? '' : '如果{{角色}}此刻没有理由联系{{用户}}，只输出 [不发]'}）`;
  },
    // 群里没人说话时，让会主动的成员自己开口。away 表示你不在群里
  groupProactiveHint(names, away = false) {
    return `（距离群里上一条消息已经过去了{{间隔}}。${away ? '' : '{{用户}}此刻没有在群里说话。'}现在由群成员自然地开启或延续话题：分享此刻在做的事、吐槽、发现的东西，或者接着之前没聊完的事（隔得久就别硬接）。只能由${names.join('、')}发起，其他成员可以接话。${away ? '' : '不要@{{用户}}追着要回复。'}1 到 5 条就行。如果这个时间点大家都不会在群里说话，只输出 [不发]）`;
  },

  // 角色拉黑了你时，用这段代替正常回复
   blockedHint() {
    return '（{{角色}}之前把{{用户}}拉黑了。拉黑后{{角色}}仍然能看到{{用户}}发来的消息，但不会回复。根据这些消息和{{角色}}的性格判断：如果{{角色}}气消了、心软了，或者确实有必要回，第一行写 [解除拉黑]，后面接着写要发的消息；否则只输出一行 [不发]原因，原因用旁观者视角简短描述，比如：[不发]看到了，冷笑一声把手机扔到一边。）';
  },
  // 没回复的几种情况：read 看了没回，unseen 没看到，blocked 拉黑中看了没回
  IGNORE_KIND: { read: '看了消息但没回', unseen: '没看到消息', blocked: '还在拉黑中，看了没回' },
  ignoreText(m, name) {
    return `（${name}当时${this.IGNORE_KIND[m.kind] || this.IGNORE_KIND.read}：${m.content}）`;
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
    // 线下剧情：只用作用范围为「线下」的预设。chars[0] 是当前私聊的角色，其余是一起在场的
  async buildOffline(chars, convId, ts, hint = '') {
    const { pid } = Conv.parse(convId);
    const ids = chars.map(c => c.id), names = chars.map(c => c.name), multi = chars.length > 1;
    const before = (await getMsgs(convId)).filter(m => m.ts <= ts).slice(-30);
    const query = [hint, ...before.slice(-6).map(m => m.content)].join('\n');
    const mem = [];
    for (const c of chars) { const t = await Memory.retrieveText(c.id, pid, query, c.name); if (t) mem.push(t); }
    const wb = WB.build(ids, WB.scan(before) + '\n' + hint);
    const vars = {
      ...this.baseVars(pid, ts),
      角色: names.join('、'), char: names.join('、'),
      角色设定: multi ? chars.map(c => `· ${c.name}：${c.persona || '（无）'}`).join('\n\n') : (chars[0].persona || ''),
      记忆: mem.join('\n\n'),
      关系: this.relationsText(chars, pid),
      世界书: wb.constant, 世界书触发: wb.triggered,
    };
    vars.char_persona = vars.角色设定;
    vars.memory = vars.记忆;
    const system = S.settings.entries
      .filter(e => e.enabled && e.scope === 'offline' && e.position === 'system')
      .map(e => this.render(e, vars)).filter(Boolean).join('\n\n');
    const log = before.map((m, k) => {
      const gap = this.gapNote(before[k - 1], m);
      return (gap ? gap + '\n' : '') + `[${ChatUI.timeLabel(m.ts)}] ${this.line(m, pid)}`;
    }).join('\n');
    // 其他在场的人最近 24 小时的聊天，让他们的表现能接上
    const rec = multi ? await this.recentMulti(chars.slice(1), pid, convId) : '';
        const pname = persona(pid).name;
    const task = [
      log && `【${pname}和${names[0]}的线上聊天记录】\n` + log,
      rec && '【其他在场的人最近的聊天】\n' + rec,
      multi && `【在场的人】${pname}、${names.join('、')}。每个人都要有符合自己性格的表现，戏份不用一样多。`,
      hint && '【这段剧情大概是】\n' + hint,
      `【剧情里的手机消息】如果剧情里有人用手机给${pname}发了消息（比如见面前说"我到了"、分开后报平安），每条单独一行写：[消息]时:分 名字：内容。时间是今天的具体时间，不能晚于${ChatUI.timeLabel(Date.now())}。名字只能是${names.join('、')}，不替${pname}发消息。语音写成 [消息]时:分 名字：[语音]内容。没有就不写，正文里也不要重复这些消息。`,
      `请写出${nowText(ts)}发生的线下剧情。`,
    ].filter(Boolean).join('\n\n');
    return { system, messages: [{ role: 'user', content: task }] };
  },

  // 给 AI 看的线下剧情，带上在场的人
  offlineText(m, pid) {
    const ids = m.members || [Conv.parse(m.convId).charId];
    const who = [persona(pid).name, ...ids.map(id => charById(id)?.name).filter(Boolean)];
    return `（${nowText(m.ts)}，线下见面，在场：${[...new Set(who)].join('、')}。当时的经过：${m.content}）`;
  },

    async buildDM(ch, convId, { hint = '', at = null } = {}) {
    const now = at || Date.now();
    const { pid } = Conv.parse(convId);
    const p = persona(pid);
    const all = await getMsgs(convId);
    const hist = this.window(all);
        // 只用对方最近说的话召回，不用角色自己的回复，避免提过的旧事反复被召回
    const query = hist.filter(m => m.sender === 'user').slice(-3).map(m => m.content).join('\n') || hint;
    const rel = getRel(pid, ch.id);
    const known = this.knownList(ch.id, pid);
    const wb = WB.build([ch.id], WB.scan(all) + '\n' + hint);
    const vars = {
      ...this.baseVars(pid, now),
      角色: ch.name, char: ch.name, 角色设定: ch.persona || '', char_persona: ch.persona || '',
      记忆: await Memory.retrieveText(ch.id, pid, query, ch.name, { conv: convId, since: hist[0]?.ts }),
      近况: (await this.recentLines(ch.id, pid, convId)).sort((a, b) => a.ts - b.ts).slice(-6).map(x => x.t).join('\n'),
      关系: [rel.desc ? `${ch.name}和${p.name}：${rel.desc}` : '', known ? `${ch.name}认识的人：${known}` : '',
        rel.theyBlock ? `${ch.name}已经把${p.name}拉黑了` : '',
        rel.iBlock ? `${p.name}把${ch.name}拉黑了，${ch.name}知道` : ''].filter(Boolean).join('\n'),
      间隔: all.length ? gapText(now - all.at(-1).ts) : '很久',
      所在地: await Geo.placeText([ch], pid, now),
      世界书: wb.constant, 世界书触发: wb.triggered,
      群名: '', 成员名单: '', 成员设定: '',
    };
    vars.memory = vars.记忆;

    const { st, dy } = this.split('dm', vars);
        // 这个角色当群主或管理员、而你不在的群
    const invGroups = S.groups.filter(g => g.personaId === pid && g.userIn === false && g.members.includes(ch.id) && GroupAdmin.role(g, ch.id) !== 'member').map(g => g.name);
        st.push(this.fill(this.dmRules(known, invGroups, rel.theyBlock, rel.iBlock), vars));
    st.push(this.fill(this.PERSONA_RULE, vars));
    const lr = Lang.dmRule(ch, p);
    if (lr) st.push(this.fill(lr, vars));
        const { system, dyn } = this.cacheSys(st, dy);

        const msgs = [];
    hist.forEach((m, k) => {
      const gap = this.gapNote(hist[k - 1], m);
      if (gap) msgs.push({ role: 'user', content: gap });
            msgs.push(m.type === 'ignore'
                ? { role: 'user', content: this.ignoreText(m, ch.name) }
        : m.type === 'sys' ? { role: 'user', content: `（${m.content}）` }
               : m.type === 'offline' ? { role: 'user', content: this.offlineText(m, pid) }
                             : { role: m.sender === 'user' ? 'user' : 'assistant',
            content: `[#${Quote.code(m)}] ${Quote.ref(m, all, pid)}` +
              (Lang.sentAs(m) ? `${Lang.body(m, pid)}（${p.name}这条实际是用${Lang.sentAs(m)}发的）` : Lang.body(m, pid)) });
    });
    this.entries('dm', 'depth').sort((a, b) => b.depth - a.depth).forEach(e => {
      const c = this.render(e, vars);
      if (c) msgs.splice(Math.max(0, msgs.length - Number(e.depth)), 0, { role: e.role === 'assistant' ? 'assistant' : 'user', content: c });
    });
    if (hint) msgs.push({ role: 'user', content: this.fill(hint, vars) });
        return { system, messages: this.withDyn(this.markCache(this.normalize(msgs)), dyn) };
  },

     async buildGroup(g, convId, { hint = '', at = null } = {}) {
    const now = at || Date.now(); // 离线补发时用补发的时间点
    const pid = g.personaId, p = persona(pid);
    const members = g.members.map(charById).filter(Boolean);
    const names = members.map(c => c.name);
    const all = await getMsgs(convId);
    const hist = this.window(all);
       const query = hist.slice(-6).filter(m => m.sender === 'user' || m.type === 'text').slice(-4).map(m => m.content).join('\n') || hint;
    const mem = [];
        for (const c of members) { const t = await Memory.retrieveText(c.id, pid, query, c.name, { conv: convId, since: hist[0]?.ts }); if (t) mem.push(t); }
    const wb = WB.build(g.members, WB.scan(all));
    const vars = {
      ...this.baseVars(pid, now),
      群名: g.name, 成员名单: names.join('、'), 角色: names.join('、'),
            成员设定: '（以下是写手的参考资料。成员之间不知道彼此设定的原文，只知道自己相处中看到的。）\n'
        + members.map(c => `· ${c.name}：${c.persona || '（无）'}`).join('\n\n'),
      记忆: mem.join('\n\n'), 关系: this.relationsText(members, pid),
      近况: await this.recentMulti(members, pid, convId),
      世界书: wb.constant, 世界书触发: wb.triggered,
      所在地: await Geo.placeText(members, pid, now),
      间隔: all.length ? gapText(now - all.at(-1).ts) : '很久',
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
${Quote.RULE}
- 如果聊天让某个成员想私下找人聊（{{用户}}或他认识的其他人），另起一行写：[私聊]成员名→对方名字：原因。这一行不会显示在群里，偶尔使用。
- 不写旁白、动作和心理描写。
${GroupAdmin.rules(g, members)}`;
    const { st, dy } = this.split('group', vars);
    st.push(this.fill(rules, vars));
    st.push(this.fill(this.PERSONA_RULE, vars));
    if (g.userIn === false) st.push(this.fill(`【注意】{{用户}}现在不在这个群里（${g.byChar ? '从来没进过' : '已经退出了'}），看不到群消息。上面说的群成员不包括{{用户}}。大家说话不用顾忌{{用户}}，也可以聊到{{用户}}。`, vars));
        const { system, dyn } = this.cacheSys(st, dy);

    let i = hist.length;
    while (i > 0 && hist[i - 1].sender === 'user') i--;
    const batch = hist.slice(i);
    const tail = this.entries('group', 'depth').map(e => this.render(e, vars)).filter(Boolean);
    // 主动发言时，不再提醒回应你以前的@
    if (!hint) {
      const ats = names.filter(n => batch.some(m => m.content.includes('@' + n)));
      if (batch.some(m => m.content.includes('@全体成员'))) tail.unshift(`（${p.name}@了全体成员）`);
      else if (ats.length) tail.unshift(`（${p.name}@了${ats.join('、')}，被@的人要回应。）`);
    }
    if (hint) tail.push(this.fill(hint, vars));
    const lt = Lang.groupTail(members, p);
    if (lt) tail.push(lt);

    // 聊天记录按每 10 条切块，前面完整的块走缓存
    const lines = hist.map((m, k) => (this.gapNote(hist[k - 1], m) ? this.gapNote(hist[k - 1], m) + '\n' : '') + this.line(m, pid, all));
    const cut = S.settings.cache?.enabled ? Math.floor(lines.length / 10) * 10 : 0;
    const head = lines.slice(0, cut).join('\n'), rest = lines.slice(cut).join('\n');
    const content = [];
    if (head) content.push({ type: 'text', text: '【群聊记录】\n' + head, cache_control: { type: 'ephemeral' } });
    const restText = head ? rest : '【群聊记录】\n' + (rest || '（群里还没人说话，由成员自然地开启话题）');
               // 顺序：聊天记录 → 当前情况（记忆、时间等）→ @提醒和格式提醒
    content.push({ type: 'text', text: [restText, dyn && this.dynText(dyn), tail.join('\n')].filter(Boolean).join('\n\n') });
    return { system, messages: [{ role: 'user', content }] };
  },

   async buildCC(a, b, convId, { reason = '', at = null } = {}) {
    const now = at || Date.now();
    const { pid } = Conv.parse(convId);
    const p = persona(pid);
    const hist = (await getMsgs(convId)).slice(-30);
    const query = [reason, ...hist.slice(-6).map(m => m.content)].join('\n');
    // 固定部分按 ID 排序，不管谁发起，前缀都一样，才能命中缓存
    const [x, y] = [a, b].sort((m, n) => (m.id < n.id ? -1 : 1));
    const st = [`你是手机聊天记录的写手，要写出${x.name}和${y.name}在手机上的一段私聊。`];
    const dy = [];
    for (const c of [x, y]) {
      st.push(`【${c.name}的设定】\n${c.persona || '（无）'}`);
      const r = getRel(pid, c.id);
      if (r.know) st.push(`${c.name}认识${p.name}${r.desc ? '：' + r.desc : ''}`);
      const mem = await Memory.retrieveText(c.id, pid, query, c.name);
      if (mem) dy.push(mem);
    }
    st.push(`（上面两人的设定是写手的参考资料。${x.name}和${y.name}不知道对方设定的原文，只知道相处中了解到的。）`);
    if (knows(pid, x.id) || knows(pid, y.id)) st.push(`【${p.name}的设定】\n${p.persona || '（无）'}`);
    const wb = WB.build([x.id, y.id], WB.scan(hist) + '\n' + reason);
    if (wb.constant) st.push(`【世界设定】\n${wb.constant}`);
    if (wb.triggered) dy.push(`【相关设定】\n${wb.triggered}`);
    const lr = Lang.ccRule(x, y, pid);
    if (lr) st.push(lr);
    for (const c of [x, y]) {
      const r = getRel(pid, c.id);
      if (r.iBlock) st.push(`【${c.name}知道】${p.name}把${c.name}拉黑了。对方不一定知道，除非听${c.name}或${p.name}说过。`);
      if (r.theyBlock) st.push(`【${c.name}知道】${c.name}把${p.name}拉黑了。对方不一定知道，除非听${c.name}或${p.name}说过。`);
    }
    st.push(`【两人的关系】\n${getRel(x.id, y.id, pid).desc || '认识'}`);
    st.push(...this.styleBlocks(pid, `${x.name}、${y.name}`));
    st.push(this.PERSONA_RULE);
    const blockers = [x, y].filter(c => getRel(pid, c.id).theyBlock).map(c => c.name);
    st.push(`【要求】
- 只写两人发出的消息，每行一条，格式：名字：内容。名字只能是${x.name}或${y.name}。
- 像真人聊天：多数是短句，可以连发，偶尔有长消息。不写旁白、动作和心理描写。
- 注意信息差：每个人只知道自己参与过的聊天和自己的记忆。
- 一共 4 到 14 条，聊到自然结束或暂时告一段落。
- 发语音：名字：[语音]语音里说的话
${Media.rules(true)}
${Quote.RULE}
- 聊完如果某人想去私下找${p.name}或别人（比如答应帮忙说情、传话），另起一行写：[私聊]名字→对方名字：原因。偶尔使用。${blockers.length ? `
- ${blockers.join('、')}拉黑了${p.name}。如果被说动了、气消了，单独一行写：名字：[解除拉黑]` : ''}`);
    const place = await Geo.placeText([x, y], pid, now);
    if (place) dy.push('【所在地与时差】\n' + place);
    const rec = await this.recentMulti([x, y], pid, convId);
    if (rec) dy.push(`【两人最近在别处的聊天】\n${rec}`);

    const { system, dyn } = this.cacheSys(st, dy);
    const log = hist.map((m, k) => (this.gapNote(hist[k - 1], m) ? this.gapNote(hist[k - 1], m) + '\n' : '') + this.line(m, pid, hist)).join('\n');
    const task = `${log ? '【之前的聊天】\n' + log + '\n\n' : ''}现在是${nowText(now)}。${reason
      ? `这次是${a.name}主动找${b.name}，原因：${reason}。`
      : '由其中一人自然地发起话题，可以是日常分享、延续之前的事，或者聊到共同认识的人。'}\n请写出这段私聊。`;
    return { system, messages: this.withDyn([{ role: 'user', content: task }], dyn) };
  },

  // 单聊输出：普通消息 / [语音] / [不回] / [不发] / [私聊]
  parseDM(text, ch) {
    const nameRe = new RegExp('^[【\\[]?' + escRe(ch.name) + '[】\\]]?\\s*[:：]\\s*');
        const out = { msgs: [], intents: [], invites: [], ignore: null, ignoreKind: 'read', skip: false, skipWhy: '', block: false, unblock: false };
    for (let l of String(text).split(/\n+/)) {
      l = l.trim().replace(Quote.TAG, '').replace(nameRe, '').replace(Quote.TAG, '');
      if (!l || /^[-—*_=]{3,}$/.test(l)) continue;
      let m;
            if ((m = l.match(/^\[不发\]\s*(.*)$/))) { out.skip = true; out.skipWhy = m[1].trim(); continue; }
      if (/^\[解除拉黑\]/.test(l)) { out.unblock = true; continue; }
      if (/^\[拉黑\]/.test(l)) { out.block = true; continue; }
      if ((m = l.match(/^\[拉进群\]\s*(.+)$/))) { out.invites.push(m[1].trim()); continue; }
            if ((m = l.match(/^\[不回\]\s*(.*)$/))) { out.ignore = m[1].trim() || '看了一眼，没有回'; out.ignoreKind = 'read'; continue; }
      if ((m = l.match(/^\[没看\]\s*(.*)$/))) { out.ignore = m[1].trim() || '没注意到手机'; out.ignoreKind = 'unseen'; continue; }
      if ((m = l.match(/^\[私聊\]\s*(.+?)\s*[:：]\s*(.+)$/))) { out.intents.push({ to: m[1].replace(/^@/, ''), reason: m[2] }); continue; }
            const q = Quote.take(l);
      out.msgs.push({ ...this.typed(q.rest), ...(q.code ? { quote: q.code } : {}) });
    }
    if (out.msgs.length) { out.ignore = null; out.skip = false; }
    return out;
  },

     // 名字容错：AI 可能写成简繁不同、异体字或带前后缀的名字
  matchName(names, raw) {
    const s = String(raw).trim().replace(/^[【\[（(]+|[】\]）)]+$/g, '').replace(/\s+/g, '');
    if (!s) return null;
    const exact = names.find(n => n === s);
    if (exact) return exact;
    const sub = names.filter(n => n.includes(s) || s.includes(n));
    if (sub.length === 1) return sub[0];
    // 按相同字符比例匹配，应对简繁体和异体字（陽/阳、絵/绘、烏/乌）
    let best = null, bs = 0;
    for (const n of names) {
      const chars = [...n];
      const same = [...s].filter(c => chars.includes(c)).length;
      const sc = same / Math.max(n.length, s.length);
      if (sc > bs) { bs = sc; best = n; }
    }
    return bs >= 0.5 ? best : null;
  },

  // 群聊 / 角色间私聊输出：名字：内容 + [私聊]A→B：原因。cmds 为 true 时识别群管理操作
  parseLines(text, names, { cmds = false } = {}) {
        const msgs = [], intents = [], unblocks = [];
    for (let l of String(text).split(/\n+/)) {
      l = l.trim().replace(/^[*\-•]\s*/, '').replace(Quote.TAG, '');
      if (!l || /^[-—*_=]{3,}$/.test(l)) continue;
      if (/^\[不发\]/.test(l)) continue;
      const it = l.match(/^\[私聊\]\s*(.+?)\s*(?:→|->|=>|>)\s*(.+?)\s*[:：]\s*(.+)$/);
      if (it) { intents.push({ from: this.matchName(names, it[1]) || it[1].trim(), to: it[2].trim().replace(/^@/, ''), reason: it[3] }); continue; }
      const mm = l.match(/^[【\[]?(.{1,24}?)[】\]]?\s*[:：]\s*(.+)$/);
      const name = mm && this.matchName(names, mm[1]);
           if (name) {
        const q = Quote.take(mm[2]);
        if (/^\[不发\]/.test(q.rest)) continue;
        if (/^\[解除拉黑\]/.test(q.rest)) { unblocks.push(name); continue; }
        const cmd = cmds && GroupAdmin.parse(q.rest);
        msgs.push(cmd ? { name, cmd, type: 'sys', content: '' } : { name, ...this.typed(q.rest), quote: q.code });
      }
 else if (mm && !/[，。！？、,.!?]/.test(mm[1])) {
        // 看起来是"名字：内容"但名字对不上，宁可丢掉也不要错归给别人
        Log.add('群聊里有对不上的名字：' + mm[1].trim(), '检查角色名字是否和 AI 写的一致（简繁体、异体字）');
      } else if (msgs.length) {
        msgs.push({ name: msgs.at(-1).name, ...this.typed(l) });
      }
    }
        return { msgs, intents, unblocks };
  },
};

// ===== 引用 =====
const Quote = {
  code: m => String(m.id).slice(-4),
  // AI 输出的 [引用#ab12]，后面允许带点多余内容
  RE: /^\[引用\s*[#＃]?\s*([0-9a-z]{4})[^\]]*\]\s*/i,
  // AI 模仿记录格式给自己的消息写编号，直接去掉
  TAG: /^\[#[0-9a-z]{4}\]\s*/i,
  take(s) {
    const m = String(s).match(this.RE);
    return m ? { code: m[1].toLowerCase(), rest: String(s).slice(m[0].length) } : { code: '', rest: String(s) };
  },
  // 给 AI 看的引用说明
  ref(m, list, pid) {
    if (!m.quote) return '';
    const q = list.find(x => x.id === m.quote);
    return q ? `[引用#${this.code(q)}：${Lang.body(q, pid).slice(0, 20)}]` : '[引用了一条已删除的消息]';
  },
  RULE: `- 引用：只有在要回复前面某条特定消息、而且不引用会搞混时才用（比如对方连发了几件不同的事、隔了好几条才回、群里同时有几个话题）。格式是在消息内容最前面写 [引用#编号]，编号就是聊天记录里每条消息前的 [#xxxx]。也可以引用自己之前说的话来补充。大部分消息不需要引用，接着回刚才那条时绝对不要引用，一轮最多一两次。不要给自己发的消息写编号。`,
};
