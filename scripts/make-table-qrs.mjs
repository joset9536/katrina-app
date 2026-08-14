import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";

const BASE = "https://katrinaoran.vercel.app";
const outDir = path.resolve("public/qr");
fs.mkdirSync(outDir, { recursive: true });

for (let n = 1; n <= 30; n++) {
  const url = `${BASE}/?mesa=${n}`;
  const file = path.join(outDir, `mesa-${String(n).padStart(2, "0")}.png`);
  await QRCode.toFile(file, url, {
    type: "png",
    width: 640,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#0b0713", light: "#ffffff" },
  });
}

const cards = Array.from({ length: 30 }, (_, i) => {
  const n = i + 1;
  const pad = String(n).padStart(2, "0");
  return `<article class="card">
  <p class="brand">KATRINA</p>
  <p class="mesa">Mesa ${n}</p>
  <img src="./mesa-${pad}.png" alt="QR mesa ${n}" />
  <p class="hint">Escaneá para ver la carta y llamar al mozo</p>
  <p class="url">${BASE}/?mesa=${n}</p>
</article>`;
}).join("\n");

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>QR mesas · Katrina</title>
  <style>
    @page { size: A4; margin: 12mm; }
    body { font-family: Arial, sans-serif; background: #fff; color: #0b0713; }
    h1 { font-size: 18px; margin: 0 0 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .card { border: 2px solid #0b0713; border-radius: 12px; padding: 10px; text-align: center; break-inside: avoid; }
    .brand { letter-spacing: .35em; font-size: 11px; margin: 0; }
    .mesa { font-size: 22px; font-weight: 700; margin: 4px 0 8px; }
    img { width: 180px; height: 180px; }
    .hint { font-size: 12px; margin: 6px 0 2px; }
    .url { font-size: 9px; word-break: break-all; color: #444; }
    @media print { button { display: none; } }
    button { margin: 8px 0 16px; padding: 10px 16px; }
  </style>
</head>
<body>
  <h1>Katrina · QR de mesas (imprimir y pegar)</h1>
  <button onclick="window.print()">Imprimir</button>
  <div class="grid">${cards}</div>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, "imprimir.html"), html);
console.log("QRs 1-30 + imprimir.html listos en public/qr");
