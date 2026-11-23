import "server-only";
import { get, put } from "@vercel/blob";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Uploaded images live outside /public (Next.js only serves files that exist
 * in /public at build time) and are served by src/app/media/[...path]/route.ts
 * at /media/<yyyy>/<mm>/<name>.
 *
 * Where the files are kept:
 * - Vercel (BLOB_READ_WRITE_TOKEN set, added automatically when a Blob store is connected to the project):
 *   Vercel Blob. Serverless disks are read-only and temporary, so local files would be lost.
 * - Local development / a single VPS: UPLOAD_DIR on disk (must be persistent and backed up).
 * The public URL is /media/... in both cases, so switching storage never changes saved image URLs.
 */
// turbopackIgnore: a runtime data directory, not source code; don't trace it into the build output.
export const UPLOAD_DIR = path.resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR || "./storage/uploads");
export const MEDIA_BASE_PATH = "/media";

function blobStorageEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export const MEDIA_CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
};

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
  if (blobStorageEnabled()) {
    // Public like every image on the website; served through /media so URLs stay on our own domain.
    await put(`${folder}/${name}`, data, {
      access: "public",
      contentType: MEDIA_CONTENT_TYPES[`.${ext}`] ?? "application/octet-stream",
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
  } else {
    await mkdir(path.join(UPLOAD_DIR, folder), { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, folder, name), data);
  }
  return { url: `${MEDIA_BASE_PATH}/${folder}/${name}`, width, height };
}

/** Resolves a /media/... path to a file inside UPLOAD_DIR, or null if it escapes it. */
export function resolveMediaPath(segments: string[]) {
  if (segments.some((s) => !s || s === "." || s === ".." || s.includes("\\") || s.includes("\0"))) return null;
  const filePath = path.resolve(UPLOAD_DIR, ...segments);
  return filePath.startsWith(UPLOAD_DIR + path.sep) ? filePath : null;
}

export type MediaFile = { body: BodyInit; contentType: string; size: number };

/** Reads an uploaded image from Vercel Blob or UPLOAD_DIR. Null when the path is invalid, not an image, or missing. */
export async function readMedia(segments: string[]): Promise<MediaFile | null> {
  const filePath = resolveMediaPath(segments);
  const contentType = filePath ? MEDIA_CONTENT_TYPES[path.extname(filePath).toLowerCase()] : undefined;
  if (!filePath || !contentType) return null;

  if (blobStorageEnabled()) {
    try {
      const result = await get(segments.join("/"), { access: "public" });
      if (!result || result.statusCode !== 200) return null;
      return { body: result.stream, contentType, size: result.blob.size };
    } catch (err) {
      console.error("[media] Vercel Blob read failed", err);
      return null;
    }
  }

  try {
    const data = await readFile(/* turbopackIgnore: true */ filePath);
    return { body: new Uint8Array(data), contentType, size: data.byteLength };
  } catch {
    return null;
  }
}
