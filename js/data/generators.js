// ═══════════════════════════════════════════════════════
//  QUESTION GENERATORS + MATH UTILITIES
//  Each generate* function returns:
//    { display, answer, typeLabel, maxDigits }
// ═══════════════════════════════════════════════════════

// ── Utilities ────────────────────────────────────────
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr)       { return arr[Math.floor(Math.random() * arr.length)]; }
function digits(n)       { return String(Math.abs(n)).length; }

// ── Addition ─────────────────────────────────────────
function generateAdd1D1D(item) {
  const { a, b } = item, ans = a + b;
  return { display: `${a} + ${b}`, answer: ans, typeLabel: 'addition', maxDigits: digits(ans) };
}

function generateAdd2D2D() {
  const a = rand(12, 99), b = rand(12, 99), ans = a + b;
  return { display: `${a} + ${b}`, answer: ans, typeLabel: 'addition', maxDigits: digits(ans) };
}

function generateAddXY02D() {
  const xy = rand(11, 99), a = xy * 10, b = rand(12, 99), ans = a + b;
  return { display: `${a} + ${b}`, answer: ans, typeLabel: 'addition', maxDigits: digits(ans) };
}

function generateAdd3D3D() {
  const a = rand(112, 899), b = rand(112, 899), ans = a + b;
  return { display: `${a} + ${b}`, answer: ans, typeLabel: 'addition', maxDigits: digits(ans) };
}

// ── Subtraction ──────────────────────────────────────
function generateSub1D1D(item) {
  const { a, b } = item, ans = a - b;
  return { display: `${a} − ${b}`, answer: ans, typeLabel: 'subtraction', maxDigits: digits(ans) };
}

function generateComp10(item) {
  const { b } = item, ans = 10 - b;
  return { display: `10 − ${b}`, answer: ans, typeLabel: 'complement to 10', maxDigits: digits(ans) };
}

function generateMul10(item) {
  const { tens, b } = item, a = tens * 10, ans = a - b;
  return { display: `${a} − ${b}`, answer: ans, typeLabel: 'tens − 1D', maxDigits: digits(ans) };
}

function generateSub2D2D() {
  const a = rand(21, 99), b = rand(11, a - 5);
  return { display: `${a} − ${b}`, answer: a - b, typeLabel: 'subtraction', maxDigits: digits(a - b) };
}

function generateSub3D2D() {
  const b = rand(11, 99), a = rand(b + 10, 899);
  return { display: `${a} − ${b}`, answer: a - b, typeLabel: 'subtraction', maxDigits: digits(a - b) };
}

function generateSub3D3D() {
  const b = rand(112, 699), a = rand(b + 10, 899);
  return { display: `${a} − ${b}`, answer: a - b, typeLabel: 'subtraction', maxDigits: digits(a - b) };
}

// ── Multiplication ───────────────────────────────────
function generateMul1D1D(item) {
  const { a, b } = item, ans = a * b;
  return { display: `${a} × ${b}`, answer: ans, typeLabel: 'multiplication', maxDigits: digits(ans) };
}

function generateMul2D1D() {
  const td = rand(12, 99), od = rand(3, 9), fwd = rand(0, 1) === 0, ans = td * od;
  const display = fwd ? `${td} × ${od}` : `${od} × ${td}`;
  return { display, answer: ans, typeLabel: 'multiplication', maxDigits: digits(ans) };
}

function generateMul2D2D() {
  const a = rand(12, 49), b = rand(12, 49), ans = a * b;
  return { display: `${a} × ${b}`, answer: ans, typeLabel: 'multiplication', maxDigits: digits(ans) };
}

// ── Tables ───────────────────────────────────────────
function generateTables(item) {
  const { t, b } = item, ans = t * b, type = rand(0, 1);
  if (type === 0) return { display: `${t} × ${b}`,          answer: ans, typeLabel: 'tables', maxDigits: digits(ans) };
  return         { display: `${t} × ? = ${ans}`, answer: b,   typeLabel: 'tables', maxDigits: digits(b) };
}

// ── Squares ──────────────────────────────────────────
function generateSquares(item) {
  const { n } = item, ans = n * n;
  return { display: `${n}²`, answer: ans, typeLabel: 'square', maxDigits: digits(ans) };
}

// ── Cubes ────────────────────────────────────────────
function generateCubes(item) {
  const { n } = item, ans = n * n * n;
  return { display: `${n}³`, answer: ans, typeLabel: 'cube', maxDigits: digits(ans) };
}
