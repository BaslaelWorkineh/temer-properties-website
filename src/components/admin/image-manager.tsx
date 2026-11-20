"use client";

import { useRef, useState, type DragEvent } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2, TriangleAlert } from "lucide-react";
import type { ImageItem } from "@/db/schema";
import { inputStyles } from "@/components/ui/form";
import { cn } from "@/lib/utils";

type Upload = { id: number; fileName: string; error?: string };

/**
 * Uploads images to /api/admin/upload and keeps them (with alt text and order)
 * in a hidden JSON input named `name`. Array value, or a single object/null
 * when `single` is set.
 */
export function ImageManager({
  name,
  initial,
  max = 30,
  single = false,
  defaultAlt = "",
  errors,
}: {
  name: string;
  initial: ImageItem[] | ImageItem | null;
  max?: number;
  single?: boolean;
  defaultAlt?: string;
  errors?: string[];
}) {
  const [images, setImages] = useState<ImageItem[]>(() => (Array.isArray(initial) ? initial : initial ? [initial] : []));
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);

  const limit = single ? 1 : max;
  const busy = uploads.some((u) => !u.error);
  const canAdd = images.length < limit;

  async function upload(files: FileList | File[]) {
    const room = limit - images.length;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, Math.max(room, 0));
    for (const file of list) {
      const id = ++nextId.current;
      setUploads((u) => [...u, { id, fileName: file.name }]);
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = (await res.json().catch(() => ({}))) as { url?: string; width?: number; height?: number; error?: string };
        if (!res.ok || !data.url) throw new Error(data.error || `Upload failed (${res.status})`);
        const item: ImageItem = { url: data.url, alt: defaultAlt, width: data.width, height: data.height };
        setImages((current) => (single ? [item] : [...current, item].slice(0, limit)));
        setUploads((u) => u.filter((x) => x.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setUploads((u) => u.map((x) => (x.id === id ? { ...x, error: message } : x)));
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(index: number, delta: number) {
    setImages((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (canAdd && event.dataTransfer.files.length) void upload(event.dataTransfer.files);
  }

  const serialized = single ? JSON.stringify(images[0] ?? null) : JSON.stringify(images);

  return (
    <div>
      <input type="hidden" name={name} value={serialized} />

      {images.length > 0 ? (
        <ul className={cn("grid gap-4", single ? "max-w-sm" : "sm:grid-cols-2 xl:grid-cols-3")}>
          {images.map((img, index) => (
            <li key={img.url} className="overflow-hidden rounded-xl bg-soft ring-1 ring-line">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded file */}
                <img src={img.url} alt="" className="aspect-[4/3] w-full object-cover" />
                {!single && index === 0 ? (
                  <span className="absolute left-2 top-2 rounded-none bg-brand-950/85 px-2.5 py-0.5 text-xs font-semibold text-white">Cover</span>
                ) : null}
                <div className="absolute right-2 top-2 flex gap-1">
                  {!single ? (
                    <>
                      <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded-lg bg-white/90 p-1.5 text-ink shadow disabled:opacity-40" title="Move earlier">
                        <ArrowUp className="size-4" aria-hidden="true" />
                        <span className="sr-only">Move image earlier</span>
                      </button>
                      <button type="button" onClick={() => move(index, 1)} disabled={index === images.length - 1} className="rounded-lg bg-white/90 p-1.5 text-ink shadow disabled:opacity-40" title="Move later">
                        <ArrowDown className="size-4" aria-hidden="true" />
                        <span className="sr-only">Move image later</span>
                      </button>
                    </>
                  ) : null}
                  <button type="button" onClick={() => setImages((c) => c.filter((_, i) => i !== index))} className="rounded-lg bg-white/90 p-1.5 text-red-700 shadow" title="Remove">
                    <Trash2 className="size-4" aria-hidden="true" />
                    <span className="sr-only">Remove image</span>
                  </button>
                </div>
              </div>
              <div className="p-3">
                <label htmlFor={`${name}-alt-${index}`} className="mb-1 block text-xs font-medium text-muted">
                  Alt text (describe the photo)
                </label>
                <input
                  id={`${name}-alt-${index}`}
                  value={img.alt}
                  maxLength={200}
                  placeholder="e.g. Living room with city view, 3-bedroom apartment in Sarbet"
                  onChange={(e) => {
                    const alt = e.target.value;
                    setImages((c) => c.map((x, i) => (i === index ? { ...x, alt } : x)));
                  }}
                  className={cn(inputStyles, "py-2 text-sm")}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {canAdd ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
            dragging ? "border-brand-500 bg-brand-50" : "border-line bg-soft/60",
          )}
        >
          <ImagePlus className="size-7 text-muted" aria-hidden="true" />
          <p className="mt-2 text-sm text-ink">
            Drag photos here or{" "}
            <button type="button" onClick={() => inputRef.current?.click()} className="font-semibold text-brand-700 underline underline-offset-2">
              browse
            </button>
          </p>
          <p className="mt-1 text-xs text-muted">
            JPEG, PNG, WebP or AVIF, up to 10 MB each.{" "}
            {single ? "One image." : `Up to ${limit} images. The first one is the cover photo.`}
          </p>
          <ul className="mt-3 space-y-0.5 text-xs text-muted">
            <li>Use bright, landscape photos (at least 1600 px wide).</li>
            <li>Put the best photo first: it is the cover on cards and when shared.</li>
            <li>Describe each photo in the alt text box that appears after upload.</li>
          </ul>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple={!single}
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => e.target.files && void upload(e.target.files)}
          />
        </div>
      ) : null}

      {uploads.length > 0 ? (
        <ul className="mt-3 space-y-2" aria-live="polite">
          {uploads.map((u) => (
            <li key={u.id} className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm", u.error ? "bg-red-50 text-red-800" : "bg-soft text-muted")}>
              {u.error ? <TriangleAlert className="size-4 shrink-0" aria-hidden="true" /> : <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />}
              <span className="min-w-0 flex-1 truncate">
                {u.fileName}
                {u.error ? ` — ${u.error}` : " — uploading…"}
              </span>
              {u.error ? (
                <button type="button" onClick={() => setUploads((list) => list.filter((x) => x.id !== u.id))} className="text-xs font-semibold underline">
                  Dismiss
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-3 text-xs text-muted">
        Alt text is read by screen readers and by Google Images. Describe what the photo shows and where, e.g. “Kitchen of a 2-bedroom
        apartment at Sarbet City Plus”. {busy ? "Wait for uploads to finish before saving." : null}
      </p>
      {errors?.length ? <p className="mt-1.5 text-sm text-red-700">{errors[0]}</p> : null}
    </div>
  );
}
