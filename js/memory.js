// 记忆系统：分批总结 → 每个参与者各存一份 → 分级 → 向量召回。按人设隔离，失败都会记日志
const Memory = {
  _busy: {},
  _q: { text: null, vec: null },
  CHUNK: 80, // 每次总结最多处理的消息条数
  // 消息的"进度时间"：插在过去的线下剧情按写入时间算
  mt: m => Math.max(m.ts, m.savedAt || 0),

  // 本地向量：中文单字 + 双字哈希，未配置向量接口或接口失败时使用
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

  // 调向量接口，失败自动重试 2 次。没填地址返回 null
  async apiEmbed(text) {
    let last;
    for (let i = 0; i < 3; i++) {
      try {
        const r = await API.embed([text]);
        if (!r) return null;
        if (!Array.isArray(r[0]) || !r[0].length) throw new Error('返回里没有向量');
        return r[0];
      } catch (e) {
        last = e;
        if (i < 2) await sleep(1500 * (i + 1));
      }
    }
    throw last;
  },

  async vectorize(text) {
    const local = { vecType: 'local', vec: this.localVec(text), dim: 512 };
    if (!S.settings.embed.url) return { ...local, vecErr: false };
    try {
      const v = await this.apiEmbed(text);
      if (v) return { vecType: 'api', vec: v, dim: v.length, vecErr: false };
    } catch (e) {
      Log.add('向量化失败，这条记忆暂用本地匹配', e.message);
    }
    return { ...local, vecErr: true };
  },

  // 同一段查询只请求一次（群聊里多个成员共用）
  async queryApiVec(query) {
    if (this._q.text === query) return this._q.vec;
    let v = null;
    try { v = await this.apiEmbed(query); }
    catch (e) { Log.add('查询向量失败，本次改用本地匹配召回', e.message); }
    this._q = { text: query, vec: v };
    return v;
  },

    async add(charId, personaId, text, level = 'normal', source = '', at = null) {
    const m = { id: uid(), charId, personaId, text, level, source, ts: Date.now(), ...(at ? { at } : {}), ...(await this.vectorize(text)) };
    await DB.put('mems', m);
    return m;
  },

  async update(m, text) {
    Object.assign(m, { text }, await this.vectorize(text));
    await DB.put('mems', m);
  },

      async retrieve(charId, personaId, query, skip = null) {
    const cfg = S.settings.memory;
    // 来自当前会话、而且对应的聊天原文还在窗口里的记忆，跳过，避免和聊天记录重复
    const inWindow = m => skip?.since && m.source === skip.conv && m.at && m.at >= skip.since;
    const mems = (await DB.byIndex('mems', 'charId', charId))
      .filter(m => m.personaId === personaId && !inWindow(m));
    const imp = mems.filter(m => m.level === 'important')
      .sort((a, b) => b.ts - a.ts).slice(0, Number(cfg.importantCap));
    // 只有最近几条重要记忆常驻，更早的重要记忆和普通记忆一起按相关度召回
    const pinN = Number(cfg.importantPin ?? 3);
    const important = imp.slice(0, pinN).reverse();
    const pool = [...imp.slice(pinN), ...mems.filter(m => m.level !== 'important')];
    if (!pool.length || !query) return { important, normal: [] };

    const qApi = pool.some(m => m.vecType === 'api') ? await this.queryApiVec(query) : null;
    const qLocal = this.localVec(query);
    let mismatch = 0;
    const score = m => {
      if (m.vecType === 'local') return this.cos(qLocal, m.vec);
      if (qApi && m.vec?.length === qApi.length) return this.cos(qApi, m.vec);
      if (qApi) mismatch++;
      return this.cos(qLocal, this.localVec(m.text));
    };
    const picked = pool
      .map(m => ({ m, s: score(m) }))
      .filter(x => x.s >= Number(cfg.threshold))
      .sort((a, b) => b.s - a.s)
      .slice(0, Number(cfg.topK))
      .map(x => x.m)
      .sort((a, b) => a.ts - b.ts);
    if (mismatch) Log.add(`有 ${mismatch} 条记忆的向量维度和当前设置不符`, '去「记忆体检」点「修复异常向量」');
    return { important, normal: picked };
  },

     async retrieveText(charId, personaId, query, title = '', skip = null) {
    const { important, normal } = await this.retrieve(charId, personaId, query, skip);
    if (!important.length && !normal.length) return '';
    const fmt = m => `- [${new Date(m.at || m.ts).toLocaleDateString('zh-CN')}] ${m.text}`;
    const out = [];
    if (important.length) out.push(`【${title}记得的事】\n` + important.map(fmt).join('\n'));
    if (normal.length) out.push(`【${title}可能会联想到的旧事】\n` + normal.map(fmt).join('\n'));
    out.push(`（这些是${title}脑子里的背景，用来保持前后一致，不是要说的话题。真人聊天很少主动翻旧账：只有当前话题直接碰到、或者确实好笑/有意义时才自然带一句，一段对话里最多一次，大多数时候一句都不提。不要为了显得"记得"而提。）`);
    return out.join('\n\n');
  },

  parseJSON(text) {
    const o = text.match(/{[\s\S]*}/), a = text.match(/\[[\s\S]*\]/);
    for (const s of [o?.[0], a?.[0]]) { if (!s) continue; try { return JSON.parse(s); } catch { /* 试下一个 */ } }
    throw new Error('总结结果不是有效 JSON（可能输出被截断）');
  },

  // 某个人设下所有可能产生记忆的会话
  convIds(pid) {
    const ids = S.chars.map(c => Conv.dm(pid, c.id));
    for (const g of S.groups) if (g.personaId === pid) ids.push(Conv.g(g.id));
    for (let i = 0; i < S.chars.length; i++) for (let j = i + 1; j < S.chars.length; j++) ids.push(Conv.cc(pid, S.chars[i].id, S.chars[j].id));
    for (const r of Reading.rooms) if (r.personaId === pid) ids.push(Conv.r(r.id));
    return ids;
  },

  async state(convId) {
    const key = 'memstate_' + convId;
    return (await DB.get('kv', key)) || { id: key, lastTs: 0, fails: 0, lastError: '' };
  },

  async pendingCount(convId) {
    const st = await this.state(convId);
       return (await getMsgs(convId)).filter(m => this.mt(m) > st.lastTs).length;
  },

  // 单聊/群聊：按你发的消息数计轮；角色间私聊：满 6 条就总结。每次最多处理 CHUNK 条
  async maybeSummarize(convId, force = false) {
    const info = Conv.parse(convId);
    const chars = Conv.members(convId);
    if (!chars.length || !info.pid) return 0;
    const st = await this.state(convId);
        const pending = (await getMsgs(convId)).filter(m => this.mt(m) > st.lastTs);
    if (!pending.length) return 0;
    const every = Number(S.settings.memory.every) || 10;
    const userN = pending.filter(m => m.sender === 'user').length;
    const due = force || pending.length >= this.CHUNK ||
      (info.type === 'cc' ? pending.length >= 6 : userN >= every || (info.type === 'g' && pending.length >= every * 4));
    if (!due || this._busy[convId]) return 0;
    this._busy[convId] = true;

    const msgs = pending.slice(0, this.CHUNK);
    const names = chars.map(c => c.name);
    const pname = persona(info.pid).name;
    const kind = { dm: `${names[0]}和${pname}的私聊`, g: `群聊「${info.group?.name}」`, cc: `${names.join('和')}之间的私聊`, r: Conv.label(convId, info.pid) }[info.type];
    try {
            // 全部处理完时按最晚的进度时间记；没处理完就按这一批最后一条
      const lastTs = msgs.length < pending.length ? msgs.at(-1).ts : Math.max(...msgs.map(m => this.mt(m)));
      // 线下剧情已经单独写过记忆，这里跳过
      const useful = msgs.filter(m => !m.memDone);
      if (!useful.length) {
        Object.assign(st, { lastTs, fails: 0, lastError: '' });
        await DB.put('kv', st);
        return 0;
      }
            const hm = ts => new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
      const log = useful.map((m, k) => {
        const day = Prompt.dayText(m.ts);
        const head = k === 0 || day !== Prompt.dayText(useful[k - 1].ts) ? `（${day}）\n` : '';
        return `${head}[${hm(m.ts)}] ${Prompt.line(m, info.pid)}`;
      }).join('\n');

      const system = `你是记忆整理助手。阅读一段手机聊天记录（${kind}），分别从 ${names.join('、')} 各自的视角，提炼值得长期记住的信息。
要求：
1. 每条记忆是一句完整、独立的陈述，写清楚是谁、做了什么或说了什么，不用指代不明的代词。
2. 分级（important 要少，一段聊天通常 0 到 1 条）：
   - important：关系的明显变化、还没兑现的约定、改变了两人相处方式的事件、对方第一次透露的重要身份或经历。
   - normal：喜好、日常细节、闲聊里的梗、一般情绪。
3. 相似内容合并，寒暄和已经说过的旧事忽略。每人 0 到 4 条，宁少勿多。
4. 涉及时间的一律写成具体日期，比如"3月6日约好一起去吃火锅"，不要写"今天""明天""昨天""下周"。
5. 不要记录人设里本来就有的东西：某人表现出了自己的性格、提到自己的喜好或能力，这些不算新信息，不用记。只记这段聊天里真正发生的新事情。
6. 只输出 JSON，不要其他文字。
键名必须是这些名字：${names.join('、')}。格式：{"名字":[{"text":"...","level":"normal"}]}`;
      const out = await API.claude(system,
        [{ role: 'user', content: `日期：${new Date(msgs.at(-1).ts).toLocaleDateString('zh-CN')}\n\n${log}` }],
        { temperature: 0.3, maxTokens: Math.min(4000, 600 + 500 * chars.length) });
      const obj = this.parseJSON(out);

      // 返回的名字一个都对不上，说明格式错了，不推进进度
      if (!Array.isArray(obj) && Object.keys(obj).length && !names.some(n => n in obj)) {
        throw new Error('总结结果里的名字和角色对不上：' + Object.keys(obj).join('、'));
      }

      let total = 0;
      for (const c of chars) {
        const arr = Array.isArray(obj) ? (chars.length === 1 ? obj : []) : (obj[c.name] || []);
        for (const it of arr) {
          if (!it?.text) continue;
                    await this.add(c.id, info.pid, it.text, it.level === 'important' ? 'important' : 'normal', convId, msgs.at(-1).ts);
          total++;
        }
      }
            // 全部处理完时按最晚的进度时间记；没处理完就按这一批最后一条，免得跳过后面的消息
      Object.assign(st, { lastTs, fails: 0, lastError: '' });
      await DB.put('kv', st);
      return total;
    } catch (e) {
      st.fails = (st.fails || 0) + 1;
      st.lastError = e.message;
      await DB.put('kv', st);
      Log.add(`记忆总结失败：${kind}`, `${e.message}（已连续失败 ${st.fails} 次，下次会自动重试）`);
      return 0;
    } finally {
      delete this._busy[convId];
    }
  },

  // 体检页用：把当前人设所有积压的消息都总结完
  async summarizeAll(pid, onProgress) {
    let total = 0;
    for (const id of this.convIds(pid)) {
      for (let guard = 0; guard < 50; guard++) {
        if (!(await this.pendingCount(id))) break;
        const before = (await this.state(id)).lastTs;
        total += await this.maybeSummarize(id, true);
        if ((await this.state(id)).lastTs === before) break; // 失败了，跳到下一个会话
        onProgress?.(total);
      }
    }
    return total;
  },
};
