/**
 * Generates the PWA icon set from an inline SVG barbell mark.
 * Run: node scripts/gen-icons.mjs   (requires the sharp devDependency)
 */
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const LIME = "#c8f050";
const TEAL = "#45e6d0";

/** Barbell mark centered in a `size` box, scaled by `scale`. */
function markSvg(size, scale) {
  const s = (v) => (v * size * scale) / 512;
  const cx = size / 2;
  const cy = size / 2;
  const barW = s(360);
  const barH = s(28);
  const plate = (dx, w, h, color) =>
    `<rect x="${cx + dx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${w / 2.6}" fill="${color}"/>`;
  return `
    <rect x="${cx - barW / 2}" y="${cy - barH / 2}" width="${barW}" height="${barH}" rx="${barH / 2}" fill="${LIME}"/>
    ${plate(-s(128), s(40), s(190), LIME)}
    ${plate(-s(172), s(30), s(130), TEAL)}
    ${plate(s(128), s(40), s(190), LIME)}
    ${plate(s(172), s(30), s(130), TEAL)}
  `;
}

function iconSvg(size, { maskable }) {
  // Maskable icons keep content inside the inner 80% safe zone.
  const scale = maskable ? 0.62 : 0.82;
  const radius = maskable ? 0 : size * 0.22;
  return Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${radius}" fill="#000000"/>
      ${markSvg(size, scale)}
    </svg>`,
  );
}

await mkdir("public/icons", { recursive: true });
for (const [file, size, maskable] of [
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["maskable-512.png", 512, true],
]) {
  const png = await sharp(iconSvg(size, { maskable })).png().toBuffer();
  await writeFile(`public/icons/${file}`, png);
  console.log(`wrote public/icons/${file} (${png.length} bytes)`);
}

// App-route favicon: Next picks up src/app/icon.png automatically.
const favicon = await sharp(iconSvg(64, { maskable: false })).png().toBuffer();
await writeFile("src/app/icon.png", favicon);
console.log("wrote src/app/icon.png");
