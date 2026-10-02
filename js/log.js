// 错误日志：所有后台失败都记在这里，记忆体检页可以查看
const Log = {
  list: [],
  _toastAt: 0,

  async init() {
    this.list = (await DB.get('kv', 'errlog'))?.value || [];
    // 申请持久存储，降低被系统自动清理的概率
    try { this.persisted = await navigator.storage?.persist?.(); } catch { this.persisted = false; }
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
      this.list.unshift({ id: uid(), title, detail: String(detail), ts: Date.now(), n: 1 });
    }
    this.list = this.list.slice(0, 200);
    DB.put('kv', { id: 'errlog', value: this.list });
    if (Date.now() - this._toastAt > 30e3) {
      this._toastAt = Date.now();
      toast('⚠ ' + title + '（详情见「记忆体检」）', 3500);
    }
  },

  clear() {
    this.list = [];
    return DB.put('kv', { id: 'errlog', value: [] });
  },
};
