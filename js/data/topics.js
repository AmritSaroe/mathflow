// ═══════════════════════════════════════════════════════
//  TOPIC DEFINITIONS
//  Depends on: pools.js, generators.js (loaded first)
// ═══════════════════════════════════════════════════════

const TOPICS = {
  // ── ADDITION ──────────────────────────────────────
  add_1d1d: {
    name: '1D + 1D', section: 'addition',
    desc: 'single digit foundations',
    srs: true, generate: generateAdd1D1D, pool: buildAdd1D1DPool()
  },
  add_2d2d: {
    name: '2D + 2D', section: 'addition',
    desc: 'e.g. 47 + 63',
    srs: false, generate: generateAdd2D2D
  },
  add_xy0_2d: {
    name: 'XY0 + 2D', section: 'addition',
    desc: 'e.g. 320 + 47',
    srs: false, generate: generateAddXY02D
  },
  add_3d3d: {
    name: '3D + 3D', section: 'addition',
    desc: 'e.g. 473 + 628',
    srs: false, generate: generateAdd3D3D
  },

  // ── SUBTRACTION ───────────────────────────────────
  sub_1d1d: {
    name: 'Single Digit Facts', section: 'subtraction',
    desc: 'foundations e.g. 9−3, 8−5',
    srs: true, generate: generateSub1D1D, pool: buildSub1D1DPool()
  },
  sub_comp10: {
    name: 'Complements to 10', section: 'subtraction',
    desc: '10−? e.g. 10−7=3',
    srs: true, generate: generateComp10, pool: buildComp10Pool()
  },
  sub_mul10: {
    name: 'Tens minus 1D', section: 'subtraction',
    desc: 'e.g. 50−7, 80−3',
    srs: true, generate: generateMul10, pool: buildMul101DPool()
  },
  sub_2d2d: {
    name: '2D − 2D', section: 'subtraction',
    desc: 'e.g. 73 − 28',
    srs: false, generate: generateSub2D2D
  },
  sub_3d2d: {
    name: '3D − 2D', section: 'subtraction',
    desc: 'e.g. 473 − 58',
    srs: false, generate: generateSub3D2D
  },
  sub_3d3d: {
    name: '3D − 3D', section: 'subtraction',
    desc: 'e.g. 731 − 248',
    srs: false, generate: generateSub3D3D
  },

  // ── MULTIPLICATION ────────────────────────────────
  mul_1d1d: {
    name: '1D × 1D', section: 'multiplication',
    desc: 'e.g. 7 × 8',
    srs: true, generate: generateMul1D1D, pool: buildMul1D1DPool()
  },
  mul_2d1d: {
    name: '2D × 1D', section: 'multiplication',
    desc: 'both ways e.g. 47×6 and 6×47',
    srs: false, generate: generateMul2D1D
  },
  mul_2d2d: {
    name: '2D × 2D', section: 'multiplication',
    desc: 'e.g. 47 × 63',
    srs: false, generate: generateMul2D2D
  },

  // ── MEMORY & RECALL ───────────────────────────────
  tables_2_9: {
    name: 'Tables 2–9', section: 'memory',
    desc: 'all 3 directions',
    srs: true, generate: generateTables,
    pool: buildTablesPool(2, 9), tableRange: [2, 9]
  },
  tables_11_19: {
    name: 'Tables 11–19', section: 'memory',
    desc: 'all 3 directions',
    srs: true, generate: generateTables,
    pool: buildTablesPool(11, 19), tableRange: [11, 19]
  },
  tables_odd20s: {
    name: 'Tables 21–29 (odd)', section: 'memory',
    desc: '21,23,25,27,29 · all 3 directions',
    srs: true, generate: generateTables,
    pool: buildTablesPool(null, null, [21, 23, 25, 27, 29]),
    tableNums: [21, 23, 25, 27, 29]
  },
  tables_even20s: {
    name: 'Tables 22–28 (even)', section: 'memory',
    desc: '22,24,26,28 · all 3 directions',
    srs: true, generate: generateTables,
    pool: buildTablesPool(null, null, [22, 24, 26, 28]),
    tableNums: [22, 24, 26, 28]
  },
  squares: {
    name: 'Squares', section: 'memory',
    desc: 'n² · 2 to 40',
    srs: true, generate: generateSquares, pool: buildSquaresPool()
  },
  cubes: {
    name: 'Cubes', section: 'memory',
    desc: 'n³ · 2 to 20',
    srs: true, generate: generateCubes, pool: buildCubesPool()
  }
};

// ── Section metadata ──────────────────────────────────
const SECTIONS = {
  addition:       { label: 'Addition',        containerId: 'additionCards' },
  subtraction:    { label: 'Subtraction',     containerId: 'subtractionCards' },
  multiplication: { label: 'Multiplication',  containerId: 'multiplicationCards' },
  memory:         { label: 'Memory & Recall', containerId: 'memoryCards' }
};

// ── Group topics by section (computed once at load) ───
const SECTION_TOPICS = {};
for (const [id, t] of Object.entries(TOPICS)) {
  if (!SECTION_TOPICS[t.section]) SECTION_TOPICS[t.section] = [];
  SECTION_TOPICS[t.section].push({ id, ...t });
}
