"use client";

import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import type { ImageItem } from "@/db/schema";
import { cn } from "@/lib/utils";

/**
 * Photo grid + lightbox. All grid images are server-rendered <img> tags with
 * descriptive alt text (indexable by Google Images); the first one is the LCP
 * element and is fetched with high priority.
 */
export function Gallery({ images, title }: { images: ImageItem[]; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const count = images.length;

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);
  const alt = (img: ImageItem, i: number) => img.alt || `${title}, photo ${i + 1}`;

  const side = images.slice(1, 3);
  return (
    <div className="relative">
      <div className={cn("grid gap-2 overflow-hidden rounded-2xl", side.length ? "md:grid-cols-3 md:grid-rows-2" : "")}>
        <button
          type="button"
          onClick={() => open(0)}
          className={cn("relative aspect-[16/10] overflow-hidden bg-soft", side.length ? "md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[26rem]" : "")}
        >
          <Image
            src={images[0].url}
            alt={alt(images[0], 0)}
            fill
            loading="eager"
            fetchPriority="high"
            sizes={side.length ? "(min-width: 1280px) 820px, (min-width: 768px) 66vw, 100vw" : "(min-width: 1280px) 1240px, 100vw"}
            className="object-cover transition duration-500 hover:scale-[1.02]"
          />
          <span className="sr-only">Open photo 1 of {count}</span>
        </button>
        {side.map((img, i) => (
          <button key={img.url} type="button" onClick={() => open(i + 1)} className="relative hidden aspect-[16/10] overflow-hidden bg-soft md:block md:aspect-auto">
            <Image
              src={img.url}
              alt={alt(img, i + 1)}
              fill
              sizes="(min-width: 1280px) 410px, 33vw"
              className="object-cover transition duration-500 hover:scale-[1.03]"
            />
            <span className="sr-only">Open photo {i + 2} of {count}</span>
          </button>
        ))}
      </div>
      {count > 1 ? (
        <button
          type="button"
          onClick={() => open(0)}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-none bg-white/95 px-4 py-2 text-sm font-semibold text-ink shadow-md hover:bg-white"
        >
          <Images className="size-4" aria-hidden="true" /> View all {count} photos
        </button>
      ) : null}

      <dialog
        ref={dialogRef}
        aria-label={`${title}: photos`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
        className="m-auto h-dvh max-h-none w-screen max-w-none bg-black/95 p-0 text-white backdrop:bg-black/80"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span>
              {index + 1} / {count}
            </span>
            <button type="button" onClick={() => dialogRef.current?.close()} className="grid size-10 place-items-center rounded-full hover:bg-white/10" autoFocus>
              <X className="size-6" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div className="relative flex-1">
            <Image src={images[index].url} alt={alt(images[index], index)} fill sizes="100vw" className="object-contain" />
          </div>
          <p className="px-4 py-3 text-center text-sm text-white/75">{alt(images[index], index)}</p>
          {count > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <ChevronLeft className="size-7" aria-hidden="true" />
                <span className="sr-only">Previous photo</span>
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <ChevronRight className="size-7" aria-hidden="true" />
                <span className="sr-only">Next photo</span>
              </button>
            </>
          ) : null}
        </div>
      </dialog>
    </div>
  );
}
