import { rand, pick, digits } from './utils'

export { rand, pick, digits }

export function generateAdd1D1D({ a, b }) {
  const ans = a + b
  return { display: `${a} + ${b}`, answer: ans, typeLabel: 'addition', maxDigits: digits(ans) }
}
export function generateAdd2D2D() {
  const a = rand(12, 99), b = rand(12, 99), ans = a + b
  return { display: `${a} + ${b}`, answer: ans, typeLabel: 'addition', maxDigits: digits(ans) }
}
export function generateAddXY02D() {
  const a = rand(11, 99) * 10, b = rand(12, 99), ans = a + b
  return { display: `${a} + ${b}`, answer: ans, typeLabel: 'addition', maxDigits: digits(ans) }
}
export function generateAdd3D3D() {
  const a = rand(112, 899), b = rand(112, 899), ans = a + b
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
export function generateSub2D2D() {
  const a = rand(21, 99), b = rand(11, a - 5)
  return { display: `${a} − ${b}`, answer: a - b, typeLabel: 'subtraction', maxDigits: digits(a - b) }
}
export function generateSub3D2D() {
  const b = rand(11, 99), a = rand(b + 10, 899)
  return { display: `${a} − ${b}`, answer: a - b, typeLabel: 'subtraction', maxDigits: digits(a - b) }
}
export function generateSub3D3D() {
  const b = rand(112, 699), a = rand(b + 10, 899)
  return { display: `${a} − ${b}`, answer: a - b, typeLabel: 'subtraction', maxDigits: digits(a - b) }
}

export function generateMul1D1D({ a, b }) {
  const ans = a * b
  return { display: `${a} × ${b}`, answer: ans, typeLabel: 'multiplication', maxDigits: digits(ans) }
}
export function generateMul2D1D() {
  const td = rand(12, 99), od = rand(3, 9), fwd = rand(0, 1) === 0, ans = td * od
  return { display: fwd ? `${td} × ${od}` : `${od} × ${td}`, answer: ans, typeLabel: 'multiplication', maxDigits: digits(ans) }
}
export function generateMul2D2D() {
  const a = rand(12, 49), b = rand(12, 49), ans = a * b
  return { display: `${a} × ${b}`, answer: ans, typeLabel: 'multiplication', maxDigits: digits(ans) }
}
export function generateMul1D3D() {
  const od = rand(2, 9), td = rand(112, 899), fwd = rand(0, 1) === 0, ans = od * td
  return { display: fwd ? `${td} × ${od}` : `${od} × ${td}`, answer: ans, typeLabel: 'multiplication', maxDigits: digits(ans) }
}

export function generateMulConsecutive() {
  const n = rand(10, 49), ans = n * (n + 1)
  return { display: `${n} × ${n + 1}`, answer: ans, typeLabel: 'multiplication', maxDigits: digits(ans) }
}
export function generateMulGap2() {
  const n = rand(10, 58), ans = n * (n + 2)
  return { display: `${n} × ${n + 2}`, answer: ans, typeLabel: 'multiplication', maxDigits: digits(ans) }
}
export function generateMulEvenGap() {
  const gap = pick([4, 6, 8]), n = rand(10, 60 - gap), ans = n * (n + gap)
  return { display: `${n} × ${n + gap}`, answer: ans, typeLabel: 'multiplication', maxDigits: digits(ans) }
}
export function generateMulEnds5() {
  const vals = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125]
  const a = pick(vals), b = pick(vals), ans = a * b
  return { display: `${a} × ${b}`, answer: ans, typeLabel: 'multiplication', maxDigits: digits(ans) }
}
export function generateMulHalfStep() {
  const base = rand(5, 100) * 2, mult = pick([0.5, 1.5, 2.5, 3.5]), ans = base * mult
  return { display: `${base} × ${mult}`, answer: ans, typeLabel: 'multiplication', maxDigits: digits(ans) }
}

export function generateTables({ t, b }) {
  const ans = t * b
  if (rand(0, 1) === 0) return { display: `${t} × ${b}`,          answer: ans, typeLabel: 'tables', maxDigits: digits(ans) }
  return                       { display: `${t} × ? = ${ans}`, answer: b,   typeLabel: 'tables', maxDigits: digits(b) }
}
export function generateSquares({ n }) {
  const ans = n * n
  return { display: `${n}²`, answer: ans, typeLabel: 'square', maxDigits: digits(ans) }
}
export function generateCubes({ n }) {
  const ans = n * n * n
  return { display: `${n}³`, answer: ans, typeLabel: 'cube', maxDigits: digits(ans) }
}
