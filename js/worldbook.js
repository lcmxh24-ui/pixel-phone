// 世界书：常驻 / 关键词触发；全部角色共用 / 绑定指定角色
const WB = {
  list: [],

  async init() {
    this.list = (await DB.get('kv', 'worldbook'))?.value || [];
    // 一次性把世界书条目加进预设，放在「人际关系」后面
    const st = S.settings;
    if (!st.wbPatched) {
      const i = st.entries.findIndex(x => x.name === '人际关系');
      st.entries.splice(i < 0 ? st.entries.length : i + 1, 0, ...WB_ENTRIES());
      st.wbPatched = true;
    }
  },
  save() { return DB.put('kv', { id: 'worldbook', value: this.list }); },

  keys(e) {
    return String(e.keys || '').split(/[,，、;；\n]/).map(s => s.trim().toLowerCase()).filter(Boolean);
  },

  // 绑定为空 = 所有角色；否则只要在场角色里有一个被绑定就生效
  forChars(ids) {
    return this.list
      .filter(e => e.enabled && String(e.content || '').trim() && (!e.chars?.length || e.chars.some(c => ids.includes(c))))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  scan(msgs) {
    const n = Number(S.settings.worldbook?.scanDepth) || 6;
    return msgs.slice(-n).map(m => [m.content, m.desc].filter(Boolean).join(' ')).join('\n');
  },

  // constant 放进缓存区，triggered 放在缓存之后
  build(ids, scanText) {
    const es = this.forChars(ids), t = String(scanText || '').toLowerCase();
    const join = arr => arr.map(e => e.content.trim()).join('\n\n');
    return {
      constant: join(es.filter(e => e.constant)),
      triggered: join(es.filter(e => !e.constant && this.keys(e).some(k => t.includes(k)))),
    };
  },
};

const WB_ENTRIES = () => [
  { id: uid(), name: '世界书：常驻', enabled: true, scope: 'all', position: 'system', role: 'user', depth: 0, content: '【世界设定】\n{{世界书}}' },
  { id: uid(), name: '世界书：触发', enabled: true, scope: 'all', position: 'system', role: 'user', depth: 0, content: '【相关设定】\n{{世界书触发}}' },
];

Views.worldbook = async () => {
  const list = WB.list;
  const bound = e => e.chars?.length ? '绑定：' + e.chars.map(id => charById(id)?.name).filter(Boolean).join('、') : '全部角色';
  screen().innerHTML = topbar('世界书', '<button class="btn ghost" data-act="add" aria-label="新建条目">＋</button>') + `<div class="body">
    <div class="card">${field('扫描最近几条消息找关键词', 'worldbook.scanDepth', { type: 'number' })}</div>
    <p class="empty">📌 常驻：每次都带上，走缓存。🔑 关键词：最近的聊天里出现关键词才带上。不绑定角色就是所有角色共用。</p>
    <div class="list">${list.map(e => `<button class="item" data-id="${e.id}"><div class="grow">
      <b>${e.enabled ? '' : '⏸ '}${esc(e.name)}</b>
      <small class="ellipsis">${e.constant ? '📌 常驻' : '🔑 ' + esc(e.keys || '（没填关键词）')} · ${esc(bound(e))}</small>
    </div></button>`).join('') || '<p class="empty">还没有条目</p>'}</div>
  </div>`;
  bindFields(screen());
  screen().onclick = async ev => {
    if (ev.target.closest('[data-act="add"]')) {
      const e = { id: uid(), name: '新条目', enabled: true, constant: false, keys: '', content: '', order: 0, chars: [] };
      list.push(e);
      await WB.save();
      return Router.go('wbEdit', { id: e.id });
    }
    const it = ev.target.closest('[data-id]');
    if (it) Router.go('wbEdit', { id: it.dataset.id });
  };
};

Views.wbEdit = async ({ id }) => {
  const e = WB.list.find(x => x.id === id);
  if (!e) return Router.back();
  screen().innerHTML = topbar('编辑条目') + `<div class="body"><div class="card">
    <label class="row"><span>启用</span><input type="checkbox" data-k="enabled" ${e.enabled ? 'checked' : ''}></label>
    <label class="field"><span>名字（只给你自己看）</span><input data-k="name" value="${esc(e.name)}"></label>
    <label class="row"><span>常驻（不需要关键词）</span><input type="checkbox" data-k="constant" ${e.constant ? 'checked' : ''}></label>
    <label class="field"><span>关键词（逗号分隔，不分大小写）</span><input data-k="keys" value="${esc(e.keys)}" placeholder="比如：学生会,会长"></label>
    <label class="field"><span>排序（数字小的在前）</span><input type="number" data-k="order" value="${Number(e.order) || 0}"></label>
    <label class="field"><span>内容</span><textarea data-k="content" rows="8">${esc(e.content)}</textarea></label>
  </div>
  <h3>绑定角色</h3><p class="empty">都不勾就是所有角色共用。群聊里只要有一个绑定的角色在群里就会生效。</p>
  <div class="card">${S.chars.map(c => `<label class="row"><span>${esc(c.name)}</span>
    <input type="checkbox" data-c="${c.id}" ${e.chars?.includes(c.id) ? 'checked' : ''}></label>`).join('') || '<p class="empty">还没有角色</p>'}</div>
  <button class="btn danger" data-act="del">删除条目</button></div>`;
  $$('[data-k]').forEach(el => el.onchange = async () => {
    const k = el.dataset.k;
    e[k] = el.type === 'checkbox' ? el.checked : k === 'order' ? Number(el.value) : el.value.trim();
    await WB.save();
  });
  $$('[data-c]').forEach(el => el.onchange = async () => {
    e.chars = $$('[data-c]').filter(x => x.checked).map(x => x.dataset.c);
    await WB.save();
  });
  screen().onclick = async ev => {
    if (ev.target.closest('[data-act]')?.dataset.act !== 'del') return;
    if (!await confirmBox(`删除条目「${e.name}」`)) return;
    WB.list = WB.list.filter(x => x.id !== id);
    await WB.save();
    Router.back();
  };
};
