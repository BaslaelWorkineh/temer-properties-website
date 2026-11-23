/**
 * Generates every brand image from the official logo (brand/temer-properties-logo.jpg,
 * white artwork on a green gradient):
 *   - src/assets/brand/logo-color.png, logo-white.png: transparent cut-outs for the header/footer
 *   - src/app favicon.ico, icon.png, apple-icon.png and public/images/icon-*.png
 *   - public/images/logo.png (structured data) and og-default.jpg (default share image)
 * the old green hero background (src/assets/hero/city-sunset-green.jpg) from brand/city-view-sunset.avif,
 * and the current home hero (src/assets/hero/towers-dusk.jpg) from the Sarbet City Plus dusk render.
 * Re-run after replacing a source file:
 *   npx tsx scripts/generate-brand-assets.ts
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SOURCE = path.resolve("brand/temer-properties-logo.jpg");
const HERO_SOURCE = path.resolve("brand/city-view-sunset.avif");

const GREEN = "#3a7d44";
const GOLD = "#c9a24a";
const DARK = "#102219";
/** Darker end of the logo's own gradient, so the cut-out stays readable on white (≥3.5:1). */
const LOGO_INK_FROM = "#597318";
const LOGO_INK_TO = "#6f9324";

const publicImages = path.resolve("public/images");
const brandAssets = path.resolve("src/assets/brand");
const heroAssets = path.resolve("src/assets/hero");
const appDir = path.resolve("src/app");
mkdirSync(publicImages, { recursive: true });
mkdirSync(brandAssets, { recursive: true });
mkdirSync(heroAssets, { recursive: true });

/**
 * Current home hero (src/assets/hero/towers-dusk.jpg): the Sarbet City Plus dusk render, at 4K width.
 * The only copy we have of the render is 1280×720 (public/images/gallery/sarbet-city-plus-dusk.jpg), so
 * TOWERS_SOURCE is a 4× AI upscale of it (Real-ESRGAN, realesrgan-x4plus model, 5120×2880), which redraws edges
 * and windows crisply. The right edge is trimmed so the towers sit further right, clear of the text card on the left.
 * When the full-resolution render from the visualiser is available, point TOWERS_SOURCE at it and re-run.
 */
const TOWERS_SOURCE = path.resolve("brand/sarbet-city-plus-dusk-upscaled.jpg");
const TOWERS_TRIM_RIGHT = 0.18;
const TOWERS_WIDTH = 3840;

async function towersHero() {
  const { width = 0, height = 0 } = await sharp(TOWERS_SOURCE).metadata();
  const keep = Math.round(width * (1 - TOWERS_TRIM_RIGHT));
  const outHeight = Math.round((TOWERS_WIDTH * height) / keep);
  await sharp(TOWERS_SOURCE)
    .extract({ left: 0, top: 0, width: keep, height })
    .resize({ width: TOWERS_WIDTH, kernel: "lanczos3" })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(heroAssets, "towers-dusk.jpg"));
  return { width: TOWERS_WIDTH, height: outHeight };
}

/**
 * Green version of the sunset skyline: a gradient map (deep forest → brand green → logo lime → pale
 * highlight) driven by a red-weighted brightness, so the orange sky keeps its glow and the city stays dark.
 * Baked at build time rather than tinted in CSS: smaller download and no runtime filter on the LCP image.
 */
async function greenHero() {
  const stops = ["#020c07", "#0c3520", "#2f7040", "#8cc455", "#eaf8b8"].map((h) =>
    [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)),
  );
  const { data, info } = await sharp(HERO_SOURCE)
    .resize({ width: 2560, withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 3);
  const last = stops.length - 1;
  for (let i = 0; i < info.width * info.height; i++) {
    const t = Math.pow((0.55 * data[i * 3] + 0.4 * data[i * 3 + 1] + 0.05 * data[i * 3 + 2]) / 255, 1.15);
    const seg = Math.min(last - 1, Math.floor(t * last));
    const f = t * last - seg;
    for (let c = 0; c < 3; c++) out[i * 3 + c] = Math.round(stops[seg][c] + (stops[seg + 1][c] - stops[seg][c]) * f);
  }
  rmSync(path.join(heroAssets, "city-skyline-green.webp"), { force: true }); // sky-removed experiment
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 3 } })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(heroAssets, "city-sunset-green.jpg"));
  return info;
}

/**
 * Alpha mask of the white artwork. The background never exceeds ~65 in the blue channel and
 * the artwork is ~240+, so blue maps cleanly to coverage and keeps the anti-aliased edges.
 */
async function artworkMask() {
  const { data, info } = await sharp(SOURCE).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const LO = 80;
  const HI = 225;
  const mask = Buffer.alloc(width * height);
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const a = Math.round(Math.min(1, Math.max(0, (data[i * 3 + 2] - LO) / (HI - LO))) * 255);
      mask[i] = a;
      if (a > 0) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  const pad = 4;
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const box = {
    left,
    top,
    width: Math.min(width, maxX + pad + 1) - left,
    height: Math.min(height, maxY + pad + 1) - top,
  };
  const cropped = Buffer.alloc(box.width * box.height);
  for (let y = 0; y < box.height; y++) {
    const start = (box.top + y) * width + box.left;
    mask.copy(cropped, y * box.width, start, start + box.width);
  }
  return { mask: cropped, box, sourceSize: { width, height } };
}

/** Fill the artwork shape with an SVG paint (solid or gradient). */
async function cutout(mask: Buffer, width: number, height: number, fill: string, defs = "") {
  const paint = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${defs}<rect width="100%" height="100%" fill="${fill}"/></svg>`;
  // Render to raw RGB first: sharp runs removeAlpha() after joinChannel() within a single pipeline.
  const rgb = await sharp(Buffer.from(paint)).removeAlpha().raw().toBuffer();
  return sharp(rgb, { raw: { width, height, channels: 3 } })
    .joinChannel(mask, { raw: { width, height, channels: 1 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Square crop of the original logo, centred on the artwork, artwork filling `fill` of the side. */
async function tile(box: { left: number; top: number; width: number; height: number }, srcSize: { width: number; height: number }, fill: number) {
  const side = Math.min(srcSize.width, srcSize.height, Math.round(Math.max(box.width, box.height) / fill));
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  const left = Math.round(Math.min(srcSize.width - side, Math.max(0, cx - side / 2)));
  const top = Math.round(Math.min(srcSize.height - side, Math.max(0, cy - side / 2)));
  return sharp(SOURCE).extract({ left, top, width: side, height: side }).toBuffer();
}

/** Palette PNG: the smooth gradient is visually lossless at 256 colours and several times smaller. */
async function png(input: Buffer, size: number) {
  return sharp(input).resize(size, size, { kernel: "lanczos3" }).png({ palette: true, quality: 95, effort: 10, dither: 1 }).toBuffer();
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
  const { mask, box, sourceSize } = await artworkMask();
  const { width, height } = box;

  // Transparent cut-outs: brand green on light backgrounds, white on dark ones.
  const gradient = `<defs><linearGradient id="g" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${LOGO_INK_FROM}"/><stop offset="1" stop-color="${LOGO_INK_TO}"/></linearGradient></defs>`;
  writeFileSync(path.join(brandAssets, "logo-color.png"), await cutout(mask, width, height, "url(#g)", gradient));
  const white = await cutout(mask, width, height, "#ffffff");
  writeFileSync(path.join(brandAssets, "logo-white.png"), white);

  // Icons: the original green tile, cropped so the artwork fills most of the square.
  const iconTile = await tile(box, sourceSize, 0.86);
  rmSync(path.join(appDir, "icon.svg"), { force: true }); // old placeholder mark; would win over the PNGs
  // ICO decoders require the embedded PNG to be RGBA (not palette).
  const icoPng = await sharp(iconTile).resize(48, 48, { kernel: "lanczos3" }).ensureAlpha().png().toBuffer();
  writeFileSync(path.join(appDir, "favicon.ico"), icoFromPng(icoPng, 48));
  writeFileSync(path.join(appDir, "icon.png"), await png(iconTile, 192));
  writeFileSync(path.join(appDir, "apple-icon.png"), await png(iconTile, 180));
  writeFileSync(path.join(publicImages, "icon-192.png"), await png(iconTile, 192));
  writeFileSync(path.join(publicImages, "icon-512.png"), await png(iconTile, 512));

  // Square logo for structured data (Google requires a raster logo, min 112px): the official file as-is.
  writeFileSync(path.join(publicImages, "logo.png"), await png(await sharp(SOURCE).toBuffer(), 512));

  const ogLogoHeight = 220;
  const ogLogo = await sharp(white).resize({ height: ogLogoHeight }).toBuffer();
  const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="g1" cx="0.9" cy="0" r="0.9"><stop offset="0" stop-color="${GREEN}" stop-opacity="0.9"/><stop offset="1" stop-color="${DARK}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="0" cy="1.1" r="0.7"><stop offset="0" stop-color="${GOLD}" stop-opacity="0.35"/><stop offset="1" stop-color="${DARK}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="${DARK}"/>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect width="1200" height="630" fill="url(#g2)"/>
  <text x="90" y="390" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="60" fill="#ffffff">Apartments, homes &amp; shops</text>
  <text x="90" y="464" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="60" fill="#ffffff">for sale in Addis Ababa</text>
  <text x="90" y="540" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#c2dfc6">Buy direct from the developer · Book a free site visit</text>
</svg>`;
  await sharp(Buffer.from(og))
    .composite([{ input: ogLogo, left: 90, top: 60 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(publicImages, "og-default.jpg"));

  console.log(`✓ Logo cut-out ${width}×${height} → src/assets/brand (logo-color.png, logo-white.png)`);
  console.log("✓ Icons → src/app (favicon.ico, icon.png, apple-icon.png) and public/images (icon-192/512, logo.png, og-default.jpg)");

  const hero = await greenHero();
  console.log(`✓ Hero background ${hero.width}×${hero.height} → src/assets/hero/city-sunset-green.jpg`);

  const towers = await towersHero();
  console.log(`✓ Home hero ${towers.width}×${towers.height} → src/assets/hero/towers-dusk.jpg`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
