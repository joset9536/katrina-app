import { Jimp, JimpMime } from "jimp";
import fs from "node:fs";

const src = process.argv[2];
const outDir = process.argv[3];
if (!src || !outDir) {
  console.error("usage: node make-round-favicon.mjs <src> <outdir>");
  process.exit(1);
}

const img = await Jimp.read(src);
const size = Math.min(img.bitmap.width, img.bitmap.height);
img.crop({ x: Math.floor((img.bitmap.width - size) / 2), y: Math.floor((img.bitmap.height - size) / 2), w: size, h: size });

function circleMask(base) {
  const w = base.bitmap.width;
  const h = base.bitmap.height;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2 - 1;
  base.scan(0, 0, w, h, function (x, y, idx) {
    const dx = x + 0.5 - cx;
    const dy = y + 0.5 - cy;
    if (dx * dx + dy * dy > r * r) this.bitmap.data[idx + 3] = 0;
  });
  return base;
}

async function writeSize(px, name) {
  const clone = img.clone().resize({ w: px, h: px });
  circleMask(clone);
  const buf = await clone.getBuffer(JimpMime.png);
  fs.writeFileSync(`${outDir}/${name}`, buf);
  console.log("wrote", name, px);
}

fs.mkdirSync(outDir, { recursive: true });
await writeSize(32, "favicon-32.png");
await writeSize(48, "favicon.png");
await writeSize(192, "icon-192.png");
await writeSize(512, "icon-512.png");
