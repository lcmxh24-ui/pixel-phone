// 接口封装：Claude / 向量 / 语音 + 缓存统计 + 连接测试。都是浏览器直连，Key 只存在本机
const API = {
  // 缓存统计：input 是没走缓存的部分，read 是命中，write 是写入缓存
  stats: { calls: 0, input: 0, read: 0, write: 0 },

  async loadStats() {
    this.stats = (await DB.get('kv', 'cacheStats'))?.value || this.stats;
  },

  record(u) {
    if (!u) return;
    const s = this.stats;
    s.calls++;
    s.input += u.input_tokens || 0;
    s.read += u.cache_read_input_tokens || 0;
    s.write += u.cache_creation_input_tokens || 0;
    DB.put('kv', { id: 'cacheStats', value: s });
  },

  hitRate() {
    const s = this.stats, total = s.input + s.read + s.write;
    return total ? Math.round(s.read / total * 100) : 0;
  },

    async claude(system, messages, opt = {}) {
    const c = S.settings.claude;
    if (!c.key) throw new Error('还没填 Claude API Key');
    const body = {
      model: c.model,
      max_tokens: Number(opt.maxTokens || c.maxTokens || 1024),
      system,
      messages,
    };
    // 温度留空，或这个模型已知不支持时，就不发送 temperature
    const t = opt.temperature ?? c.temperature;
    const noTemp = (S.settings.noTempModels || []).includes(c.model);
    if (!noTemp && t !== '' && t != null && !isNaN(Number(t))) {
      body.temperature = Math.min(1, Math.max(0, Number(t)));
    }
        for (let tryN = 0; ; tryN++) {
      // 超时保护：网页切到后台时请求可能被挂起，3 分钟没结果就当失败处理并记日志
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), 180e3);
      let r;
      try {
        r = await fetch(c.baseUrl.replace(/\/+$/, '') + '/v1/messages', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': c.key,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify(body),
          signal: ac.signal,
        });
           } catch (e) {
        clearTimeout(timer);
        if (e.name === 'AbortError') throw new Error('请求超时（网页可能被切到后台，浏览器暂停了请求）');
        // Load failed / Failed to fetch：连接被断开，多半是偶发，等一下重试，最多 2 次
        if (tryN < 2) { await sleep(2000 * (tryN + 1)); continue; }
        throw new Error('网络请求失败（' + e.message + '），可能是中转站断开或网页切到了后台');
      }
      clearTimeout(timer);
      const data = await r.json().catch(() => ({}));
      if (r.ok) {
        this.record(data.usage);
        return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
      }
      const msg = data.error?.message || 'HTTP ' + r.status;
      // 模型不支持采样参数：去掉温度重试，并记住这个模型
      if (r.status === 400 && 'temperature' in body && /temperature|sampling/i.test(msg)) {
        delete body.temperature;
        S.settings.noTempModels = [...new Set([...(S.settings.noTempModels || []), c.model])];
        saveSettings();
        continue;
      }
      if ((r.status === 429 || r.status === 529) && tryN < 2) { await sleep(3000 * (tryN + 1)); continue; }
      throw new Error(msg);
    }
  },

    // OpenAI 兼容的 /embeddings。没填地址返回 null，记忆改用本地匹配
  async embed(texts) {
    const e = S.settings.embed;
    if (!e.url) return null;
    // 只填到 /v1 也行，自动补上 /embeddings（和 SillyTavern 一样）
    let url = e.url.trim().replace(/\/+$/, '');
    if (!/\/embeddings$/i.test(url)) url = url.replace(/\/embedding$/i, '') + '/embeddings';
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(e.key ? { Authorization: 'Bearer ' + e.key } : {}) },
      // dimensions 是 OpenAI 兼容参数，百炼 v3/v4、OpenAI 3 系列都支持，不支持的模型留空即可
      body: JSON.stringify({ model: e.model, input: texts, ...(Number(e.dims) > 0 ? { dimensions: Number(e.dims) } : {}) }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error?.message || 'HTTP ' + r.status + '（检查接口地址）');
    return data.data.map(d => d.embedding);
  },

  // OpenAI 兼容的 /audio/speech。force 为 true 时跳过"启用"开关，给测试用
  async speak(text, force = false) {
    const t = S.settings.tts;
    if ((!t.enabled && !force) || !t.url) return false;
    const r = await fetch(t.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(t.key ? { Authorization: 'Bearer ' + t.key } : {}) },
      body: JSON.stringify({ model: t.model, input: text, voice: t.voice }),
    });
    if (!r.ok) throw new Error('语音接口 HTTP ' + r.status);
    const url = URL.createObjectURL(await r.blob());
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    await audio.play();
    return true;
  },

  // 各接口连接测试，成功返回说明文字，失败抛出错误
  async test(kind) {
    if (kind === 'embed') {
      if (!S.settings.embed.url) throw new Error('还没填向量接口地址');
      const v = (await this.embed(['测试一下向量接口']))?.[0];
      if (!Array.isArray(v) || !v.length) throw new Error('返回格式不对，没有拿到向量');
      return `连接成功，向量维度 ${v.length}`;
    }
    if (kind === 'image') {
      if (!S.settings.image.url) throw new Error('还没填生图接口地址');
      const url = await Media.genImage('pixel art, a small green frog wearing a yellow hat');
      if (!url) throw new Error('接口没有返回图片');
      // 链接模板模式不会真正请求，这里加载一次确认图片能打开
      await new Promise((res, rej) => {
        const img = new Image();
        const timer = setTimeout(() => rej(new Error('图片加载超时')), 60e3);
        img.onload = () => { clearTimeout(timer); res(); };
        img.onerror = () => { clearTimeout(timer); rej(new Error('图片打不开，检查地址或参数')); };
        img.src = url;
      });
      return url;
    }
    if (kind === 'tts') {
      if (!S.settings.tts.url) throw new Error('还没填语音接口地址');
      await this.speak('你好，这是一条测试语音。', true);
      return '连接成功，正在播放';
    }
    throw new Error('未知的测试类型');
  },
};
