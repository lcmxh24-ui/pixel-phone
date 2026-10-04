// 图片类型 → 英文风格词。想加新风格直接在这里加一行
const IMG_STYLES = {
  截图: 'smartphone screenshot, mobile app UI, flat interface, status bar at top, crisp screen capture',
  宝丽来: 'polaroid instant photo, white border frame, soft faded colors, slight vignette, instant film look',
  夜拍: 'night smartphone photo, low light, city lights, slight noise, glowing street lamps, moody',
  随拍: 'casual smartphone photo, natural lighting, slightly imperfect framing, everyday life, candid',
  实拍: 'realistic photography, high detail, natural colors, shallow depth of field',
  胶片: 'analog film photography, 35mm film, Kodak Portra 400, natural film grain, warm faded colors, soft highlights, slight light leak, nostalgic',
  CCD: 'early 2000s CCD digital camera photo, compact digicam, direct on-camera flash, slightly overexposed, cool color cast, low dynamic range, sharp digital noise, y2k aesthetic, date stamp in corner',
  国画: 'traditional Chinese ink painting, xieyi style, ink wash, rice paper texture, elegant brushwork, empty space',
  水彩: 'watercolor painting, soft washes, visible paper texture, gentle color bleeding, hand painted',
  素描: 'pencil sketch, graphite shading, sketchbook paper, hand drawn lines',
  油画: 'oil painting, visible brush strokes, impasto, rich colors, canvas texture',
  插画: 'digital illustration, clean lines, soft shading, warm colors',
  像素画: 'pixel art, 16-bit retro game style, limited palette, crisp pixels',
  涂鸦: 'cute doodle, crayon drawing, childlike hand drawn style, simple shapes',
};
// 拍照类，谁都能发；其余算画作，只有填了画风偏好的角色会发
const PHOTO_STYLES = ['随拍', '实拍', '胶片', 'CCD', '截图', '宝丽来', '夜拍', '宠物截图'];
const AVATAR_EN = 'square avatar, centered composition, single subject, close-up, clean background, profile picture';

// 图片、表情包、识图、生图、换头像
const Media = {
  stickers: [],

  async load() {
    this.stickers = (await DB.get('kv', 'stickers'))?.value || [];
  },
  saveStickers() {
    return DB.put('kv', { id: 'stickers', value: this.stickers });
  },

  // ===== 图片处理 =====
  // 压缩到最长边 max 像素的 JPEG，减少本地存储占用
  shrink(src, max = 1024, q = 0.8) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', q));
      };
      img.onerror = () => rej(new Error('无法打开这张图'));
      img.src = src;
    });
  },
  async compressFile(file) {
    const u = URL.createObjectURL(file);
    try { return await this.shrink(u); } finally { URL.revokeObjectURL(u); }
  },

  // ===== 识图 =====
  async describe(url) {
    const source = url.startsWith('data:')
      ? { type: 'base64', media_type: url.slice(5, url.indexOf(';')), data: url.split(',')[1] }
      : { type: 'url', url };
    return API.claude('你是图片识别助手，只输出描述本身。', [{
      role: 'user',
      content: [
        { type: 'image', source },
        { type: 'text', text: '用中文简洁描述这张图，80 字以内：画面内容、图里的文字、人物表情或情绪、风格（照片/截图/表情包/插画等）。如果是表情包，说清楚它表达的意思。' },
      ],
    }], { maxTokens: 300, temperature: 0.3 });
  },
   // 拆出「类型|描述」。不在表里的类型也保留，交给 makePrompt 翻译成风格词
  parseStyle(s, def = '随拍') {
    const m = String(s).match(/^\s*([^|｜]{1,8})\s*[|｜]\s*(.+)$/);
    if (m) return { style: m[1].trim(), desc: m[2].trim() };
    return { style: def, desc: String(s).trim() };
  },
  // 「（风格）描述」拆回风格和描述。用户自己发的图没有前缀，按随拍处理
  splitLabel(label) {
    const m = String(label || '').match(/^（([^）]{1,8})）([\s\S]*)$/);
    return m ? { style: m[1], desc: m[2].trim() } : { style: '随拍', desc: String(label || '').trim() };
  },

  // 重新生成的弹窗：可以改类型、描述，加补充提示词。取消返回 null
  regenForm(label) {
    const { style, desc } = this.splitLabel(label);
    return new Promise(res => {
      const { el, mask, close } = modal(`<h3>重新生成图片</h3>
        <label class="field"><span>类型</span><input id="rg-s" value="${esc(style)}" list="rg-styles"></label>
        <datalist id="rg-styles">${Object.keys(IMG_STYLES).map(k => `<option value="${esc(k)}">`).join('')}</datalist>
        <label class="field"><span>画面描述</span><textarea id="rg-d" rows="3">${esc(desc)}</textarea></label>
        <label class="field"><span>补充提示词（可不填，写英文会原样加到最后）</span>
          <textarea id="rg-x" rows="2" placeholder="比如：一定是水豚，不要画成狗"></textarea></label>
        <div class="flex" style="justify-content:flex-end;gap:6px;margin-top:10px">
          <button class="btn ghost" data-a="no">取消</button><button class="btn" data-a="ok">生成</button></div>`);
      const done = v => { close(); res(v); };
      mask.onclick = e => { if (e.target === mask) done(null); };
      el.onclick = e => {
        const a = e.target.closest('[data-a]')?.dataset.a;
        if (a === 'no') return done(null);
        if (a !== 'ok') return;
        const d = $('#rg-d', el).value.trim();
        if (!d) return toast('写一下画面描述');
        done({ style: $('#rg-s', el).value.trim() || style, desc: d, extra: $('#rg-x', el).value.trim() });
      };
    });
  },

  // 弹窗 → 生图。成功返回 { url, desc, style }，失败或取消返回 null
  async regen(label, ch = null) {
    if (!S.settings.image.url) { toast('还没配置生图接口'); return null; }
    const v = await this.regenForm(label);
    if (!v) return null;
    toast('重新生成中，可能要等十几秒…', 4000);
    // 补充提示词：中文的并进描述一起翻译，纯英文的直接拼到最后
    const isEn = v.extra && !/[\u4e00-\u9fff]/.test(v.extra);
    const desc = v.extra && !isEn ? `${v.desc}。重点要求（必须遵守）：${v.extra}` : v.desc;
    try {
      let prompt = await this.makePrompt(desc, v.style, ch);
      if (isEn) prompt += ', ' + v.extra;
      const url = await this.genImage(prompt);
      if (!url) throw new Error('没有返回图片');
      return { url, desc: `（${v.style}）${v.desc}`, style: v.style };
    } catch (e) {
      Log.add('重新生成图片失败', e.message);
      toast('生成失败：' + e.message, 3000);
      return null;
    }
  },

  // 中文描述 → 英文提示词 + 风格词
    async makePrompt(desc, style, ch = null, purpose = 'photo') {
    const known = IMG_STYLES[style];
    let main = desc, custom = '';
    if (S.settings.image.translate !== false && S.settings.claude.key) {
      try {
               const sys = `You write prompts for an image generation model. Turn the Chinese description into ONE line of English, comma-separated visual keywords, under 60 words.
Describe what is visible: subject, setting, lighting, colors, mood. No text or watermarks.${known ? ' Do not add style words (style is added separately).' : ' A style is given in brackets: end the line with a few English keywords for that style.'}${purpose === 'avatar' ? ' It is a profile picture.' : ''} If the description contains 重点要求, follow it strictly and put the main subject first, stated clearly (e.g. "a capybara"). Output only the prompt.`;
        const art = ch?.artStyle && !PHOTO_STYLES.includes(style) ? `\n（作者的画风偏好：${ch.artStyle}）` : '';
        const st = known ? '' : `\n（风格：${style}）`;
                // 失败重试一次；取第一个有内容的行，去掉 "Prompt:" 之类的前缀
        let out = '';
        for (let i = 0; i < 2 && !out; i++) {
          try { out = await API.claude(sys, [{ role: 'user', content: desc + st + art }], { maxTokens: 300, temperature: 0.5 }); }
          catch (e) { if (i === 1) throw e; await sleep(1500); }
        }
        const line = out.split('\n').map(s => s.trim()).find(s => s && !/^(here|prompt)\b.*:$/i.test(s)) || '';
        main = line.replace(/^(prompt|english prompt)\s*[:：]\s*/i, '').replace(/^["“]|["”]$/g, '') || desc;
      } catch (e) {
        Log.add('生图提示词改写失败，改用原描述', e.message);
      }
    } else if (!known) custom = IMG_STYLES.随拍; // 没法翻译时退回随拍
    return [main, known || custom, purpose === 'avatar' ? AVATAR_EN : ''].filter(Boolean).join(', ');
  },

  // ===== 生图 =====
  async genImage(prompt) {
    const c = S.settings.image;
    if (!c.url || !prompt) return null;
    // 模式一：链接模板，直接作为图片地址
    if (c.url.includes('{prompt}')) return c.url.replace('{prompt}', encodeURIComponent(prompt));
    // 模式二：OpenAI 兼容 /images/generations
    let extra = {};
    try { extra = c.extra ? JSON.parse(c.extra) : {}; } catch { toast('生图额外参数不是合法 JSON，已忽略'); }
        // 2 分钟没出图就当失败，免得一直卡着
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 120e3);
    let r;
    try {
      r = await fetch(c.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(c.key ? { Authorization: 'Bearer ' + c.key } : {}) },
        body: JSON.stringify({ model: c.model, prompt, n: 1, ...extra }),
        signal: ac.signal,
      });
    } catch (e) {
      throw new Error(e.name === 'AbortError' ? '生图超时（超过 2 分钟）' : e.message);
    } finally {
      clearTimeout(timer);
    }
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error?.message || '生图 HTTP ' + r.status);
    const d = data.data?.[0] || data.images?.[0] || {};
    if (d.b64_json) return this.shrink('data:image/png;base64,' + d.b64_json, 768);
    return d.url || null;
  },

  // ===== 给 AI 看的格式 =====
   body(m, pid = activePid()) {
    if (m.type === 'transfer') return Wallet.text(m, pid);
    if (m.type === 'redpacket') return Wallet.rpText(m, pid);
    if (m.type === 'petinvite') return `[一起领养邀请：${m.content}${m.name ? '，想叫「' + m.name + '」' : '，名字没定'}，${{ pending: '等对方回应', ok: '对方同意了', no: '对方拒绝了' }[m.status]}]`;
    if (m.type === 'voice') return '[语音]' + m.content;
    if (m.type === 'image') return `[图片#${m.id.slice(-4)}：${m.desc || m.content || '未识别'}]`;
    if (m.type === 'sticker') return `[表情：${m.content}${m.desc ? '（' + m.desc.slice(0, 40) + '）' : ''}]`;
    if (m.type === 'sys') return `（${m.content}）`;
    return m.content;
  },

  preview(m) {
                  return { voice: '[语音]', ignore: '[没回]', image: '[图片]', sticker: '[表情]', transfer: '[转账]', redpacket: '[红包]', petinvite: '[领养邀请]', offline: '[线下]' }[m.type] || m.content;
  },

    rules(group = false, userName = '') {
    const p = group ? '名字：' : '';
    const r = [];
    const names = this.stickers.map(s => s.name).slice(0, 80);
    if (names.length) r.push(`- 发表情包：单独一行 ${p}[表情]表情名。只能用这些：${names.join('、')}。像真人一样偶尔用，别每次都发。`);
    const artists = S.chars.filter(c => c.artStyle).map(c => `${c.name}（${c.artStyle}）`);
       const arts = Object.keys(IMG_STYLES).filter(k => !PHOTO_STYLES.includes(k));
    r.push(`- 发图片：单独一行 ${p}[图片]类型|画面描述。偶尔用。
    拍照类型：随拍（手机随手拍的日常，比如饭菜、街景、天空）、实拍（认真拍的风景或物品）、胶片（有颗粒和怀旧感）、CCD（老式卡片机，闪光灯直打，千禧年感）、宝丽来、夜拍、截图（手机屏幕截图，比如聊天、游戏、App 页面）。按角色的性格和习惯选。也可以写别的类型，比如：拍立得、监控画面、扫描件。
  宠物截图：晒自己参与养的电子宠物时用，单独一行 ${p}[图片]宠物截图|宠物名字，会直接截一张养宠 App 的图。
  画作类型：${arts.join('、')}。
  ${artists.length ? `只有会画画的人才发画作：${artists.join('、')}，按各自画风选类型。其他人只发拍照类型。` : '大家都不画画，只发拍照类型。'}
  画面描述写具体：拍了什么、在哪、光线和氛围。例如：${p}[图片]随拍|刚出锅的番茄炒蛋，旁边一碗米饭，厨房暖黄的灯光`);
    r.push(`- 聊天里的图片显示为 [图片#编号：内容]。想换头像时单独一行 ${p}[换头像]#编号${S.settings.image.url ? `，或者 ${p}[换头像]生成：类型|头像的画面描述` : ''}。很少使用，真的想换才换。`);
    r.push(`- 发朋友圈：聊到的事让人想发朋友圈（分享、炫耀、吐槽、纪念），或者有人让他发而他也愿意时，单独一行 ${p}[发朋友圈]想发的内容（文案大意、想配什么图）。只写这一行，朋友圈会自动发出去，不用在聊天里把文案和配图再发一遍。偶尔用，不想发可以拒绝。`);
       r.push(Wallet.rules(p, userName || '对方', !group || !!userName, group && !!userName));
    r.push(Pet.rules(p));
    return r.join('\n');
  },

  // 解析 AI 输出的一行
  parseItem(s) {
    s = String(s).trim();
    let m;
    if ((m = s.match(/^\[语音\]\s*(.+)$/))) return { type: 'voice', content: m[1].trim() };
    if ((m = s.match(/^\[表情包?\]\s*(.+)$/) || s.match(/^\[表情包?[:：]\s*(.+?)\]$/))) return { type: 'sticker', content: m[1].trim() };
    if ((m = s.match(/^\[换头像\]\s*(.+)$/))) return { type: 'avatar', content: m[1].trim() };
    if ((m = s.match(/^\[发朋友圈\]\s*(.*)$/))) return { type: 'moment', content: m[1].trim() };
    if ((m = s.match(/^\[一起领养\]\s*(.+)$/))) return { type: 'petinvite', content: m[1].trim() };
    if ((m = s.match(/^\[领养\]\s*(.+)$/))) return { type: 'adopt', content: m[1].trim() };
    if ((m = s.match(/^\[宠物改名\]\s*(.+)$/))) return { type: 'petrename', content: m[1].trim() };
    if ((m = s.match(/^\[照顾宠物\]\s*(.+)$/))) return { type: 'petcare', content: m[1].trim() };
    if ((m = s.match(/^\[宠物串门\]\s*(.+)$/))) return { type: 'petvisit', content: m[1].trim() };
    if ((m = s.match(/^\[图片\]\s*(.+)$/) || s.match(/^\[图片(?:#\w+)?[:：]\s*(.+?)\]$/))) return { type: 'photo', content: m[1].trim() };
    if ((m = s.match(/^\[抢红包\]\s*(.*)$/))) return { type: 'grab', content: m[1].trim() };
    if ((m = s.match(/^\[红包\]\s*(.+)$/))) return { type: 'redpacket', content: m[1].trim() };
    if ((m = s.match(/^\[转账\]\s*(.+)$/))) return { type: 'transfer', content: m[1].trim() };
    if ((m = s.match(/^\[(收款|退还)\]\s*(.*)$/))) return { type: m[1] === '收款' ? 'accept' : 'refund', content: m[2].trim() };
    return { type: 'text', content: s };
  },

  findSticker(name) {
    const n = String(name).replace(/[（(].*$/, '').trim();
    return this.stickers.find(s => s.name === n)
      || this.stickers.find(s => s.name.includes(n) || n.includes(s.name));
  },

  // 发出前处理：表情名→图片，照片→生图，换头像→执行并返回系统提示
  async prepare(it, convId) {
    if (['transfer', 'accept', 'refund', 'redpacket', 'grab'].includes(it.type)) return Wallet.prepare(it, convId);
    if (it.type === 'sticker') {
      const s = this.findSticker(it.content);
      if (!s) return null; // 编了一个不存在的表情，直接丢掉
      return { ...it, content: s.name, extra: { url: s.url, desc: s.desc || '' } };
    }
       if (it.type === 'photo') {
      const { style, desc } = this.parseStyle(it.content);
      // 宠物截图：直接用宠物的点阵画，不走生图
      if (style === '宠物截图') {
        const pet = Pet.findForShot(it.sender, desc, convPid(convId));
        if (pet) {
          const label = `（宠物截图）${Pet.petLabel(pet)}${desc && desc !== pet.name ? '，' + desc : ''}`;
          return { sender: it.sender, type: 'image', content: label, extra: { url: Pet.snapshot(pet), desc: label, gen: true, style } };
        }
      }
      let url = null;
      if (S.settings.image.url) {
        try { url = await this.genImage(await this.makePrompt(desc, style, charById(it.sender))); }
        catch (e) { Log.add('生图失败，已显示成照片卡片', e.message); }
      }
      const label = `（${style}）${desc}`;
      return { sender: it.sender, type: 'image', content: label, extra: { url: url || '', desc: label, gen: true, style } };
    }
    if (it.type === 'adopt') return Pet.charAdopt(it.sender, it.content, convId);
    if (it.type === 'petinvite') return Pet.charInvite(it.sender, it.content, convId);
    if (it.type === 'petrename') return Pet.charRename(it.sender, it.content, convId);
    if (it.type === 'petcare') return Pet.charCare(it.sender, it.content, convId);
    if (it.type === 'petvisit') return Pet.charVisit(it.sender, it.content, convId);
    if (it.type === 'moment') return this.chatMoment(it, convId);
    if (it.type === 'avatar') return this.changeAvatar(it.sender, it.content, convId);
    return it;
  },
   // 聊天里决定发朋友圈：后台去发，发完在聊天里留一条系统提示。同一角色 5 分钟内最多一次
  _momentAt: {},
  chatMoment(it, convId) {
    const ch = charById(it.sender), pid = convPid(convId);
    if (!ch || !pid) return null;
    const wait = 5 * 60e3 - (Date.now() - (this._momentAt[ch.id] || 0));
    if (wait > 0) {
      Log.add(`${ch.name} 想发朋友圈，但刚发过`, `还要等 ${Math.ceil(wait / 60e3)} 分钟。内容：${it.content}`);
      return null;
    }
    this._momentAt[ch.id] = Date.now();
    const topic = `${ch.name}刚才在${Conv.label(convId, pid)}里决定发一条朋友圈${it.content ? '，想发的内容：' + it.content : ''}。按这个意思写，想配图就配图。`;
    toast(`${ch.name} 正在发朋友圈…`, 2500);
    Moments.post(ch.id, pid, null, topic)
      .then(p => p ? addMsg(convId, ch.id, `${ch.name} 发了一条朋友圈`, 'sys')
                   : Log.add(`${ch.name} 的朋友圈没发出去`, it.content))
      .catch(e => Log.add('聊天里发朋友圈失败', e.message));
    return null; // 这一行本身不显示在聊天里
  },

  async changeAvatar(charId, spec, convId) {
    const ch = charById(charId);
    if (!ch) return null;
    let url = null, desc = '';
    const gen = spec.match(/^生成\s*[:：]?\s*(.+)$/);
       if (gen) {
      const { style, desc: d } = this.parseStyle(gen[1], '插画');
      try { url = await this.genImage(await this.makePrompt(d, style, ch, 'avatar')); }
      catch (e) { Log.add('换头像生图失败', e.message); }
      desc = `（${style}）${d}`;
    }
 else {
      const code = spec.replace(/[#＃\s]/g, '').slice(0, 4);
      const m = (await getMsgs(convId)).reverse().find(x => x.url && x.id.endsWith(code));
      if (m) { url = m.url; desc = m.desc || m.content; }
    }
    if (!url) return null;
    ch.avatar = url;
    ch.avatarDesc = desc;
    await DB.put('chars', ch);
    return { sender: ch.id, type: 'sys', content: `${ch.name} 换了新头像` };
  },

  // ===== 显示 =====
  render(m) {
    const u = safeUrl(m.url), alt = esc(m.desc || m.content);
    if (m.type === 'sticker') return u ? `<img class="stk" src="${esc(u)}" alt="${alt}" loading="lazy">` : `[${esc(m.content)}]`;
    if (u) return `<img class="pimg" src="${esc(u)}" alt="${alt}" loading="lazy">`;
    return `<div class="photo"><div class="ph-ico">📷</div><div>${esc(m.content)}</div></div>`;
  },

  // ===== 发送 =====
  async pick(convId) {
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*';
    file.onchange = async () => {
      const f = file.files[0];
      if (!f) return;
      try { await this.sendImage(convId, await this.compressFile(f)); }
      catch (e) { toast('图片读取失败：' + e.message); }
    };
    const a = await actionSheet([
      { label: '📷 本地图片', value: 'local' },
      { label: '🔗 图片链接', value: 'link' },
      { label: '🐸 表情包', value: 'sticker' },
      { label: '💸 转账', value: 'transfer' },
      { label: '🧧 红包', value: 'rp' }
    ]);
    if (a === 'local') file.click();
    if (a === 'link') {
      const u = (await editText('图片链接', '', false))?.trim();
      if (!u) return;
      if (!/^https?:\/\//i.test(u)) return toast('链接要以 http 开头');
      await this.sendImage(convId, u);
    }
    if (a === 'sticker') this.stickerPicker(convId);
    if (a === 'transfer') Wallet.send(convId);
  if (a === 'rp') Wallet.sendRP(convId);
  },

  async sendImage(convId, url) {
    const m = await addMsg(convId, 'user', '[图片]', 'image', { url, desc: '' });
    if (S.settings.claude.key) {
      toast('识别图片中…');
      try {
        m.desc = await this.describe(url);
        m.content = m.desc;
        await DB.put('msgs', m);
        ChatUI.refresh();
      } catch (e) { toast('识别失败：' + e.message, 3000); }
    }
  },

  stickerPicker(convId) {
    if (!this.stickers.length) return toast('表情包库是空的，先去桌面「表情包」添加');
    const { el, mask, close } = modal(`<h3>表情包</h3><div class="stk-grid">${this.stickers.map(s =>
      `<button class="stk-cell" data-sid="${s.id}" aria-label="${esc(s.name)}"><img src="${esc(safeUrl(s.url))}" alt=""><small>${esc(s.name)}</small></button>`).join('')}</div>
      <button class="btn ghost" data-close style="margin-top:8px">关闭</button>`);
    el.onclick = async e => {
      if (e.target.closest('[data-close]')) return close();
      const b = e.target.closest('[data-sid]');
      if (!b) return;
      const s = this.stickers.find(x => x.id === b.dataset.sid);
      close();
      await addMsg(convId, 'user', s.name, 'sticker', { url: s.url, desc: s.desc || '' });
    };
    mask.onclick = e => { if (e.target === mask) close(); };
  },

  // ===== 气泡菜单里的图片操作 =====
  actions(m) {
    const a = [{ label: '查看大图', value: 'm_view' }, { label: '存进表情包', value: 'm_save' }, { label: '设为我的头像', value: 'm_me' }];
    if (m.type === 'image') a.push({ label: '重新识别', value: 'm_desc' });
    return a;
  },

  async doAction(a, m) {
    if (!String(a).startsWith('m_')) return false;
    if (a === 'm_view') {
      const { el, close } = modal(`<img class="big-img" src="${esc(safeUrl(m.url))}" alt="${esc(m.desc || m.content)}"><p>${esc(m.desc || '')}</p>`);
      el.onclick = close;
    }
    if (a === 'm_save') {
      const name = (await editText('表情名字', m.type === 'sticker' ? m.content : '', false))?.trim();
      if (!name) return true;
      this.stickers.push({ id: uid(), name, url: m.url, desc: m.desc || '' });
      await this.saveStickers();
      toast('已存进表情包');
    }
    if (a === 'm_me') {
      const p = persona(ChatUI.ctx(m.convId).pid);
      p.avatar = m.url;
      await saveSettings();
      toast('已设为头像');
      ChatUI.refresh();
    }
    if (a === 'm_desc') {
      toast('识别中…');
      try { m.desc = await this.describe(m.url); m.content = m.desc; await DB.put('msgs', m); ChatUI.refresh(); }
      catch (e) { toast('识别失败：' + e.message, 3000); }
    }
    if (a === 'm_regen') {
      const r = await this.regen(m.desc || m.content, charById(m.sender));
      if (!r) return true;
      Object.assign(m, { url: r.url, desc: r.desc, content: r.desc, style: r.style });
      await DB.put('msgs', m);
      ChatUI.refresh();
      toast('已换成新图');
    }
    return true;
  },

  // ===== 表情包表单 =====
  stickerForm(s = {}) {
    return new Promise(res => {
      const { el, close } = modal(`<h3>${s.id ? '编辑' : '添加'}表情包</h3>
        <label class="field"><span>名字（角色按名字挑表情）</span><input id="sn" value="${esc(s.name || '')}" placeholder="比如：委屈、狗头、晚安"></label>
        <label class="field"><span>图片链接</span><input id="su" value="${esc(s.url || '')}" placeholder="https://..." autocapitalize="off"></label>
        <div class="flex" style="justify-content:flex-end;gap:6px;margin-top:10px">
          <button class="btn ghost" data-a="no">取消</button><button class="btn" data-a="ok">确定</button></div>`);
      el.onclick = e => {
        const a = e.target.dataset.a;
        if (a === 'no') { close(); res(null); }
        if (a === 'ok') {
          const name = $('#sn', el).value.trim(), url = $('#su', el).value.trim();
          if (!/^(https?:|data:image\/)/i.test(url)) return toast('链接要以 http 开头');
          close();
          res({ name: name || '表情', url });
        }
      };
    });
  },

  async describeSticker(s) {
    if (!S.settings.claude.key) return;
    try { s.desc = await this.describe(s.url); await this.saveStickers(); }
    catch (e) { toast(`「${s.name}」识别失败：${e.message}`, 3000); }
  },
};

// ===== 表情包库 =====
Views.stickers = async () => {
  const list = Media.stickers;
  screen().innerHTML = topbar('表情包', '<button class="btn ghost" data-act="add" aria-label="添加表情包">＋</button>') + `<div class="body">
    <div class="card flex" style="gap:6px;flex-wrap:wrap">
      <button class="btn ghost" data-act="batch">批量导入</button>
      <button class="btn ghost" data-act="scan">识别未识别的（${list.filter(s => !s.desc).length}）</button>
    </div>
    <p class="empty">所有角色共用。识别过的表情，角色能看懂你发的是什么意思。点表情可以编辑或删除。</p>
    ${list.length ? `<div class="stk-grid">${list.map(s => `<button class="stk-cell" data-sid="${s.id}" aria-label="${esc(s.name)}">
      <img src="${esc(safeUrl(s.url))}" alt="" loading="lazy"><small>${s.desc ? '' : '· '}${esc(s.name)}</small></button>`).join('')}</div>`
      : '<p class="empty">还没有表情包</p>'}
  </div>`;
  screen().onclick = async e => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'add') {
      const v = await Media.stickerForm();
      if (!v) return;
      const s = { id: uid(), ...v, desc: '' };
      list.push(s);
      await Media.saveStickers();
      Router.render();
      await Media.describeSticker(s);
      return Router.render();
    }
    if (a === 'batch') {
      const t = await editText('每行一个：名字 链接');
      if (!t) return;
      let n = 0;
      for (const line of t.split('\n')) {
        const url = line.match(/https?:\/\/\S+/)?.[0];
        if (!url) continue;
        const name = line.replace(url, '').replace(/[:：,，|]/g, ' ').trim() || '表情' + (list.length + 1);
        list.push({ id: uid(), name, url, desc: '' });
        n++;
      }
      await Media.saveStickers();
      toast(`导入了 ${n} 个`);
      return Router.render();
    }
    if (a === 'scan') {
      const todo = list.filter(s => !s.desc);
      if (!todo.length) return toast('都识别过了');
      for (let i = 0; i < todo.length; i++) { toast(`识别中 ${i + 1}/${todo.length}`); await Media.describeSticker(todo[i]); }
      return Router.render();
    }
    const cell = e.target.closest('[data-sid]');
    if (!cell) return;
    const s = list.find(x => x.id === cell.dataset.sid);
    const act = await actionSheet([{ label: '编辑', value: 'edit' }, { label: '重新识别', value: 'desc' }, { label: '删除', value: 'del', danger: true }]);
    if (act === 'edit') { const v = await Media.stickerForm(s); if (v) { Object.assign(s, v); await Media.saveStickers(); } }
    if (act === 'desc') { toast('识别中…'); await Media.describeSticker(s); }
    if (act === 'del') { Media.stickers = list.filter(x => x !== s); await Media.saveStickers(); }
    Router.render();
  };
};

window.addEventListener('load', () => Media.load());
