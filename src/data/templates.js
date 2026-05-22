const ROWS = 7;
const COLS = 53;

function emptyGrid() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
}

export function getYearInfo(year) {
  const startOffset = new Date(year, 0, 1).getDay(); // rows 0..startOffset-1 of col 0 = prev year
  const endOffset = new Date(year, 11, 31).getDay();  // rows endOffset+1..6 of col 52 = next year
  return { startOffset, endOffset };
}

function sparseToGrid(cells) {
  const grid = emptyGrid();
  cells.forEach(([r, c, v = 4]) => {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      grid[r][c] = v;
    }
  });
  return grid;
}

function generateHeart() {
  const cells = [];
  const cx = 26;
  // two humps
  for (let c = cx - 4; c <= cx - 2; c++) cells.push([1, c, 4]);
  for (let c = cx + 1; c <= cx + 3; c++) cells.push([1, c, 4]);
  // full rows
  for (let c = cx - 5; c <= cx + 4; c++) cells.push([2, c, 4]);
  for (let c = cx - 5; c <= cx + 4; c++) cells.push([3, c, 4]);
  // narrowing
  for (let c = cx - 4; c <= cx + 3; c++) cells.push([4, c, 4]);
  for (let c = cx - 3; c <= cx + 2; c++) cells.push([5, c, 4]);
  // tip
  for (let c = cx - 1; c <= cx; c++) cells.push([6, c, 4]);
  return sparseToGrid(cells);
}

function generateWave() {
  const cells = [];
  for (let col = 0; col < COLS; col++) {
    const center = Math.round(3 + 2.5 * Math.sin((col * Math.PI) / 7));
    const r = Math.max(0, Math.min(6, center));
    cells.push([r, col, 4]);
    if (r > 0) cells.push([r - 1, col, 2]);
    if (r < 6) cells.push([r + 1, col, 2]);
    if (r > 1) cells.push([r - 2, col, 1]);
    if (r < 5) cells.push([r + 2, col, 1]);
  }
  return sparseToGrid(cells);
}

function generateCheckerboard() {
  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if ((r + c) % 2 === 0) cells.push([r, c, 4]);
      else cells.push([r, c, 1]);
    }
  }
  return sparseToGrid(cells);
}

// 5-tall pixel font (row offsets from top of letter, col offsets from left)
const PIXEL_FONT = {
  A: [[0,1],[0,2],[1,0],[1,3],[2,0],[2,1],[2,2],[2,3],[3,0],[3,3],[4,0],[4,3]],
  B: [[0,0],[0,1],[0,2],[1,0],[1,3],[2,0],[2,1],[2,2],[3,0],[3,3],[4,0],[4,1],[4,2]],
  C: [[0,1],[0,2],[0,3],[1,0],[2,0],[3,0],[4,1],[4,2],[4,3]],
  D: [[0,0],[1,0],[2,0],[3,0],[4,0],[0,1],[0,2],[1,3],[2,3],[3,3],[4,1],[4,2]],
  E: [[0,0],[0,1],[0,2],[0,3],[1,0],[2,0],[2,1],[2,2],[3,0],[4,0],[4,1],[4,2],[4,3]],
  F: [[0,0],[0,1],[0,2],[0,3],[1,0],[2,0],[2,1],[2,2],[3,0],[4,0]],
  G: [[0,1],[0,2],[0,3],[1,0],[2,0],[2,2],[2,3],[3,0],[3,3],[4,1],[4,2],[4,3]],
  H: [[0,0],[1,0],[2,0],[3,0],[4,0],[0,3],[1,3],[2,3],[3,3],[4,3],[2,1],[2,2]],
  I: [[0,0],[0,1],[0,2],[1,1],[2,1],[3,1],[4,0],[4,1],[4,2]],
  J: [[0,2],[0,3],[1,3],[2,3],[3,0],[3,3],[4,1],[4,2]],
  K: [[0,0],[0,3],[1,0],[1,2],[2,0],[2,1],[3,0],[3,2],[4,0],[4,3]],
  L: [[0,0],[1,0],[2,0],[3,0],[4,0],[4,1],[4,2],[4,3]],
  M: [[0,0],[0,4],[1,0],[1,1],[1,3],[1,4],[2,0],[2,2],[2,4],[3,0],[3,4],[4,0],[4,4]],
  N: [[0,0],[0,3],[1,0],[1,1],[1,3],[2,0],[2,2],[2,3],[3,0],[3,3],[4,0],[4,3]],
  O: [[0,1],[0,2],[1,0],[1,3],[2,0],[2,3],[3,0],[3,3],[4,1],[4,2]],
  P: [[0,0],[0,1],[0,2],[1,0],[1,3],[2,0],[2,1],[2,2],[3,0],[4,0]],
  Q: [[0,1],[0,2],[1,0],[1,3],[2,0],[2,3],[3,0],[3,2],[3,3],[4,1],[4,2],[4,3]],
  R: [[0,0],[1,0],[2,0],[3,0],[4,0],[0,1],[0,2],[0,3],[1,3],[2,1],[2,2],[3,3],[4,3]],
  S: [[0,1],[0,2],[0,3],[1,0],[2,1],[2,2],[3,3],[4,0],[4,1],[4,2]],
  T: [[0,0],[0,1],[0,2],[0,3],[0,4],[1,2],[2,2],[3,2],[4,2]],
  U: [[0,0],[0,3],[1,0],[1,3],[2,0],[2,3],[3,0],[3,3],[4,1],[4,2]],
  V: [[0,0],[0,3],[1,0],[1,3],[2,0],[2,3],[3,1],[3,2],[4,2]],
  W: [[0,0],[0,4],[1,0],[1,4],[2,0],[2,2],[2,4],[3,0],[3,1],[3,3],[3,4],[4,0],[4,4]],
  X: [[0,0],[0,3],[1,1],[1,2],[3,1],[3,2],[4,0],[4,3]],
  Y: [[0,0],[0,3],[1,0],[1,3],[2,1],[2,2],[3,2],[4,2]],
  Z: [[0,0],[0,1],[0,2],[0,3],[1,3],[2,1],[2,2],[3,0],[4,0],[4,1],[4,2],[4,3]],
  '0': [[0,1],[0,2],[1,0],[1,3],[2,0],[2,3],[3,0],[3,3],[4,1],[4,2]],
  '1': [[0,1],[1,0],[1,1],[2,1],[3,1],[4,0],[4,1],[4,2]],
  '2': [[0,1],[0,2],[1,0],[1,3],[2,2],[3,1],[4,0],[4,1],[4,2],[4,3]],
  '3': [[0,0],[0,1],[0,2],[1,3],[2,1],[2,2],[3,3],[4,0],[4,1],[4,2]],
  '4': [[0,0],[0,3],[1,0],[1,3],[2,0],[2,1],[2,2],[2,3],[3,3],[4,3]],
  '5': [[0,0],[0,1],[0,2],[0,3],[1,0],[2,0],[2,1],[2,2],[3,3],[4,0],[4,1],[4,2]],
  '6': [[0,1],[0,2],[1,0],[2,0],[2,1],[2,2],[3,0],[3,3],[4,1],[4,2]],
  '7': [[0,0],[0,1],[0,2],[0,3],[1,3],[2,2],[3,1],[4,1]],
  '8': [[0,1],[0,2],[1,0],[1,3],[2,1],[2,2],[3,0],[3,3],[4,1],[4,2]],
  '9': [[0,1],[0,2],[1,0],[1,3],[2,1],[2,2],[2,3],[3,3],[4,1],[4,2]],
  '!': [[0,1],[1,1],[2,1],[4,1]],
};

function charAdvance(ch) {
  if (ch === 'I') return 4;
  if (ch === 'M' || ch === 'W' || ch === 'T') return 6;
  if (PIXEL_FONT[ch]) return 6;
  return 4; // space or unknown
}

function textWidth(text) {
  const chars = text.toUpperCase();
  let w = 0;
  for (const ch of chars) w += charAdvance(ch);
  return Math.max(0, w - 2); // remove trailing gap
}

export function generateFromText(text) {
  const upper = text.toUpperCase().replace(/[^A-Z0-9! ]/g, '');
  if (!upper.trim()) return emptyGrid();
  const w = textWidth(upper);
  const startCol = Math.max(1, Math.floor((COLS - w) / 2));
  return sparseToGrid(renderText(upper, startCol, 1));
}

export function getTextWidth(text) {
  return textWidth(text.toUpperCase().replace(/[^A-Z0-9! ]/g, ''));
}

function renderText(text, startCol, startRow = 1) {
  const cells = [];
  let col = startCol;
  for (const ch of text.toUpperCase()) {
    const glyph = PIXEL_FONT[ch];
    if (glyph) {
      glyph.forEach(([dr, dc]) => {
        cells.push([startRow + dr, col + dc, 4]);
      });
      col += (ch === 'I' ? 4 : 6);
    } else {
      col += 4;
    }
  }
  return cells;
}

function generateHI() {
  const cells = renderText('HI', 22, 1);
  return sparseToGrid(cells);
}

function generateCode() {
  const cells = renderText('CODE', 15, 1);
  return sparseToGrid(cells);
}

function generatePacMan() {
  const cells = [];
  const cx = 15;
  // body circle (7 rows)
  const shape = [
    [0, [2, 3, 4, 5, 6, 7]],
    [1, [1, 2, 3, 4, 5, 6, 7, 8]],
    [2, [1, 2, 3, 4, 5, 6]],    // mouth open
    [3, [1, 2, 3, 4]],           // mouth wide
    [4, [1, 2, 3, 4, 5, 6]],    // mouth close
    [5, [1, 2, 3, 4, 5, 6, 7, 8]],
    [6, [2, 3, 4, 5, 6, 7]],
  ];
  shape.forEach(([r, cols]) => {
    cols.forEach(dc => cells.push([r, cx + dc, 4]));
  });
  // eye
  cells.push([1, cx + 3, 1]);
  // dots (food pellets to eat)
  [28, 33, 38, 43, 48].forEach(c => cells.push([3, c, 3]));
  return sparseToGrid(cells);
}

function generateStar() {
  const cells = [];
  const cx = 26;
  // horizontal bar
  for (let c = cx - 6; c <= cx + 6; c++) cells.push([3, c, 4]);
  // vertical bar
  for (let r = 0; r < 7; r++) cells.push([r, cx, 4]);
  // diagonals
  [[0,6],[1,5],[2,4],[4,4],[5,5],[6,6]].forEach(([dr, dc]) => {
    cells.push([dr, cx - dc, 3]);
    cells.push([dr, cx + dc, 3]);
  });
  return sparseToGrid(cells);
}

function generateHeartbeat() {
  const cells = [];
  for (let c = 0; c < 53; c++) cells.push([3, c, 2]);
  // small pre-blip
  [[2,8],[2,9]].forEach(([r,c]) => cells.push([r,c,3]));
  // main EKG spike
  [[3,18],[2,19],[1,20],[0,21],[1,22],[2,23],[3,24],[4,25],[5,26],[6,27],[5,28],[4,29],[3,30]].forEach(([r,c]) => {
    cells.push([r,c,4]);
  });
  // small post-blip
  [[2,38],[2,39]].forEach(([r,c]) => cells.push([r,c,3]));
  return sparseToGrid(cells);
}

function generateDNA() {
  const cells = [];
  for (let c = 0; c < 53; c++) {
    const r1 = Math.max(0, Math.min(6, Math.round(3 + 2.8 * Math.sin(c * Math.PI / 6))));
    const r2 = Math.max(0, Math.min(6, Math.round(3 + 2.8 * Math.sin(c * Math.PI / 6 + Math.PI))));
    cells.push([r1, c, 4]);
    cells.push([r2, c, 4]);
    if (c % 6 === 3) {
      const lo = Math.min(r1, r2);
      const hi = Math.max(r1, r2);
      for (let r = lo + 1; r < hi; r++) cells.push([r, c, 2]);
    }
  }
  return sparseToGrid(cells);
}

function generateMountains() {
  const cells = [];
  const profile = [6,6,5,5,4,4,3,3,2,3,4,5,6,6,5,4,3,2,1,2,3,4,5,6,5,4,3,2,1,0,1,2,3,4,3,2,1,2,3,4,5,6,6,5,4,3,2,1,2,3,4,5,6];
  for (let c = 0; c < 53; c++) {
    const peak = profile[c] ?? 6;
    for (let r = peak; r <= 6; r++) {
      cells.push([r, c, r === peak ? 4 : r === peak + 1 ? 3 : 2]);
    }
  }
  return sparseToGrid(cells);
}

function generateRocket() {
  const cells = [];
  const cx = 26;
  // nose + body
  [[0,0],[1,0],[2,-1],[2,0],[2,1],[3,0],[4,-1],[4,0],[4,1]].forEach(([dr,dc]) => cells.push([dr,cx+dc,4]));
  // window
  cells.push([2, cx, 1]);
  // fins
  [[5,-2],[5,2],[6,-3],[6,3]].forEach(([dr,dc]) => cells.push([dr,cx+dc,3]));
  // exhaust
  [[5,0],[6,-1],[6,0],[6,1]].forEach(([dr,dc]) => cells.push([dr,cx+dc,4]));
  // trail (fading left)
  for (let c = cx - 4; c >= cx - 10; c--) cells.push([6, c, Math.max(1, 3 - Math.floor((cx - 4 - c) / 2))]);
  for (let c = cx - 6; c >= cx - 12; c--) cells.push([5, c, Math.max(1, 2 - Math.floor((cx - 6 - c) / 3))]);
  return sparseToGrid(cells);
}

function generateRain() {
  const cells = [];
  for (let c = 0; c < COLS; c++) {
    const height = Math.floor(Math.random() * 7) + 1;
    for (let r = 7 - height; r < 7; r++) {
      const intensity = r === 7 - height ? 1 : r === 7 - height + 1 ? 2 : r < 5 ? 3 : 4;
      cells.push([r, c, intensity]);
    }
  }
  return sparseToGrid(cells);
}

function generateDiagonalStripes() {
  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const band = (r + c) % 8;
      if (band < 2) cells.push([r, c, 4]);
      else if (band < 4) cells.push([r, c, 3]);
      else if (band < 6) cells.push([r, c, 1]);
    }
  }
  return sparseToGrid(cells);
}

export const TEMPLATES = [
  {
    id: 'heart',
    name: 'Heart',
    emoji: '♥',
    description: 'Classic heart shape. Show the world some love.',
    grid: generateHeart(),
  },
  {
    id: 'hi',
    name: 'HI',
    emoji: '👋',
    description: 'Pixel-art greeting on your profile.',
    grid: generateHI(),
  },
  {
    id: 'code',
    name: 'CODE',
    emoji: '</>',
    description: 'Because that\'s what we do.',
    grid: generateCode(),
  },
  {
    id: 'pacman',
    name: 'Pac-Man',
    emoji: '●',
    description: 'The legend. Eating dots, one commit at a time.',
    grid: generatePacMan(),
  },
  {
    id: 'wave',
    name: 'Wave',
    emoji: '〜',
    description: 'Smooth sine wave. Elegant and hypnotic.',
    grid: generateWave(),
  },
  {
    id: 'star',
    name: 'Star',
    emoji: '★',
    description: '8-point star burst. Stand out.',
    grid: generateStar(),
  },
  {
    id: 'checker',
    name: 'Checkerboard',
    emoji: '⊞',
    description: 'Classic alternating pattern. Bold contrast.',
    grid: generateCheckerboard(),
  },
  {
    id: 'stripes',
    name: 'Diagonal Stripes',
    emoji: '///',
    description: 'Flowing diagonal bands across the year.',
    grid: generateDiagonalStripes(),
  },
  {
    id: 'rain',
    name: 'Matrix Rain',
    emoji: '▓',
    description: 'Random falling columns. Different every time.',
    grid: generateRain(),
  },
  {
    id: 'heartbeat',
    name: 'Heartbeat',
    emoji: '♡',
    description: 'EKG pulse. For when your commits spike.',
    grid: generateHeartbeat(),
  },
  {
    id: 'dna',
    name: 'DNA Helix',
    emoji: '🧬',
    description: 'Double helix. Because your code is in your DNA.',
    grid: generateDNA(),
  },
  {
    id: 'mountains',
    name: 'Mountains',
    emoji: '⛰',
    description: 'Pixel terrain. Your contribution graph as a landscape.',
    grid: generateMountains(),
  },
  {
    id: 'rocket',
    name: 'Rocket',
    emoji: '🚀',
    description: 'To the moon. With a commit trail.',
    grid: generateRocket(),
  },
];

export { emptyGrid, ROWS, COLS };
