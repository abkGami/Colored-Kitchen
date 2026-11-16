'use client';

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface GalleryArrowProps {
  direction: "prev" | "next";
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * The single arrow control behind every image surface — storefront hero,
 * product gallery and lightbox. Copper is the site's action colour, so the
 * control reads as part of the shop instead of as chrome borrowed from the
 * photograph; the offset shadow keeps it legible over pale and busy images.
 */
export default function GalleryArrow({
  direction,
  label,
  onClick,
  disabled = false,
  className,
}: GalleryArrowProps) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "absolute top-1/2 z-30 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full",
        "bg-primary text-primary-foreground shadow-lg shadow-black/25 ring-1 ring-black/10",
        "transition-colors duration-200 hover:bg-primary/90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary",
        "md:h-11 md:w-11",
        direction === "prev" ? "left-3" : "right-3",
        className
      )}
    >
      <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={2.5} />
    </button>
  );
}
