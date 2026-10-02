// 错误日志：所有后台失败都记在这里，记忆体检页可以查看
const Log = {
  list: [],
  _toastAt: 0,
  _ready: false,

  async init() {
    const saved = (await DB.get('kv', 'errlog'))?.value || [];
    // init 之前记下的错误不丢，排在最前面
    this.list = [...this.list, ...saved].slice(0, 200);
    this._ready = true;
    this.save();
    // 申请持久存储，降低被系统自动清理的概率
    try { this.persisted = await navigator.storage?.persist?.(); } catch { this.persisted = false; }
  },

  save() {
    if (!this._ready) return;
    DB.put('kv', { id: 'errlog', value: this.list }).catch(e => console.warn('错误日志保存失败', e));
  },

  add(title, detail = '') {
    console.warn(title, detail);
    const last = this.list[0];
    // 10 分钟内的同类错误合并计数
    if (last && last.title === title && Date.now() - last.ts < 10 * 60e3) {
      last.n = (last.n || 1) + 1;
      last.ts = Date.now();
      last.detail = String(detail);
    } else {
      const id = typeof uid === 'function' ? uid() : Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      this.list.unshift({ id, title, detail: String(detail), ts: Date.now(), n: 1 });
    }
    this.list = this.list.slice(0, 200);
    this.save();
    // app.js 还没加载时 toast 不存在
    if (typeof toast === 'function' && document.body && Date.now() - this._toastAt > 30e3) {
      this._toastAt = Date.now();
      toast('⚠ ' + title + '（详情见「记忆体检」）', 3500);
    }
  },

  clear() {
    this.list = [];
    return DB.put('kv', { id: 'errlog', value: [] });
  },
};

// 兜底：没被 catch 的错误也记下来（包括其他 js 文件的语法错误）
window.addEventListener('error', e => {
  if (!e.message) return; // 图片、字体加载失败之类的资源错误不记
  Log.add('脚本错误：' + e.message, `${(e.filename || '').split('/').pop()}:${e.lineno || '?'}`);
});
window.addEventListener('unhandledrejection', e => {
  const r = e.reason;
  Log.add('未处理的错误：' + (r?.message || String(r)), r?.stack?.split('\n').slice(1, 3).join(' ') || '');
});
