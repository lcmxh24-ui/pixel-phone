// IndexedDB 简易封装：kv(设置) / chars(角色) / msgs(消息) / mems(记忆) / groups(群)
const DB = (() => {
  const NAME = 'pixelphone', VER = 2;
  let dbp;
  function open() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open(NAME, VER);
      r.onupgradeneeded = () => {
        const d = r.result;
        const mk = (n, idx) => {
          if (d.objectStoreNames.contains(n)) return;
          const s = d.createObjectStore(n, { keyPath: 'id' });
          if (idx) s.createIndex(idx, idx);
        };
        mk('kv'); mk('chars'); mk('msgs', 'convId'); mk('mems', 'charId'); mk('groups');
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  async function tx(store, mode, fn) {
    const d = await open();
    return new Promise((res, rej) => {
      const t = d.transaction(store, mode);
      const req = fn(t.objectStore(store));
      t.oncomplete = () => res(req ? req.result : undefined);
      t.onerror = () => rej(t.error);
    });
  }
  return {
    STORES: ['kv', 'chars', 'msgs', 'mems', 'groups'],
    get: (s, id) => tx(s, 'readonly', st => st.get(id)),
    put: (s, v) => tx(s, 'readwrite', st => st.put(v)),
    del: (s, id) => tx(s, 'readwrite', st => st.delete(id)),
    all: s => tx(s, 'readonly', st => st.getAll()),
    byIndex: (s, idx, val) => tx(s, 'readonly', st => st.index(idx).getAll(val)),
    clear: s => tx(s, 'readwrite', st => st.clear()),
  };
})();

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const sleep = ms => new Promise(r => setTimeout(r, ms));
