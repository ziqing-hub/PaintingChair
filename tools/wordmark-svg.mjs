/**
 * 把文字用字型的「真實輪廓」轉成 SVG。
 *
 * 用途：網站商標原本靠 font-family: 'Bauhaus 93'，但那是 Windows 隨附字型，
 *       Mac 與 iPhone 沒有，整個商標會退回 Arial Black。改成 SVG 路徑就與字型無關。
 *
 * 怎麼用（在專案資料夾開命令列）：
 *
 *   node tools/wordmark-svg.mjs "C:/Windows/Fonts/BAUHS93.TTF" "Painting Chair" out.svg 0.025
 *                                └─ 字型檔          └─ 要轉的文字   └─ 輸出  └─ 字距(em)
 *
 * 產生的 out.svg 裡有一行 <path d="...">，把那串 d 貼回 index.html 的
 * .brand-wordmark 裡，同時把 viewBox 換成新的即可。
 *
 * 注意：
 *   · 這支程式是直接讀字型檔 glyf 表的控制點，不是把字渲染成點陣再描邊，所以是精確輪廓。
 *   · 只用到 Node 內建模組，不需要 npm install。
 *   · 只支援 cmap format 4（絕大多數字型都是）與基本拉丁字母。
 *   · 顏色用 fill="currentColor"，由 HTML 外層的文字顏色控制，不寫死在 SVG 裡。
 *
 * 產生本站現行商標的指令（結果與 index.html 內的完全相同）：
 *   node tools/wordmark-svg.mjs "C:/Windows/Fonts/BAUHS93.TTF" "Painting Chair" wordmark.svg 0.025
 */
import { readFileSync, writeFileSync } from 'node:fs'

const buf = readFileSync(process.argv[2] || 'C:/Windows/Fonts/BAUHS93.TTF')
const TEXT = process.argv[3] || 'Painting Chair'
const OUT = process.argv[4] || './wordmark.svg'
// 字距（em）。網頁上原本用 Tailwind 的 tracking-wide = 0.025em，
// 換成 SVG 之後容器的 letter-spacing 不再作用，所以要烙進字距裡。
const TRACK_EM = parseFloat(process.argv[5] || '0')

const u8 = o => buf.readUInt8(o)
const u16 = o => buf.readUInt16BE(o)
const i16 = o => buf.readInt16BE(o)
const u32 = o => buf.readUInt32BE(o)

// ── 表目錄 ──
const numTables = u16(4)
const tables = {}
for (let i = 0; i < numTables; i++) {
  const p = 12 + i * 16
  const tag = buf.toString('latin1', p, p + 4)
  tables[tag] = { off: u32(p + 8), len: u32(p + 12) }
}
const need = ['head', 'maxp', 'cmap', 'loca', 'glyf', 'hhea', 'hmtx']
for (const t of need) if (!tables[t]) throw new Error('缺少表：' + t)

const head = tables.head.off
const unitsPerEm = u16(head + 18)
const indexToLocFormat = i16(head + 50)
const numGlyphs = u16(tables.maxp.off + 4)
const numHMetrics = u16(tables.hhea.off + 34)
const ascent = i16(tables.hhea.off + 4)
const descent = i16(tables.hhea.off + 6)

// ── cmap（format 4）：字元 → glyph id ──
const cmapOff = tables.cmap.off
let sub = 0
const nSub = u16(cmapOff + 2)
for (let i = 0; i < nSub; i++) {
  const p = cmapOff + 4 + i * 8
  const plat = u16(p), enc = u16(p + 2), off = u32(p + 4)
  if ((plat === 3 && (enc === 1 || enc === 10)) || plat === 0) { sub = cmapOff + off; break }
}
if (!sub) throw new Error('找不到 Unicode cmap 子表')
const fmt = u16(sub)
if (fmt !== 4) throw new Error('只支援 cmap format 4，這個字型是 ' + fmt)
const segCountX2 = u16(sub + 6)
const segCount = segCountX2 / 2
const endCodes = sub + 14
const startCodes = endCodes + segCountX2 + 2
const idDeltas = startCodes + segCountX2
const idRangeOffs = idDeltas + segCountX2
const glyphIdFor = cp => {
  for (let s = 0; s < segCount; s++) {
    if (cp <= u16(endCodes + s * 2)) {
      const start = u16(startCodes + s * 2)
      if (cp < start) return 0
      const ro = u16(idRangeOffs + s * 2)
      if (ro === 0) return (cp + i16(idDeltas + s * 2)) & 0xFFFF
      const gp = idRangeOffs + s * 2 + ro + (cp - start) * 2
      const g = u16(gp)
      return g === 0 ? 0 : (g + i16(idDeltas + s * 2)) & 0xFFFF
    }
  }
  return 0
}

// ── loca / hmtx ──
const locaOff = tables.loca.off
const glyphRange = g => indexToLocFormat === 0
  ? [u16(locaOff + g * 2) * 2, u16(locaOff + (g + 1) * 2) * 2]
  : [u32(locaOff + g * 4), u32(locaOff + (g + 1) * 4)]
const advanceOf = g => u16(tables.hmtx.off + Math.min(g, numHMetrics - 1) * 4)

// ── glyf → 輪廓 ──
function contoursOf(gid, depth = 0) {
  if (depth > 4) return []
  const [s, e] = glyphRange(gid)
  if (s === e) return []                                  // 空白字元
  const g = tables.glyf.off + s
  const nc = i16(g)
  if (nc < 0) {                                           // composite glyph
    const out = []
    let p = g + 10
    for (;;) {
      const flags = u16(p), idx = u16(p + 2); p += 4
      let dx = 0, dy = 0
      if (flags & 1) { dx = i16(p); dy = i16(p + 2); p += 4 }
      else { dx = buf.readInt8(p); dy = buf.readInt8(p + 1); p += 2 }
      if (flags & 8) p += 2
      else if (flags & 0x40) p += 4
      else if (flags & 0x80) p += 8
      for (const c of contoursOf(idx, depth + 1))
        out.push(c.map(pt => ({ ...pt, x: pt.x + dx, y: pt.y + dy })))
      if (!(flags & 0x20)) break
    }
    return out
  }
  const ends = []
  for (let i = 0; i < nc; i++) ends.push(u16(g + 10 + i * 2))
  const nPts = ends[nc - 1] + 1
  let p = g + 10 + nc * 2
  p += 2 + u16(p)                                          // 跳過 instructions
  const flags = []
  while (flags.length < nPts) {
    const f = u8(p++); flags.push(f)
    if (f & 8) { let r = u8(p++); while (r-- > 0) flags.push(f) }
  }
  const xs = []; let x = 0
  for (const f of flags) {
    if (f & 2) { const d = u8(p++); x += (f & 16) ? d : -d }
    else if (!(f & 16)) { x += i16(p); p += 2 }
    xs.push(x)
  }
  const ys = []; let y = 0
  for (const f of flags) {
    if (f & 4) { const d = u8(p++); y += (f & 32) ? d : -d }
    else if (!(f & 32)) { y += i16(p); p += 2 }
    ys.push(y)
  }
  const out = []
  let start = 0
  for (const end of ends) {
    const c = []
    for (let i = start; i <= end; i++) c.push({ x: xs[i], y: ys[i], on: !!(flags[i] & 1) })
    out.push(c); start = end + 1
  }
  return out
}

/* TrueType 是二次貝茲：點分成「在線上」與「控制點」。
   兩個連續控制點之間有一個「隱含的線上點」，在中點。
   同時累積真實的墨跡邊界 —— 不能用 ascent/descent 當 viewBox：
   Bauhaus 93 是展示字體，大寫高度超出 hhea 的 ascender，
   用 ascent 當上緣會把字頂裁掉（第一版就是這樣，墨跡長寬比 5.70 vs 真實 7.32）。 */
const INK = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
const hit = (x, y) => {
  if (x < INK.x0) INK.x0 = x; if (x > INK.x1) INK.x1 = x
  if (y < INK.y0) INK.y0 = y; if (y > INK.y1) INK.y1 = y
}
// 二次貝茲的軸向極值：t = (p0-p1)/(p0-2p1+p2)，落在 (0,1) 內才算
const qExtrema = (p0, p1, p2) => {
  const den = p0 - 2 * p1 + p2
  if (Math.abs(den) < 1e-9) return []
  const t = (p0 - p1) / den
  if (t <= 0 || t >= 1) return []
  return [(1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2]
}

function normaliseContour(c) {
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, on: true })
  let pts = c.slice()
  const firstOn = pts.findIndex(p => p.on)
  if (firstOn === -1) pts = [mid(pts[0], pts[pts.length - 1]), ...pts]
  else if (firstOn > 0) pts = pts.slice(firstOn).concat(pts.slice(0, firstOn))
  return pts
}

/** 先走一遍只算邊界（含曲線極值），不產生字串 */
function measureContour(c, ox) {
  const pts = normaliseContour(c)
  const P = p => ({ x: p.x + ox, y: p.y })
  let cur = P(pts[0]); hit(cur.x, cur.y)
  let i = 1
  while (i <= pts.length) {
    const a = pts[i % pts.length]
    if (a.on) { const e = P(a); hit(e.x, e.y); cur = e; i++; continue }
    const nx = pts[(i + 1) % pts.length]
    const ctl = P(a)
    const end = nx.on ? P(nx) : P(mid(a, nx))
    hit(end.x, end.y)
    for (const v of qExtrema(cur.x, ctl.x, end.x)) hit(v, cur.y)
    for (const v of qExtrema(cur.y, ctl.y, end.y)) hit(cur.x, v)
    cur = end
    i += nx.on ? 2 : 1
  }
  function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, on: true } }
}

/** 第二遍才輸出 path，座標以墨跡左下角為原點、Y 翻轉 */
function contourToPath(c, ox, scale, flipY) {
  const pts = normaliseContour(c)
  const P = pt => `${((pt.x + ox - INK.x0) * scale).toFixed(2)} ${(flipY(pt.y) * scale).toFixed(2)}`
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, on: true })
  let d = `M ${P(pts[0])}`
  let i = 1
  while (i <= pts.length) {
    const cur = pts[i % pts.length]
    if (cur.on) { d += ` L ${P(cur)}`; i++; continue }
    const next = pts[(i + 1) % pts.length]
    const end = next.on ? next : mid(cur, next)
    d += ` Q ${P(cur)} ${P(end)}`
    i += next.on ? 2 : 1
  }
  return d + ' Z'
}

// ── kern（format 0）成對字距 ──
const kernPairs = new Map()
if (tables.kern) {
  const k = tables.kern.off
  const nTab = u16(k + 2)
  let p = k + 4
  for (let t = 0; t < nTab; t++) {
    const len = u16(p + 2), cov = u16(p + 4)
    if ((cov & 0xFF00) === 0 || (cov & 1)) {               // format 0
      const n = u16(p + 6)
      for (let i = 0; i < n; i++) {
        const q = p + 14 + i * 6
        kernPairs.set(u16(q) + ',' + u16(q + 2), i16(q + 4))
      }
    }
    p += len
  }
}

// ── 組字（兩遍：先量墨跡邊界，再輸出 path）──
const SCALE = 1000 / unitsPerEm
const glyphs = []
const missing = []
{
  let cursor = 0, prev = null
  for (const ch of TEXT) {
    const gid = glyphIdFor(ch.codePointAt(0))
    // glyph 0 是 .notdef。字型裡沒有這個字時會靜默畫出一個空框，
    // 看起來「成功了」但其實是垃圾（例如拿 Bauhaus 93 去轉中文）。要明確擋掉。
    if (gid === 0 && ch !== ' ') missing.push(ch)
    if (prev !== null) cursor += kernPairs.get(prev + ',' + gid) || 0
    glyphs.push({ gid, ox: cursor, contours: contoursOf(gid) })
    cursor += advanceOf(gid) + TRACK_EM * unitsPerEm
    prev = gid
  }
  for (const g of glyphs) for (const c of g.contours) measureContour(c, g.ox)
}
const flipY = y => (INK.y1 - y)          // 墨跡上緣當 0，Y 向下
const paths = []
let contourCount = 0
for (const g of glyphs) for (const c of g.contours) { paths.push(contourToPath(c, g.ox, SCALE, flipY)); contourCount++ }

if (missing.length) {
  console.error(`
  ✗ 這個字型沒有以下字元：${[...new Set(missing)].join(' ')}`)
  console.error(`     字型檔：${process.argv[2]}`)
  console.error(`     繼續產生只會得到空框（.notdef），所以這裡直接停下。`)
  console.error(`     例如 Bauhaus 93 只有拉丁字母，不能用來轉中文。
`)
  process.exit(1)
}
const W = +(((INK.x1 - INK.x0) * SCALE).toFixed(1))
const H = +(((INK.y1 - INK.y0) * SCALE).toFixed(1))
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${TEXT}">
  <title>${TEXT}</title>
  <path fill="currentColor" fill-rule="nonzero" d="${paths.join(' ')}"/>
</svg>
`
writeFileSync(OUT, svg, 'utf-8')
console.log(`  字距          ${TRACK_EM}em（${Math.round(TRACK_EM*unitsPerEm)} 單位／字）`)
console.log(`  字型          unitsPerEm ${unitsPerEm}　字形數 ${numGlyphs}　kern 對 ${kernPairs.size}`)
console.log(`  文字          「${TEXT}」　${[...TEXT].length} 字元　${contourCount} 條輪廓`)
console.log(`  墨跡邊界      x ${INK.x0}..${INK.x1}　y ${INK.y0}..${INK.y1}（字型單位）`)
console.log(`  viewBox       0 0 ${W} ${H}　長寬比 ${(W / H).toFixed(4)}`)
console.log(`  檔案大小      ${(svg.length / 1024).toFixed(1)} KB`)
console.log(`  已寫入        ${OUT}`)
