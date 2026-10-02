// 主屏幕图标：用画布画一只像素小鸡，生成 PNG 设为图标
(function () {
  const map = [
    '...RR.....',
    '..BBBB....',
    '.BBBBBB...',
    '.BEBBEB...',
    '.BBKKBB.D.',
    'BBBBBBBBD.',
    'BWWWWWWB..',
    'BWWWWWWB..',
    '.BBBBBB...',
    '..K..K....',
  ];
  const pal = { B: '#f8d838', D: '#d8a818', W: '#fff3b0', E: '#1e2a10', K: '#e8902a', R: '#e04a3a' };
  const N = 180, s = 13, c = document.createElement('canvas');
  c.width = c.height = N;
  const x = c.getContext('2d');
  // 背景：浅绿 + 底部草地
  x.fillStyle = '#c8e8a0'; x.fillRect(0, 0, N, N);
  x.fillStyle = '#7cc850'; x.fillRect(0, N - 40, N, 40);
  x.fillStyle = '#5f8a2a';
  for (let i = 0; i < N; i += 12) x.fillRect(i, N - 40, 6, 6);
  const w = map[0].length * s, ox = Math.round((N - w) / 2) + 6, oy = N - 40 - map.length * s + 6;
  map.forEach((row, j) => [...row].forEach((ch, i) => {
    if (!pal[ch]) return;
    x.fillStyle = pal[ch];
    x.fillRect(ox + i * s, oy + j * s, s, s);
  }));
  const url = c.toDataURL('image/png');
  for (const rel of ['apple-touch-icon', 'icon']) {
    const l = document.createElement('link');
    l.rel = rel;
    l.href = url;
    document.head.appendChild(l);
  }
})();
