/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Genera public/brand/email-fondo.png: el fondo de red de nodos del sitio (fondo
// vainilla, puntos y líneas finas, unos pocos puntos en carmesí) para las plantillas
// de correo. Es determinista (misma semilla → misma imagen). Uso: node scripts/make-email-bg.mjs
import sharp from "sharp";

const W = 900;
const H = 900;
let seed = 20260918;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

// Nodos en grupos pequeños, unidos entre sí como en NodesBackground.
const nodes = [];
for (let g = 0; g < 9; g++) {
  const cx = rand() * W;
  const cy = rand() * H;
  const count = 3 + Math.floor(rand() * 3);
  for (let i = 0; i < count; i++) {
    nodes.push({
      x: (cx + (rand() - 0.5) * 240 + W) % W,
      y: (cy + (rand() - 0.5) * 240 + H) % H,
      accent: rand() < 0.12,
    });
  }
}

const lines = [];
for (let i = 0; i < nodes.length; i++) {
  for (let j = i + 1; j < nodes.length; j++) {
    const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
    if (d < 190) {
      lines.push(
        `<line x1="${nodes[i].x.toFixed(1)}" y1="${nodes[i].y.toFixed(1)}" x2="${nodes[j].x.toFixed(1)}" y2="${nodes[j].y.toFixed(1)}" stroke="#DDDAD2" stroke-width="1"/>`,
      );
    }
  }
}
const dots = nodes.map(
  (n) =>
    `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${n.accent ? 2.6 : 1.9}" fill="${n.accent ? "#C83C2A" : "#BDBAB1"}"/>`,
);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#FAF8F3"/>${lines.join("")}${dots.join("")}</svg>`;
await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toFile("public/brand/email-fondo.png");
console.log("public/brand/email-fondo.png listo");
