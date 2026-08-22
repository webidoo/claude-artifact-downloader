/**
 * Generates the extension icons (orange disc + white download glyph) as PNGs
 * in icons/, with no image-library dependency. Run once: node scripts/make-icons.mjs
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c
})

function crc32(bytes) {
  let c = ~0
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return ~c >>> 0
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const out = Buffer.alloc(body.length + 8)
  out.writeUInt32BE(data.length, 0)
  body.copy(out, 4)
  out.writeUInt32BE(crc32(body), body.length + 4)
  return out
}

function png(size, rgbaAt) {
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1)
    raw[row] = 0 // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = rgbaAt(x, y)
      raw.set([r, g, b, a], row + 1 + x * 4)
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr.set([8, 6, 0, 0, 0], 8) // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const ORANGE = [198, 97, 63]
const WHITE = [255, 255, 255]

// Download glyph in unit coordinates: arrow stem + arrow head + tray line.
function inGlyph(u, v) {
  const du = Math.abs(u - 0.5)
  if (du <= 0.09 && v >= 0.2 && v <= 0.5) return true // stem
  if (v > 0.42 && v <= 0.7 && du <= ((0.7 - v) / 0.28) * 0.24) return true // head
  if (v >= 0.76 && v <= 0.85 && du <= 0.26) return true // tray
  return false
}

function makeIcon(size) {
  const SS = 4 // supersampling factor for smooth edges
  const radius = size / 2
  return png(size, (x, y) => {
    let bg = 0
    let fg = 0
    for (let i = 0; i < SS; i++) {
      for (let j = 0; j < SS; j++) {
        const px = x + (i + 0.5) / SS
        const py = y + (j + 0.5) / SS
        if (Math.hypot(px - radius, py - radius) > radius) continue
        bg++
        if (inGlyph(px / size, py / size)) fg++
      }
    }
    const coverage = bg / (SS * SS)
    if (coverage === 0) return [0, 0, 0, 0]
    const mix = fg / bg
    const color = ORANGE.map((c, k) => Math.round(c + (WHITE[k] - c) * mix))
    return [...color, Math.round(coverage * 255)]
  })
}

mkdirSync('icons', { recursive: true })
for (const size of [16, 48, 128]) {
  writeFileSync(`icons/icon${size}.png`, makeIcon(size))
  console.log(`icons/icon${size}.png`)
}
