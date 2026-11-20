import { readFile } from "node:fs/promises";
import path from "node:path";
import { resolveMediaPath } from "@/lib/storage";

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
};

/** Serves uploaded images from UPLOAD_DIR. File names are random and immutable. */
export async function GET(_request: Request, ctx: RouteContext<"/media/[...path]">) {
  const { path: segments } = await ctx.params;
  const filePath = resolveMediaPath(segments);
  const contentType = filePath ? CONTENT_TYPES[path.extname(filePath).toLowerCase()] : undefined;
  if (!filePath || !contentType) return new Response("Not found", { status: 404 });

  try {
    const data = await readFile(filePath);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(data.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
