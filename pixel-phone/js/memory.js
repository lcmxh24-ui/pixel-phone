// 记忆系统：定期总结 → 每个参与者各存一份 → 分级 → 向量召回。按人设隔离
const Memory = {
  _busy: {},
  _q: { text: null, vec: null },

  // 本地向量：中文单字 + 双字哈希，未配置向量接口时使用
  localVec(text) {
    const D = 512, v = new Array(D).fill(0);
    const t = String(text).replace(/\s+/g, '');
    const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h % D; };
    for (let i = 0; i < t.length; i++) {
      v[hash(t[i])] += 0.5;
      if (i < t.length - 1) v[hash(t.slice(i, i + 2))] += 1;
    }
    const n = Math.hypot(...v) || 1;
    return v.map(x => x / n);
  },

  cos(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    let d = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
    return d / (Math.sqrt(na * nb) || 1);
  },

  async vectorize(text) {
    try {
      const r = await API.embed([text]);
      if (r) return { vecType: 'api', vec: r[0] };
    } catch (e) { toast('向量接口失败，已改用本地匹配'); }
    return { vecType: 'local', vec: this.localVec(text) };
  },

  // 同一段查询只请求一次向量接口（群聊里多个成员共用）
  async queryApiVec(query) {
    if (this._q.text === query) return this._q.vec;
    let v = null;
    try { v = (await API.embed([query]))?.[0] || null; } catch { /* 失败时 api 向量的记忆得 0 分 */ }
    this._q = { text: query, vec: v };
    return v;
  },

  async add(charId, personaId, text, level = 'normal', source = '') {
    const m = { id: uid(), charId, personaId, text, level, source, ts: Date.now(), ...(await this.vectorize(text)) };
    await DB.put('mems', m);
    return m;
  },

  async update(m, text) {
    Object.assign(m, { text }, await this.vectorize(text));
    await DB.put('mems', m);
  },

  async retrieve(charId, personaId, query) {
    const cfg = S.settings.memory;
    const mems = (await DB.byIndex('mems', 'charId', charId)).filter(m => m.personaId === personaId);
    const important = mems.filter(m => m.level === 'important')
      .sort((a, b) => b.ts - a.ts).slice(0, Number(cfg.importantCap)).reverse();
    const normal = mems.filter(m => m.level !== 'important');
    if (!normal.length || !query) return { important, normal: [] };
    const qApi = normal.some(m => m.vecType === 'api') ? await this.queryApiVec(query) : null;
    const qLocal = this.localVec(query);
    const picked = normal
      .map(m => ({ m, s: this.cos(m.vecType === 'api' ? qApi : qLocal, m.vec) }))
      .filter(x => x.s >= Number(cfg.threshold))
      .sort((a, b) => b.s - a.s)
      .slice(0, Number(cfg.topK))
      .map(x => x.m)
      .sort((a, b) => a.ts - b.ts);
    return { important, normal: picked };
  },

  async retrieveText(charId, personaId, query, title = '') {
    const { important, normal } = await this.retrieve(charId, personaId, query);
    const fmt = m => `- [${new Date(m.ts).toLocaleDateString('zh-CN')}] ${m.text}`;
    const out = [];
    if (important.length) out.push(`【${title}的重要记忆】\n` + important.map(fmt).join('\n'));
    if (normal.length) out.push(`【${title}的相关回忆】\n` + normal.map(fmt).join('\n'));
    return out.join('\n\n');
  },

  parseJSON(text) {
    const o = text.match(/{[\s\S]*}/), a = text.match(/\[[\s\S]*\]/);
    for (const s of [o?.[0], a?.[0]]) { if (!s) continue; try { return JSON.parse(s); } catch { /* 试下一个 */ } }
    throw new Error('总结结果格式不对');
  },

  // 单聊/群聊：按你发的消息数计轮；角色间私聊：满 6 条就总结
  async maybeSummarize(convId, force = false) {
    const info = Conv.parse(convId);
    const chars = Conv.members(convId);
    if (!chars.length || !info.pid) return 0;
    const key = 'memstate_' + convId;
    const st = (await DB.get('kv', key)) || { id: key, lastTs: 0 };
    const msgs = (await getMsgs(convId)).filter(m => m.ts > st.lastTs);
    if (!msgs.length) return 0;
    const every = Number(S.settings.memory.every) || 10;
    const userN = msgs.filter(m => m.sender === 'user').length;
    const due = force || (info.type === 'cc' ? msgs.length >= 6 : userN >= every || (['g', 'r'].includes(info.type) && msgs.length >= every * 4));
    if (!due || this._busy[convId]) return 0;
    this._busy[convId] = true;
    try {
      const names = chars.map(c => c.name);
      const pname = persona(info.pid).name;
      const kind = { dm: `${names[0]}和${pname}的私聊`, g: `群聊「${info.group?.name}」`, r: `和${pname}一起看《${Reading.book(info.room?.bookId)?.title || '?'}》时的聊天`,
cc: `${names.join('和')}之间的私聊` }[info.type];
      const log = msgs.map(m => Prompt.line(m, info.pid)).join('\n');
      const system = `你是记忆整理助手。阅读一段手机聊天记录（${kind}），分别从 ${names.join('、')} 各自的视角，提炼值得长期记住的信息。
要求：
1. 每条记忆是一句完整、独立的陈述，写清楚是谁、做了什么或说了什么，不用指代不明的代词。
2. 分级：
   - important：关系变化、约定承诺、重要事件、对方的重要个人信息（喜好、经历、身份）、强烈情绪。
   - normal：日常话题、一般细节、闲聊。
3. 相似内容合并，寒暄忽略。每人 0 到 6 条。
4. 约定和计划要写明约定的时间，以及对方是否答应了，比如"林夏和小雨约了周六下午去看展，小雨答应了"。这样之后能判断这件事已经过去。
5. 只输出 JSON，不要其他文字。格式：{"名字":[{"text":"...","level":"normal"}]}`;
      const out = await API.claude(system, [{ role: 'user', content: `日期：${new Date().toLocaleDateString('zh-CN')}\n\n${log}` }], { temperature: 0.3, maxTokens: 2000 });
      const obj = this.parseJSON(out);
      let total = 0;
      for (const c of chars) {
        const arr = Array.isArray(obj) ? (chars.length === 1 ? obj : []) : (obj[c.name] || []);
        for (const it of arr) {
          if (!it?.text) continue;
          await this.add(c.id, info.pid, it.text, it.level === 'important' ? 'important' : 'normal', convId);
          total++;
        }
      }
      st.lastTs = msgs.at(-1).ts;
      await DB.put('kv', st);
      return total;
    } finally {
      delete this._busy[convId];
    }
  },
};
