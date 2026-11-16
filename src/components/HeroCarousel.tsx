'use client';

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import GalleryArrow from "@/components/GalleryArrow";

interface HeroCarouselProps {
  heroItems: {
    heroImage: string;
    heroHeading: string;
    heroSubheading?: string;
    ctaText: string;
    ctaLink: string;
  }[];
}

export default function HeroCarousel({ heroItems }: HeroCarouselProps) {
  const [heroIndex, setHeroIndex] = useState(0);
  // Content can shrink between saves; never point past the last slide.
  const activeIndex = Math.min(heroIndex, Math.max(heroItems.length - 1, 0));
  const activeItem = heroItems[activeIndex];

  return (
    <section className="relative rounded-xl overflow-hidden mb-12 h-[350px] md:h-[500px]">
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10"></div>
      {heroItems.map((item, index) => (
        <Image
          key={index}
          src={item.heroImage}
          alt={item.heroHeading || `Hero image ${index + 1}`}
          fill
          className={cn(
            "object-cover transition-opacity duration-500",
            index === activeIndex ? "opacity-100 relative" : "opacity-0 absolute"
          )}
          sizes="(max-width: 768px) 100vw, 1200px"
          quality={80}
          priority={index === activeIndex}
        />
      ))}
      {heroItems.length > 1 && (
        <>
          <GalleryArrow
            direction="prev"
            label="Previous hero image"
            onClick={() =>
              setHeroIndex((i) => (i - 1 + heroItems.length) % heroItems.length)
            }
            className="left-2 md:left-6 md:h-12 md:w-12"
          />
          <GalleryArrow
            direction="next"
            label="Next hero image"
            onClick={() => setHeroIndex((i) => (i + 1) % heroItems.length)}
            className="right-2 md:right-6 md:h-12 md:w-12"
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {heroItems.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show hero image ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className="grid h-6 w-6 place-items-center rounded-full p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={() => setHeroIndex(index)}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-2 w-2 rounded-full border border-white/60 transition-colors",
                    index === activeIndex ? "bg-white" : "bg-transparent"
                  )}
                />
              </button>
            ))}
          </div>
        </>
      )}
      <div className="absolute inset-0 z-20 flex flex-col justify-center px-14 md:px-24">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
          {activeItem?.heroHeading}
        </h1>
        {activeItem?.heroSubheading && (
          <p className="text-lg text-white/90 max-w-md mb-6 italic">
            {activeItem.heroSubheading}
          </p>
        )}
        <div>
          <Link href={activeItem?.ctaLink || "/"}>
            <Button size="lg" className="px-8">
              {activeItem?.ctaText}
            </Button>
          </Link>
        </div>
        {/* The heading changes in place; announce the swap for screen readers. */}
        <p className="sr-only" aria-live="polite">
          Slide {activeIndex + 1} of {heroItems.length}: {activeItem?.heroHeading}
        </p>
      </div>
    </section>
  );
}
