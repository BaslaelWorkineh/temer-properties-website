import { readMedia } from "@/lib/storage";

/**
 * Serves uploaded images (from Vercel Blob or UPLOAD_DIR, see src/lib/storage.ts). File names are random and never
 * reused, so responses are cached for a year by browsers and by the CDN (s-maxage).
 */
export async function GET(_request: Request, ctx: RouteContext<"/media/[...path]">) {
  const { path: segments } = await ctx.params;
  const media = await readMedia(segments);
  if (!media) return new Response("Not found", { status: 404 });

  return new Response(media.body, {
    headers: {
      "Content-Type": media.contentType,
      "Content-Length": String(media.size),
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
