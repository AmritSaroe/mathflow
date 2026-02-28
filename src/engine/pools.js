export function buildAdd1D1DPool() {
  const p = []
  for (let a = 2; a <= 9; a++) for (let b = 2; b <= 9; b++) p.push({ a, b })
  return p
}

export function buildSub1D1DPool() {
  const p = []
  for (let a = 3; a <= 9; a++) for (let b = 2; b < a; b++) p.push({ a, b })
  return p
}

export function buildComp10Pool() {
  const p = []
  for (let b = 1; b <= 9; b++) p.push({ b })
  return p
}

export function buildMul101DPool() {
  const p = []
  for (let tens = 2; tens <= 9; tens++) for (let b = 2; b <= 9; b++) p.push({ tens, b })
  return p
}

export function buildMul1D1DPool() {
  const p = []
  for (let a = 3; a <= 9; a++) for (let b = 3; b <= 9; b++) p.push({ a, b })
  return p
}

export function buildTablesPool(min, max, specific) {
  const nums = specific || Array.from({ length: max - min + 1 }, (_, i) => i + min)
  const p = []
  for (const t of nums) for (let b = 2; b <= 9; b++) p.push({ t, b })
  return p
}

export function buildSquaresPool() {
  const p = []
  for (let n = 2; n <= 40; n++) p.push({ n })
  return p
}

export function buildCubesPool() {
  const p = []
  for (let n = 2; n <= 20; n++) p.push({ n })
  return p
}
