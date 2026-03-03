import { rand, pick, digits } from './utils'

export { rand, pick, digits }

// ---------------------------------------------------------------------------
// Fisher-Yates shuffle (in-place)
// ---------------------------------------------------------------------------
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ---------------------------------------------------------------------------
// CoverageQueue — exhausts every combo before reshuffling and repeating.
// Pass an array of param objects; call .next() to get the next one.
// ---------------------------------------------------------------------------
class CoverageQueue {
  constructor(combos) {
    this._source = combos
    this._queue  = []
  }
  next() {
    if (this._queue.length === 0) this._queue = shuffle([...this._source])
    return this._queue.pop()
  }
}

// ---------------------------------------------------------------------------
// Combo builders — enumerate every valid input for each random generator
// ---------------------------------------------------------------------------
function range(lo, hi, step = 1) {
  const out = []
  for (let i = lo; i <= hi; i += step) out.push(i)
  return out
}
function pairs(aVals, bVals, filter = () => true) {
  const out = []
  for (const a of aVals)
    for (const b of bVals)
      if (filter(a, b)) out.push({ a, b })
  return out
}

// One queue per generator type — module-level so they persist across calls
const Q = {
  add2D2D:   new CoverageQueue(pairs(range(12, 99), range(12, 99))),
  addXY02D:  new CoverageQueue(pairs(range(1, 9).map(n => n * 10), range(12, 99))),
  add3D3D:   new CoverageQueue(pairs(range(112, 899), range(112, 899))),

  sub2D2D:   new CoverageQueue(pairs(range(21, 99), range(11, 89), (a, b) => a > b + 4)),
  sub3D2D:   new CoverageQueue(pairs(range(112, 899), range(11, 99), (a, b) => a > b + 9)),
  sub3D3D:   new CoverageQueue(pairs(range(122, 899), range(112, 699), (a, b) => a > b + 9)),

  mul2D1D:   new CoverageQueue(pairs(range(12, 99), range(3, 9))),
  mul2D2D:   new CoverageQueue(pairs(range(12, 49), range(12, 49))),
  mul1D3D:   new CoverageQueue(pairs(range(2, 9), range(112, 899))),
}

// ---------------------------------------------------------------------------
// SRS-driven generators — params come from your SRS system, unchanged
// ---------------------------------------------------------------------------

export function generateAdd1D1D({ a, b }) {
  const ans = a + b
  return { display: `${a} + ${b}`, answer: ans, typeLabel: 'addition', maxDigits: digits(ans) }
}
export function generateSub1D1D({ a, b }) {
  const ans = a - b
  return { display: `${a} − ${b}`, answer: ans, typeLabel: 'subtraction', maxDigits: digits(ans) }
}
export function generateComp10({ b }) {
  const ans = 10 - b
  return { display: `10 − ${b}`, answer: ans, typeLabel: 'complement to 10', maxDigits: digits(ans) }
}
export function generateMul10({ tens, b }) {
  const a = tens * 10, ans = a - b
  return { display: `${a} − ${b}`, answer: ans, typeLabel: 'tens − 1D', maxDigits: digits(ans) }
}
export function generateMul1D1D({ a, b }) {
  const ans = a * b
  return { display: `${a} × ${b}`, answer: ans, typeLabel: 'multiplication', maxDigits: digits(ans) }
}
export function generateTables({ t, b }) {
  const ans = t * b
  if (rand(0, 1) === 0) return { display: `${t} × ${b}`,        answer: ans, typeLabel: 'tables',                 maxDigits: digits(ans) }
  return                       { display: `${t} × ? = ${ans}`,   answer: b,   typeLabel: 'tables (missing factor)', maxDigits: digits(b)   }
}
export function generateSquares({ n }) {
  const ans = n * n
  return { display: `${n}²`, answer: ans, typeLabel: 'square', maxDigits: digits(ans) }
}
export function generateCubes({ n }) {
  const ans = n * n * n
  return { display: `${n}³`, answer: ans, typeLabel: 'cube', maxDigits: digits(ans) }
}

// ---------------------------------------------------------------------------
// Full-coverage generators — each pulls from its CoverageQueue, no params needed.
// Every combination is seen exactly once before any repeat.
// ---------------------------------------------------------------------------

export function generateAdd2D2D() {
  const { a, b } = Q.add2D2D.next(), ans = a + b
  return { display: `${a} + ${b}`, answer: ans, typeLabel: 'addition', maxDigits: digits(ans) }
}
export function generateAddXY02D() {
  const { a, b } = Q.addXY02D.next(), ans = a + b
  return { display: `${a} + ${b}`, answer: ans, typeLabel: 'addition', maxDigits: digits(ans) }
}
export function generateAdd3D3D() {
  const { a, b } = Q.add3D3D.next(), ans = a + b
  return { display: `${a} + ${b}`, answer: ans, typeLabel: 'addition', maxDigits: digits(ans) }
}

export function generateSub2D2D() {
  const { a, b } = Q.sub2D2D.next()
  return { display: `${a} − ${b}`, answer: a - b, typeLabel: 'subtraction', maxDigits: digits(a - b) }
}
export function generateSub3D2D() {
  const { a, b } = Q.sub3D2D.next()
  return { display: `${a} − ${b}`, answer: a - b, typeLabel: 'subtraction', maxDigits: digits(a - b) }
}
export function generateSub3D3D() {
  const { a, b } = Q.sub3D3D.next()
  return { display: `${a} − ${b}`, answer: a - b, typeLabel: 'subtraction', maxDigits: digits(a - b) }
}

export function generateMul2D1D() {
  const { a, b } = Q.mul2D1D.next(), fwd = rand(0, 1) === 0, ans = a * b
  return { display: fwd ? `${a} × ${b}` : `${b} × ${a}`, answer: ans, typeLabel: 'multiplication', maxDigits: digits(ans) }
}
export function generateMul2D2D() {
  const { a, b } = Q.mul2D2D.next(), ans = a * b
  return { display: `${a} × ${b}`, answer: ans, typeLabel: 'multiplication', maxDigits: digits(ans) }
}
export function generateMul1D3D() {
  const { a, b } = Q.mul1D3D.next(), fwd = rand(0, 1) === 0, ans = a * b
  return { display: fwd ? `${b} × ${a}` : `${a} × ${b}`, answer: ans, typeLabel: 'multiplication', maxDigits: digits(ans) }
}
