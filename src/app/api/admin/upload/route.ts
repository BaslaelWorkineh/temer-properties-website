import { getCurrentAdmin } from "@/lib/auth/session";
import { saveImageUpload } from "@/lib/storage";

/**
 * POST multipart/form-data with a `file` field. Admin session required.
 * Not covered by src/proxy.ts (which only gates /admin pages), so it checks
 * the session itself and answers JSON instead of redirecting.
 */
export async function POST(request: Request) {
  // Same-origin only: browsers always send Origin on cross-site POSTs.
  const origin = request.headers.get("origin");
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host"))?.split(",")[0]?.trim();
  if (origin && host && new URL(origin).host !== host) {
    return Response.json({ error: "Cross-origin uploads are not allowed." }, { status: 403 });
  }

  const admin = await getCurrentAdmin();
  if (!admin) return Response.json({ error: "Your session has expired. Sign in again." }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file received." }, { status: 400 });

  try {
    const stored = await saveImageUpload(file);
    return Response.json(stored, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    // sharp errors are technical; show a friendly message instead.
    const friendly = /^(The file|Images must|Only JPEG)/.test(message) ? message : "This image could not be processed. Try a different file.";
    if (friendly !== message) console.error("[upload] image processing failed", err);
    return Response.json({ error: friendly }, { status: 400 });
  }
}
