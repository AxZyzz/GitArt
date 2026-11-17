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

// ── ASCII-art templates ──────────────────────────────────────────
// Each string is one row (Sun → Sat). '.' = empty, '1'–'4' = intensity.
// Art is centred horizontally unless startCol is given.
function fromAscii(rows, startCol) {
  const width = Math.max(...rows.map(r => r.length));
  const col0 = startCol ?? Math.floor((COLS - width) / 2);
  const cells = [];
  rows.forEach((line, r) => {
    [...line].forEach((ch, dc) => {
      const v = Number(ch);
      if (v >= 1 && v <= 4) cells.push([r, col0 + dc, v]);
    });
  });
  return sparseToGrid(cells);
}

function generateBee() {
  return fromAscii([
    '......33...33.......',
    '.....3113.3113......',
    '......33...33.......',
    '...44114411441.11...',
    '.4444114411441.111..',
    '...44114411441.11...',
    '.....1...1...1......',
  ]);
}

function generateSmiley() {
  return fromAscii([
    '..4444444..',
    '.4.......4.',
    '4..44.44..4',
    '4.........4',
    '4.4.....4.4',
    '.4.44444.4.',
    '..4444444..',
  ]);
}

function generateCat() {
  return fromAscii([
    '4.......4',
    '44.....44',
    '444444444',
    '4.24.42.4',
    '444414444',
    '.4.444.4.',
    '..44444..',
  ]);
}

function generateLightning() {
  return fromAscii([
    '.......4444',
    '......444..',
    '.....444...',
    '....4444444',
    '......444..',
    '.....444...',
    '....44.....',
  ]);
}

function generateCoffee() {
  return fromAscii([
    '..2..2..2.....',
    '.2..2..2......',
    '44444444444...',
    '43333333334444',
    '4333333333...4',
    '.433333334444.',
    '..4444444.....',
  ]);
}

function generateSunrise() {
  const grid = fromAscii([
    '...........2...........',
    '....2......2......2....',
    '.....2...........2.....',
    '.........44444.........',
    '..22...444444444...22..',
    '......44444444444......',
    '.....3444444444443.....',
  ]);
  // horizon line across the whole year
  for (let c = 0; c < COLS; c++) if (!grid[6][c]) grid[6][c] = 1;
  return grid;
}

function generateSkyline() {
  const grid = emptyGrid();
  // [width, height] per building, one empty column between buildings
  const blocks = [[3,3],[4,5],[2,2],[5,6],[3,4],[4,7],[2,3],[5,5],[3,6],[4,4],[2,2],[5,7],[3,3],[4,5]];
  let c = 1;
  for (const [w, h] of blocks) {
    for (let dc = 0; dc < w && c + dc < COLS - 1; dc++) {
      for (let r = ROWS - h; r < ROWS; r++) {
        const lit = r > ROWS - h && r < ROWS - 1 && dc > 0 && dc < w - 1 && (r + dc + c) % 2 === 0;
        grid[r][c + dc] = r === ROWS - h || lit ? 4 : 2;
      }
    }
    c += w + 1;
  }
  return grid;
}

function generateChevrons() {
  const grid = emptyGrid();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const k = (c + Math.abs(r - 3)) % 9;
      grid[r][c] = k < 2 ? 4 : k < 4 ? 2 : k < 5 ? 1 : 0;
    }
  }
  return grid;
}

// ── More templates (batch 2) ─────────────────────────────────────
// Stamp ASCII art onto an existing grid at a given column / row.
function stamp(grid, rows, col0, row0 = 0) {
  rows.forEach((line, dr) => {
    [...line].forEach((ch, dc) => {
      const v = Number(ch);
      const r = row0 + dr;
      const c = col0 + dc;
      if (v >= 1 && v <= 4 && r >= 0 && r < ROWS && c >= 0 && c < COLS) grid[r][c] = v;
    });
  });
  return grid;
}

// Deterministic pseudo-random so templates look the same on every load.
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Seasonal art sits in the weeks of the year it belongs to (col ≈ week).
function generateChristmasTree() {
  const grid = emptyGrid();
  // light snowfall through early December
  [[0, 38], [2, 40], [5, 39], [1, 42], [4, 43], [6, 41], [3, 37]].forEach(([r, c]) => { grid[r][c] = 1; });
  return stamp(grid, [
    '...4...',
    '..222..',
    '.24222.',
    '..222..',
    '.22242.',
    '2422222',
    '...1...',
  ], 45);
}

function generatePumpkin() {
  return stamp(emptyGrid(), [
    '...1...',
    '.44444.',
    '4.444.4',
    '4444444',
    '4.4.4.4',
    '44...44',
    '.44444.',
  ], 40);
}

function generateDiya() {
  return stamp(emptyGrid(), [
    '....4....',
    '...444...',
    '....3....',
    '....1....',
    '322222223',
    '.2222222.',
    '..22222..',
  ], 40);
}

function generateGrowth() {
  const grid = emptyGrid();
  for (let c = 0; c < COLS; c++) grid[6][c] = 1; // soil
  stamp(grid, ['.2.'], 3, 5);
  stamp(grid, ['3.3', '.3.'], 13, 4);
  stamp(grid, ['3...3', '.3.3.', '..3..', '..3..'], 22, 2);
  stamp(grid, ['.444.', '44444', '.444.', '..2..', '..2..'], 33, 1);
  stamp(grid, ['..444..', '.44444.', '4444444', '.44444.', '...2...', '...2...'], 44, 0);
  return grid;
}

function generateMoonPhases() {
  const grid = emptyGrid();
  const mask = ['.xxx.', 'xxxxx', 'xxxxx', 'xxxxx', '.xxx.'];
  // which columns (0–4) of the disc are lit: new moon → full → new moon
  const lit = [
    () => false,
    x => x >= 4,
    x => x >= 2,
    x => x >= 1,
    () => true,
    x => x <= 3,
    x => x <= 2,
    x => x <= 0,
  ];
  lit.forEach((isLit, i) => {
    const col0 = 3 + i * 6;
    mask.forEach((line, dr) => {
      [...line].forEach((ch, x) => {
        if (ch === 'x') grid[1 + dr][col0 + x] = isLit(x) ? 4 : 1;
      });
    });
  });
  return grid;
}

function generateBrackets() {
  const lt = ['...4', '..4.', '.4..', '4...', '.4..', '..4.', '...4'];
  const sl = ['....4', '...4.', '...4.', '..4..', '.4...', '.4...', '4....'];
  const gt = ['4...', '.4..', '..4.', '...4', '..4.', '.4..', '4...'];
  return fromAscii(lt.map((row, r) => row + '..' + sl[r] + '..' + gt[r]));
}

function generateTerminal() {
  return fromAscii([
    '242424222222222222222',
    '2...................2',
    '2.4.................2',
    '2..4................2',
    '2.4..4444...........2',
    '2...................2',
    '222222222222222222222',
  ]);
}

function generateGitBranch() {
  const grid = emptyGrid();
  // main line with commits
  for (let c = 2; c <= 50; c++) grid[4][c] = 2;
  for (let c = 2; c <= 50; c += 4) grid[4][c] = 4;
  // feature branch: fork up, run, merge back down
  [[3, 11], [2, 12], [1, 13], [1, 35], [2, 36], [3, 37]].forEach(([r, c]) => { grid[r][c] = 2; });
  for (let c = 14; c <= 34; c++) grid[1][c] = 1;
  for (let c = 15; c <= 34; c += 4) grid[1][c] = 3;
  // short hotfix branch below
  [[5, 41], [6, 42], [6, 43], [6, 44], [5, 45]].forEach(([r, c]) => { grid[r][c] = 1; });
  grid[6][43] = 3;
  return grid;
}

function generateStarfield() {
  const grid = emptyGrid();
  const rand = seeded(2026);
  for (let i = 0; i < 80; i++) {
    const r = Math.floor(rand() * ROWS);
    const c = Math.floor(rand() * COLS);
    const roll = rand();
    grid[r][c] = roll < 0.5 ? 1 : roll < 0.8 ? 2 : 3;
  }
  // a few bright twinkles
  [[2, 7], [4, 21], [1, 33], [4, 46]].forEach(([r, c]) => {
    grid[r][c] = 4;
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => { grid[r + dr][c + dc] = 2; });
  });
  return grid;
}

function generateDiamonds() {
  const grid = emptyGrid();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const d = Math.abs(r - 3) + Math.abs(((c + 4) % 8) - 4);
      grid[r][c] = d === 3 ? 4 : d === 1 ? 2 : d === 0 ? 1 : 0;
    }
  }
  return grid;
}

function generateEqualizer() {
  const grid = emptyGrid();
  for (let c = 1; c < COLS - 1; c++) {
    const h = Math.max(1, Math.min(7, Math.round(3.6 + 3 * Math.sin(c * 0.7) * Math.cos(c * 0.23))));
    for (let k = 0; k < h; k++) {
      grid[ROWS - 1 - k][c] = k === h - 1 ? 4 : k >= 4 ? 3 : 2;
    }
  }
  return grid;
}

function generatePawPrints() {
  const grid = emptyGrid();
  const paw = ['.4.4.', '4...4', '.444.', '.444.'];
  for (let i = 0, c = 1; c + 5 <= COLS; i++, c += 7) stamp(grid, paw, c, i % 2 === 0 ? 0 : 3);
  return grid;
}

function generateRobot() {
  return fromAscii([
    '....3....',
    '.4444444.',
    '.4.444.4.',
    '344444443',
    '.4422244.',
    '.4444444.',
    '...444...',
  ]);
}

export const TEMPLATES = [
  {
    id: 'xmas',
    name: 'Christmas Tree',
    emoji: '🎄',
    description: 'Lands in the last weeks of December, with snow on the way in.',
    grid: generateChristmasTree(),
    isNew: true,
  },
  {
    id: 'pumpkin',
    name: 'Pumpkin',
    emoji: '🎃',
    description: 'A jack-o-lantern sitting right on Halloween week.',
    grid: generatePumpkin(),
    isNew: true,
  },
  {
    id: 'diya',
    name: 'Diya',
    emoji: '🪔',
    description: 'A glowing lamp placed around Diwali, late Oct to mid Nov.',
    grid: generateDiya(),
    isNew: true,
  },
  {
    id: 'growth',
    name: 'Growth',
    emoji: '🌱',
    description: 'A seed in January, a full tree by December. Your year, visualised.',
    grid: generateGrowth(),
    isNew: true,
  },
  {
    id: 'moon',
    name: 'Moon Phases',
    emoji: '🌙',
    description: 'New moon to full and back again, across the year.',
    grid: generateMoonPhases(),
    isNew: true,
  },
  {
    id: 'gitbranch',
    name: 'Git Branch',
    emoji: '🔀',
    description: 'Main, a feature branch that merges back, and a quick hotfix.',
    grid: generateGitBranch(),
    isNew: true,
  },
  {
    id: 'brackets',
    name: '</>',
    emoji: '💻',
    description: 'The universal sign for "I write code".',
    grid: generateBrackets(),
    isNew: true,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    emoji: '⌨',
    description: 'A terminal window with a prompt, waiting for your next command.',
    grid: generateTerminal(),
    isNew: true,
  },
  {
    id: 'robot',
    name: 'Robot',
    emoji: '🤖',
    description: 'A friendly bot with an antenna. Beep boop, ship code.',
    grid: generateRobot(),
    isNew: true,
  },
  {
    id: 'paws',
    name: 'Paw Prints',
    emoji: '🐾',
    description: 'Something walked across your keyboard all year.',
    grid: generatePawPrints(),
    isNew: true,
  },
  {
    id: 'starfield',
    name: 'Starfield',
    emoji: '✨',
    description: 'A scattered night sky with a few bright twinkles.',
    grid: generateStarfield(),
    isNew: true,
  },
  {
    id: 'equalizer',
    name: 'Equalizer',
    emoji: '🎚',
    description: 'Audio bars bouncing across the year. Coding playlist on.',
    grid: generateEqualizer(),
    isNew: true,
  },
  {
    id: 'diamonds',
    name: 'Diamonds',
    emoji: '💠',
    description: 'A repeating diamond lattice that fills the whole graph.',
    grid: generateDiamonds(),
    isNew: true,
  },
  {
    id: 'hireme',
    name: 'HIRE ME',
    emoji: '💼',
    description: 'Say it loud on the one page every recruiter checks.',
    grid: generateFromText('HIRE ME'),
    isNew: true,
  },
  {
    id: 'lgtm',
    name: 'LGTM',
    emoji: '✅',
    description: 'Looks good to me. Approved, for the whole year.',
    grid: generateFromText('LGTM'),
    isNew: true,
  },
  {
    id: '404',
    name: '404',
    emoji: '🔍',
    description: 'Contributions not found. Ironically, made of contributions.',
    grid: generateFromText('404'),
    isNew: true,
  },
  {
    id: 'bee',
    name: 'Busy Bee',
    emoji: '🐝',
    description: 'Striped and buzzing. Made for the yellow graph.',
    grid: generateBee(),
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    emoji: '🌅',
    description: 'A sun cresting the horizon across your year.',
    grid: generateSunrise(),
  },
  {
    id: 'skyline',
    name: 'Skyline',
    emoji: '🏙',
    description: 'City blocks with lit windows. Night-shift commits.',
    grid: generateSkyline(),
  },
  {
    id: 'lightning',
    name: 'Lightning',
    emoji: '⚡',
    description: 'One bold bolt. For your fastest shipping streak.',
    grid: generateLightning(),
  },
  {
    id: 'shipit',
    name: 'SHIP IT!',
    emoji: '📦',
    description: 'The only commit message that matters.',
    grid: generateFromText('SHIP IT!'),
  },
  {
    id: 'smiley',
    name: 'Smiley',
    emoji: '🙂',
    description: 'A friendly face for anyone visiting your profile.',
    grid: generateSmiley(),
  },
  {
    id: 'cat',
    name: 'Cat',
    emoji: '🐱',
    description: 'Pointy ears, whiskers, zero bugs (allegedly).',
    grid: generateCat(),
  },
  {
    id: 'coffee',
    name: 'Coffee',
    emoji: '☕',
    description: 'Steaming mug. Fuel for every green — or yellow — square.',
    grid: generateCoffee(),
  },
  {
    id: 'chevrons',
    name: 'Chevrons',
    emoji: '»',
    description: 'Forward-pointing arrows with a soft fade. Always moving.',
    grid: generateChevrons(),
  },
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
