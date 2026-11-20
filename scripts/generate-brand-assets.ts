/**
 * Generates favicon, app icons, logo.png and the default social share image
 * from the SVG mark. Re-run after replacing the mark with the official logo:
 *   npx tsx scripts/generate-brand-assets.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const GREEN = "#3a7d44";
const GOLD = "#c9a24a";
const DARK = "#102219";

const mark = (bg = GREEN, fg = "#ffffff") => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <rect width="40" height="40" rx="11" fill="${bg}"/>
  <path d="M9 17.5 20 9l11 8.5" fill="none" stroke="${fg}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M13 16h14M20 16v15" fill="none" stroke="${fg}" stroke-width="3.2" stroke-linecap="round"/>
  <circle cx="30.5" cy="29.5" r="2.5" fill="${GOLD}"/>
</svg>`;

const publicImages = path.resolve("public/images");
const appDir = path.resolve("src/app");
mkdirSync(publicImages, { recursive: true });

async function png(svg: string, size: number) {
  return sharp(Buffer.from(svg), { density: 600 }).resize(size, size).png().toBuffer();
}

/** Minimal .ico container holding one PNG image (supported by all modern browsers). */
function icoFromPng(pngData: Buffer, size: number) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngData.length, 8);
  entry.writeUInt32LE(6 + 16, 12);
  return Buffer.concat([header, entry, pngData]);
}

async function main() {
  writeFileSync(path.join(appDir, "icon.svg"), mark().trim());
  writeFileSync(path.join(appDir, "favicon.ico"), icoFromPng(await png(mark(), 48), 48));
  writeFileSync(path.join(appDir, "apple-icon.png"), await png(mark(), 180));
  writeFileSync(path.join(publicImages, "icon-192.png"), await png(mark(), 192));
  writeFileSync(path.join(publicImages, "icon-512.png"), await png(mark(), 512));

  // Square logo for structured data (Google requires a raster logo, min 112px).
  const logo = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#ffffff"/>
  <g transform="translate(96 40) scale(8)">${mark().replace(/<\/?svg[^>]*>/g, "")}</g>
  <text x="256" y="430" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="64" letter-spacing="6" fill="${DARK}">TEMER</text>
  <text x="256" y="478" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="26" letter-spacing="14" fill="#b8892f">PROPERTIES</text>
</svg>`;
  await sharp(Buffer.from(logo)).png().toFile(path.join(publicImages, "logo.png"));

  const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="g1" cx="0.9" cy="0" r="0.9"><stop offset="0" stop-color="${GREEN}" stop-opacity="0.9"/><stop offset="1" stop-color="${DARK}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="0" cy="1.1" r="0.7"><stop offset="0" stop-color="${GOLD}" stop-opacity="0.35"/><stop offset="1" stop-color="${DARK}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="${DARK}"/>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect width="1200" height="630" fill="url(#g2)"/>
  <g transform="translate(90 110) scale(3.2)">${mark().replace(/<\/?svg[^>]*>/g, "")}</g>
  <text x="240" y="170" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="58" letter-spacing="6" fill="#ffffff">TEMER</text>
  <text x="243" y="214" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="24" letter-spacing="13" fill="${GOLD}">PROPERTIES</text>
  <text x="90" y="370" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="64" fill="#ffffff">Apartments, homes &amp; shops</text>
  <text x="90" y="448" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="64" fill="#ffffff">for sale in Addis Ababa</text>
  <text x="90" y="530" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#c2dfc6">Buy direct from the developer · Book a free site visit</text>
</svg>`;
  await sharp(Buffer.from(og)).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(publicImages, "og-default.jpg"));

  console.log("✓ Brand assets written to src/app (icon.svg, favicon.ico, apple-icon.png) and public/images");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
