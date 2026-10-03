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

// 搜索词、筛选、勾选在页面重绘后保留
const WBUI = { q: '', show: 'all', sel: new Set() };

// 选角色弹窗：返回 { mode: 'add' | 'remove' | 'set', ids }，取消返回 null
function pickChars(title) {
  return new Promise(res => {
    const { el, close } = modal(`<h3>${esc(title)}</h3>
      <input id="pc-q" type="search" placeholder="搜索角色名字" aria-label="搜索角色">
      <div class="flex" style="margin:6px 0">
        <button class="btn ghost sm" data-a="all">全选结果</button>
        <button class="btn ghost sm" data-a="none">清除</button>
      </div>
      <div class="pc-list">${S.chars.map(c => `<label class="row" data-name="${esc(c.name.toLowerCase())}">
        <span class="flex" style="gap:6px">${avatar(c.avatar, c.name, 'sm')}${esc(c.name)}</span>
        <input type="checkbox" data-c="${c.id}"></label>`).join('') || '<p class="empty">还没有角色</p>'}</div>
      <p class="hint">添加：把勾的角色加进去（原本是「全部角色」的条目会变成只绑定这些人）。<br>
        移除：把勾的角色去掉，去光了就变回全部角色共用。<br>替换：绑定改成只有勾的这些，一个都不勾 = 全部角色共用。</p>
      <div class="flex" style="justify-content:flex-end;margin-top:10px">
        <button class="btn ghost" data-a="no">取消</button>
        <button class="btn ghost" data-a="remove">移除</button>
        <button class="btn ghost" data-a="set">替换</button>
        <button class="btn" data-a="add">添加</button>
      </div>`);
    const rows = $$('[data-name]', el);
    $('#pc-q', el).oninput = e => {
      const ts = e.target.value.toLowerCase().split(/\s+/).filter(Boolean);
      rows.forEach(r => { r.hidden = !ts.some(t => r.dataset.name.includes(t)) && ts.length > 0; });
    };
    el.onclick = e => {
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (!a) return;
      if (a === 'all') return rows.filter(r => !r.hidden).forEach(r => { $('[data-c]', r).checked = true; });
      if (a === 'none') return rows.forEach(r => { $('[data-c]', r).checked = false; });
      const ids = $$('[data-c]', el).filter(x => x.checked).map(x => x.dataset.c);
      if (a !== 'no' && a !== 'set' && !ids.length) return toast('先勾选角色');
      close();
      res(a === 'no' ? null : { mode: a, ids });
    };
  });
}

Views.worldbook = async () => {
  const list = WB.list;
  const names = e => (e.chars || []).map(id => charById(id)?.name).filter(Boolean);
  const bound = e => e.chars?.length ? '绑定：' + names(e).join('、') : '全部角色';
  // 已删除的条目从勾选里去掉
  WBUI.sel = new Set([...WBUI.sel].filter(id => list.some(e => e.id === id)));
  const opt = (v, t) => `<option value="${v}" ${WBUI.show === v ? 'selected' : ''}>${t}</option>`;

  screen().innerHTML = topbar('世界书', '<button class="btn ghost" data-act="add" aria-label="新建条目">＋</button>') + `<div class="body">
    <div class="card">${field('扫描最近几条消息找关键词', 'worldbook.scanDepth', { type: 'number' })}</div>
    <p class="empty">📌 常驻：每次都带上，走缓存。🔑 关键词：最近的聊天里出现关键词才带上。不绑定角色就是所有角色共用。</p>
    <div class="card rel-tools">
      <input id="wb-q" type="search" value="${esc(WBUI.q)}" placeholder="搜索条目名、关键词、内容、角色名" aria-label="搜索世界书">
      <div class="flex" style="margin-top:6px">
        <select id="wb-show" aria-label="筛选" style="width:auto;flex:1">
          ${opt('all', '全部')}${opt('const', '只看常驻')}${opt('key', '只看关键词')}${opt('off', '只看已停用')}
        </select>
        <button class="btn ghost sm" data-act="all">全选结果</button>
        <button class="btn ghost sm" data-act="none">清除选择</button>
      </div>
      <div class="flex" id="wb-batch" style="margin-top:6px" hidden>
        <small id="wb-n" class="grow"></small>
        <button class="btn green sm" data-act="bind">绑定角色</button>
        <button class="btn ghost sm" data-act="on">启用</button>
        <button class="btn ghost sm" data-act="off">停用</button>
        <button class="btn danger sm" data-act="del">删除</button>
      </div>
    </div>
    <div class="list">${list.map(e => `<div class="item wb-item" data-id="${e.id}"
        data-search="${esc([e.name, e.keys, e.content, ...names(e)].join(' ').toLowerCase())}">
      <input type="checkbox" data-sel ${WBUI.sel.has(e.id) ? 'checked' : ''} aria-label="选中 ${esc(e.name)}">
      <button class="wb-open grow" data-open="${e.id}">
        <b>${e.enabled ? '' : '⏸ '}${esc(e.name)}</b>
        <small class="ellipsis">${e.constant ? '📌 常驻' : '🔑 ' + esc(e.keys || '（没填关键词）')} · ${esc(bound(e))}</small>
      </button></div>`).join('') || '<p class="empty">还没有条目</p>'}</div>
    <p class="empty" id="wb-none" hidden>没有符合条件的条目</p>
  </div>`;
  bindFields(screen());

  const items = $$('.wb-item');
  const entry = it => list.find(e => e.id === it.dataset.id);
  const visible = () => items.filter(it => !it.hidden);

  const syncBatch = () => {
    $('#wb-batch').hidden = !WBUI.sel.size;
    $('#wb-n').textContent = `已选 ${WBUI.sel.size} 项`;
  };

  // 被筛掉的条目取消勾选，批量操作只改看得见的
  const filter = () => {
    const ts = WBUI.q.toLowerCase().split(/\s+/).filter(Boolean);
    for (const it of items) {
      const e = entry(it);
      const byShow = { all: true, const: e.constant, key: !e.constant, off: !e.enabled }[WBUI.show];
      const ok = byShow && ts.every(t => it.dataset.search.includes(t));
      it.hidden = !ok;
      if (!ok) { $('[data-sel]', it).checked = false; WBUI.sel.delete(e.id); }
    }
    $('#wb-none').hidden = !items.length || visible().length > 0;
    syncBatch();
  };

  $('#wb-q').oninput = e => { WBUI.q = e.target.value; filter(); };
  $('#wb-show').onchange = e => { WBUI.show = e.target.value; filter(); };
  items.forEach(it => {
    $('[data-sel]', it).onchange = e => {
      e.target.checked ? WBUI.sel.add(it.dataset.id) : WBUI.sel.delete(it.dataset.id);
      syncBatch();
    };
  });

  screen().onclick = async ev => {
    const op = ev.target.closest('[data-open]');
    if (op) return Router.go('wbEdit', { id: op.dataset.open });
    const act = ev.target.closest('[data-act]')?.dataset.act;
    if (act === 'add') {
      const e = { id: uid(), name: '新条目', enabled: true, constant: false, keys: '', content: '', order: 0, chars: [] };
      list.push(e);
      await WB.save();
      return Router.go('wbEdit', { id: e.id });
    }
    if (act === 'all') {
      visible().forEach(it => { $('[data-sel]', it).checked = true; WBUI.sel.add(it.dataset.id); });
      return syncBatch();
    }
    if (act === 'none') {
      items.forEach(it => { $('[data-sel]', it).checked = false; });
      WBUI.sel.clear();
      return syncBatch();
    }
    if (!['bind', 'on', 'off', 'del'].includes(act)) return;
    const sel = list.filter(e => WBUI.sel.has(e.id));
    if (!sel.length) return;

    if (act === 'bind') {
      const r = await pickChars(`给 ${sel.length} 个条目绑定角色`);
      if (!r) return;
      for (const e of sel) {
        const cur = e.chars || [];
        if (r.mode === 'add') e.chars = [...new Set([...cur, ...r.ids])];
        if (r.mode === 'remove') e.chars = cur.filter(id => !r.ids.includes(id));
        if (r.mode === 'set') e.chars = [...r.ids];
      }
    }
    if (act === 'on' || act === 'off') sel.forEach(e => { e.enabled = act === 'on'; });
    if (act === 'del') {
      if (!await confirmBox(`删除 ${sel.length} 个条目（删了找不回来）`)) return;
      WB.list = list.filter(e => !WBUI.sel.has(e.id));
      WBUI.sel.clear();
    }
    await WB.save();
    toast(`已修改 ${sel.length} 项`);
    Router.render();
  };

  filter();
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
  <div class="card">
    ${S.chars.length ? `<input id="wbc-q" type="search" placeholder="搜索角色名字" aria-label="搜索角色">
    <div class="flex" style="margin:6px 0">
      <button class="btn ghost sm" data-act="call">全选结果</button>
      <button class="btn ghost sm" data-act="cnone">全部取消</button>
      <small id="wbc-n" class="grow" style="text-align:right"></small>
    </div>` : ''}
    ${S.chars.map(c => `<label class="row" data-name="${esc(c.name.toLowerCase())}"><span>${esc(c.name)}</span>
      <input type="checkbox" data-c="${c.id}" ${e.chars?.includes(c.id) ? 'checked' : ''}></label>`).join('') || '<p class="empty">还没有角色</p>'}
  </div>
  <button class="btn danger" data-act="del">删除条目</button></div>`;

  $$('[data-k]').forEach(el => el.onchange = async () => {
    const k = el.dataset.k;
    e[k] = el.type === 'checkbox' ? el.checked : k === 'order' ? Number(el.value) : el.value.trim();
    await WB.save();
  });

  const rows = $$('[data-name]');
  const saveChars = async () => {
    e.chars = $$('[data-c]').filter(x => x.checked).map(x => x.dataset.c);
    const n = $('#wbc-n');
    if (n) n.textContent = e.chars.length ? `已绑定 ${e.chars.length} 个` : '全部角色共用';
    await WB.save();
  };
  $$('[data-c]').forEach(el => el.onchange = saveChars);
  const q = $('#wbc-q');
  if (q) q.oninput = () => {
    const ts = q.value.toLowerCase().split(/\s+/).filter(Boolean);
    rows.forEach(r => { r.hidden = ts.length > 0 && !ts.some(t => r.dataset.name.includes(t)); });
  };
  saveChars();

  screen().onclick = async ev => {
    const act = ev.target.closest('[data-act]')?.dataset.act;
    if (act === 'call') { rows.filter(r => !r.hidden).forEach(r => { $('[data-c]', r).checked = true; }); return saveChars(); }
    if (act === 'cnone') { rows.forEach(r => { $('[data-c]', r).checked = false; }); return saveChars(); }
    if (act !== 'del') return;
    if (!await confirmBox(`删除条目「${e.name}」`)) return;
    WB.list = WB.list.filter(x => x.id !== id);
    await WB.save();
    Router.back();
  };
};

