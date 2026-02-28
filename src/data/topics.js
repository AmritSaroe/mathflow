import {
  generateAdd1D1D, generateAdd2D2D, generateAddXY02D, generateAdd3D3D,
  generateSub1D1D, generateComp10, generateMul10, generateSub2D2D, generateSub3D2D, generateSub3D3D,
  generateMul1D1D, generateMul2D1D, generateMul2D2D, generateMul1D3D,
  generateTables, generateSquares, generateCubes,
} from '../engine/generators'
import {
  buildAdd1D1DPool, buildSub1D1DPool, buildComp10Pool, buildMul101DPool,
  buildMul1D1DPool, buildTablesPool, buildSquaresPool, buildCubesPool,
} from '../engine/pools'

export const TOPICS = {
  // Addition
  add_1d1d:     { name: 'Single digits',           section: 'addition',       desc: 'single digit foundations',        srs: true,  generate: generateAdd1D1D,   pool: buildAdd1D1DPool() },
  add_2d2d:     { name: 'Two-digit addition',      section: 'addition',       desc: 'e.g. 47 + 63',                   srs: false, generate: generateAdd2D2D },
  add_xy0_2d:   { name: 'Hundreds + two digits',       section: 'addition',       desc: 'e.g. 320 + 47',                  srs: false, generate: generateAddXY02D },
  add_3d3d:     { name: 'Three-digit addition',    section: 'addition',       desc: 'e.g. 473 + 628',                 srs: false, generate: generateAdd3D3D },

  // Subtraction
  sub_1d1d:     { name: 'Single digit subtraction', section: 'subtraction',   desc: 'foundations e.g. 9−3, 8−5',      srs: true,  generate: generateSub1D1D,   pool: buildSub1D1DPool() },
  sub_comp10:   { name: 'Make 10',        section: 'subtraction',   desc: '10−? e.g. 10−7=3',               srs: true,  generate: generateComp10,    pool: buildComp10Pool() },
  sub_mul10:    { name: 'Tens minus single digit',  section: 'subtraction',   desc: 'e.g. 50−7, 80−3',                srs: true,  generate: generateMul10,     pool: buildMul101DPool() },
  sub_2d2d:     { name: 'Two-digit subtraction',    section: 'subtraction',   desc: 'e.g. 73 − 28',                   srs: false, generate: generateSub2D2D },
  sub_3d2d:     { name: 'Mixed digit subtraction',    section: 'subtraction',   desc: 'e.g. 473 − 58',                  srs: false, generate: generateSub3D2D },
  sub_3d3d:     { name: 'Three-digit subtraction',  section: 'subtraction',   desc: 'e.g. 731 − 248',                 srs: false, generate: generateSub3D3D },

  // Multiplication
  mul_1d1d:     { name: 'Times tables',             section: 'multiplication', desc: 'e.g. 7 × 8',                     srs: true,  generate: generateMul1D1D,   pool: buildMul1D1DPool() },
  mul_2d1d:     { name: 'Two digits × one digit',       section: 'multiplication', desc: 'both ways e.g. 47×6 and 6×47',   srs: false, generate: generateMul2D1D },
  mul_2d2d:     { name: 'Two digits × two digits', section: 'multiplication', desc: 'e.g. 47 × 63',                   srs: false, generate: generateMul2D2D },
  mul_1d3d:     { name: 'One digit × three digits',        section: 'multiplication', desc: 'e.g. 4×473 and 473×4',           srs: false, generate: generateMul1D3D },

  // Memory
  tables_2_9:    { name: 'Tables 2–9',           section: 'memory',         desc: 'all 3 directions',                srs: true,  generate: generateTables,    pool: buildTablesPool(2, 9) },
  tables_11_19:  { name: 'Tables 11–19',         section: 'memory',         desc: 'all 3 directions',                srs: true,  generate: generateTables,    pool: buildTablesPool(11, 19) },
  tables_odd20s: { name: 'Tables 21–29 (odd)',   section: 'memory',         desc: '21,23,25,27,29 · all 3 dirs',     srs: true,  generate: generateTables,    pool: buildTablesPool(null, null, [21,23,25,27,29]) },
  tables_even20s:{ name: 'Tables 22–28 (even)',  section: 'memory',         desc: '22,24,26,28 · all 3 dirs',        srs: true,  generate: generateTables,    pool: buildTablesPool(null, null, [22,24,26,28]) },
  squares:       { name: 'Squares',              section: 'memory',         desc: 'n² · 2 to 40',                    srs: true,  generate: generateSquares,   pool: buildSquaresPool() },
  cubes:         { name: 'Cubes',                section: 'memory',         desc: 'n³ · 2 to 20',                    srs: true,  generate: generateCubes,     pool: buildCubesPool() },
}

export const SECTIONS = [
  { key: 'addition',       label: 'Addition' },
  { key: 'subtraction',    label: 'Subtraction' },
  { key: 'multiplication', label: 'Multiplication' },
  { key: 'memory',         label: 'Memory & Recall' },
]

export const SECTION_TOPICS = {}
for (const [id, t] of Object.entries(TOPICS)) {
  if (!SECTION_TOPICS[t.section]) SECTION_TOPICS[t.section] = []
  SECTION_TOPICS[t.section].push({ id, ...t })
}
