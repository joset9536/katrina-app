import fs from "node:fs";
import path from "node:path";
import { Jimp } from "jimp";
import jsQR from "jsqr";

const file = process.argv[2];
if (!file) {
  console.error("usage: node decode-qr.mjs <png>");
  process.exit(1);
}
const img = await Jimp.read(file);
const { data, width, height } = img.bitmap;
const result = jsQR(new Uint8ClampedArray(data), width, height);
console.log(path.basename(file), "=>", result?.data ?? "NO QR");
