'use client';

import { useEffect, useState } from "react";
import Image from "next/image";

import { Sheet, SheetContent, SheetOverlay, SheetTitle } from "@/components/ui/sheet";
import GalleryArrow from "@/components/GalleryArrow";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  name: string;
  trending?: boolean;
}

export default function ProductImageGallery({
  images,
  name,
  trending = false,
}: ProductImageGalleryProps) {
  const validImages = images.filter(Boolean);
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  // The list can change when navigating between products; keep the active
  // index inside the array instead of rendering an undefined source.
  const activeIndex =
    validImages.length > 0 ? Math.min(current, validImages.length - 1) : 0;

  const goTo = (index: number) => {
    setCurrent(Math.max(0, Math.min(validImages.length - 1, index)));
  };

  // Arrow keys step through the gallery from anywhere on the product page, the
  // way a photo viewer is expected to behave. Text fields and open dialogs keep
  // their own arrow handling, and modifier combos stay with the browser.
  useEffect(() => {
    if (validImages.length < 2) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      if (
        target?.isContentEditable ||
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT"
      ) {
        return;
      }

      // Another dialog owns the keyboard until it closes.
      if (
        !lightbox &&
        document.querySelector('[role="dialog"][data-state="open"]')
      ) {
        return;
      }

      const step =
        event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
      if (step === 0) return;

      const next = activeIndex + step;
      if (next < 0 || next >= validImages.length) return;

      event.preventDefault();
      setCurrent(next);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, lightbox, validImages.length]);

  const thumbnailProps = (index: number) => ({
    active: index === activeIndex,
    onClick: () => goTo(index),
  });

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200">
      {validImages.length > 1 && (
        <>
          <p className="sr-only">
            Use the left and right arrow keys to change the image.
          </p>
          <p className="sr-only" aria-live="polite">
            Image {activeIndex + 1} of {validImages.length}
          </p>
        </>
      )}
      <div className="relative w-full h-64 sm:h-80 group">
        {validImages.length > 0 && validImages[activeIndex] ? (
          <>
            <button
              type="button"
              onClick={() => setLightbox(true)}
              className="absolute inset-0 z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              aria-label={`Enlarge image of ${name}`}
            >
              <span className="sr-only">Click to enlarge {name}</span>
            </button>
            <Image
              src={validImages[activeIndex]}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 640px"
              quality={80}
              onError={() => {}}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No image available
          </div>
        )}
        {validImages.length > 1 && (
          <>
            <GalleryArrow
              direction="prev"
              label="Previous image"
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="left-3 md:left-4"
            />
            <GalleryArrow
              direction="next"
              label="Next image"
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex === validImages.length - 1}
              className="right-3 md:right-4"
            />
          </>
        )}
        {trending && (
          <span className="absolute top-4 right-4 bg-pink-500 text-white text-sm font-medium px-3 py-1 rounded-full">
            Trending
          </span>
        )}
      </div>

      {validImages.length > 1 && (
        <div className="mt-2 flex items-center justify-center">
          <div
            id="product-thumbnails"
            className="flex flex-shrink-0 gap-2 overflow-x-auto pb-1 no-scrollbar"
          >
            {validImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={thumbnailProps(index).onClick}
                aria-label={`Show image ${index + 1} of ${validImages.length}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  thumbnailProps(index).active
                    ? "border-primary ring-2 ring-ring ring-offset-1"
                    : "border-transparent hover:border-border"
                )}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                  quality={80}
                  onError={() => {}}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <Sheet open={lightbox} onOpenChange={setLightbox}>
        <SheetOverlay />
        <SheetContent
          className="fixed inset-0 z-50 h-full w-full max-w-none bg-background p-0 gap-0 border-0 sm:max-w-none"
          aria-describedby={undefined}
        >
          <SheetTitle className="sr-only">{name}</SheetTitle>
          <div className="flex h-full w-full items-center justify-center p-6">
            <GalleryArrow
              direction="prev"
              label="Previous image"
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="left-4 md:left-8 md:h-12 md:w-12"
            />
            <div className="relative h-[82vh] w-[88vw]">
              <Image
                src={validImages[activeIndex]}
                alt={name}
                fill
                className="object-contain"
                sizes="88vw"
                quality={80}
                onError={() => {}}
              />
            </div>
            <GalleryArrow
              direction="next"
              label="Next image"
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex === validImages.length - 1}
              className="right-4 md:right-8 md:h-12 md:w-12"
            />
          </div>
          <p
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 text-xs text-muted-foreground"
          >
            {activeIndex + 1} of {validImages.length}
          </p>
        </SheetContent>
      </Sheet>
    </div>
  );
}
