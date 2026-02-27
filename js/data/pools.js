// ═══════════════════════════════════════════════════════
//  POOL BUILDERS
//  Each function returns an array of "item" objects that
//  the SRS engine tracks and the question generators use.
// ═══════════════════════════════════════════════════════

function buildAdd1D1DPool() {
  const pool = [];
  for (let a = 2; a <= 9; a++)
    for (let b = 2; b <= 9; b++)
      pool.push({ a, b });
  return pool;
}

function buildSub1D1DPool() {
  const pool = [];
  for (let a = 3; a <= 9; a++)
    for (let b = 2; b < a; b++)
      pool.push({ a, b });
  return pool;
}

function buildComp10Pool() {
  const pool = [];
  for (let b = 1; b <= 9; b++)
    pool.push({ b });
  return pool;
}

function buildMul101DPool() {
  const pool = [];
  for (let tens = 2; tens <= 9; tens++)
    for (let b = 2; b <= 9; b++)
      pool.push({ tens, b });
  return pool;
}

function buildMul1D1DPool() {
  const pool = [];
  for (let a = 3; a <= 9; a++)
    for (let b = 3; b <= 9; b++)
      pool.push({ a, b });
  return pool;
}

function buildTablesPool(min, max, specific) {
  const nums = specific || Array.from({ length: max - min + 1 }, (_, i) => i + min);
  const pool = [];
  for (const t of nums)
    for (let b = 2; b <= 9; b++)
      pool.push({ t, b });
  return pool;
}

function buildSquaresPool() {
  const pool = [];
  for (let n = 2; n <= 40; n++) pool.push({ n });
  return pool;
}

function buildCubesPool() {
  const pool = [];
  for (let n = 2; n <= 20; n++) pool.push({ n });
  return pool;
}
