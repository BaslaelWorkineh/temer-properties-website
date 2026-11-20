import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Uploaded images live outside /public (Next.js only serves files that exist
 * in /public at build time) and are served by src/app/media/[...path]/route.ts.
 * On serverless hosts, swap this module for S3/R2/Blob storage.
 */
// turbopackIgnore: a runtime data directory, not source code; don't trace it into the build output.
export const UPLOAD_DIR = path.resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR || "./storage/uploads");
export const MEDIA_BASE_PATH = "/media";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_DIMENSION = 2400;

function sniffImageType(bytes: Uint8Array): "jpeg" | "png" | "webp" | "avif" | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (ascii(4, 8) === "ftyp" && /avi[fs]/.test(ascii(8, 12))) return "avif";
  return null;
}

export type StoredImage = { url: string; width: number; height: number };

/**
 * Validates by magic bytes (not the client-supplied MIME type), fixes EXIF
 * rotation, strips metadata (phone photos carry GPS coordinates), caps the size
 * and stores a random, unguessable file name.
 *
 * Stored as JPEG on purpose: these files double as og:image for link previews,
 * and WhatsApp/LinkedIn previews don't reliably support WebP. Visitors still get
 * AVIF/WebP because next/image converts on the fly.
 */
export async function saveImageUpload(file: File): Promise<StoredImage> {
  if (file.size === 0) throw new Error("The file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Images must be 10 MB or smaller.");

  const input = Buffer.from(await file.arrayBuffer());
  if (!sniffImageType(input)) throw new Error("Only JPEG, PNG, WebP or AVIF images are allowed.");

  const { data, info } = await sharp(input, { failOn: "error" })
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  return writeMedia(data, "jpg", info.width, info.height);
}

export async function writeMedia(data: Buffer, ext: string, width: number, height: number): Promise<StoredImage> {
  const now = new Date();
  const folder = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  await mkdir(path.join(UPLOAD_DIR, folder), { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, folder, name), data);
  return { url: `${MEDIA_BASE_PATH}/${folder}/${name}`, width, height };
}

/** Resolves a /media/... path to a file inside UPLOAD_DIR, or null if it escapes it. */
export function resolveMediaPath(segments: string[]) {
  if (segments.some((s) => !s || s === "." || s === ".." || s.includes("\\") || s.includes("\0"))) return null;
  const filePath = path.resolve(UPLOAD_DIR, ...segments);
  return filePath.startsWith(UPLOAD_DIR + path.sep) ? filePath : null;
}
