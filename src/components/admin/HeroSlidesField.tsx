"use client";

import React, {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminHomePage } from "@/types";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_SLIDES = 5;

interface SlideRow {
  key: string;
  url: string;
  /** Set for slides already stored in Sanity. */
  ref?: string;
  /** Set for images picked in this session, not uploaded yet. */
  file?: File;
  heroHeading: string;
  heroSubheading: string;
  ctaText: string;
  ctaLink: string;
}

interface HeroSlidesFieldProps {
  slides?: AdminHomePage["heroItems"];
  error?: string;
  hint?: string;
}

export interface HeroSlidesApi {
  /**
   * Hands the form three things: the saved slides (so removing one deletes it),
   * the new image files, and the text for those new files in the same order.
   */
  appendTo: (formData: FormData) => void;
  /** Adopts the canonical slides the server stored, after a successful save. */
  replaceAll: (slides: AdminHomePage["heroItems"]) => void;
}

function toRows(slides: AdminHomePage["heroItems"]): SlideRow[] {
  return slides.map((slide) => ({
    key: slide.key,
    url: slide.url,
    ref: slide.ref,
    heroHeading: slide.heroHeading ?? "",
    heroSubheading: slide.heroSubheading ?? "",
    ctaText: slide.ctaText || "Shop Now",
    ctaLink: slide.ctaLink || "/products",
  }));
}

const HeroSlidesField = React.forwardRef<HeroSlidesApi, HeroSlidesFieldProps>(
  function HeroSlidesField({ slides = [], error, hint }, ref) {
    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [rows, setRows] = useState<SlideRow[]>(() => toRows(slides));
    const rowsRef = useRef(rows);
    rowsRef.current = rows;

    useImperativeHandle(ref, () => ({
      appendTo: (formData: FormData) => {
        const saved = rows
          .filter((row): row is SlideRow & { ref: string } => Boolean(row.ref))
          .map((row) => ({
            key: row.key,
            ref: row.ref,
            heroHeading: row.heroHeading,
            heroSubheading: row.heroSubheading,
            ctaText: row.ctaText,
            ctaLink: row.ctaLink,
          }));
        formData.set("existingHeroItems", JSON.stringify(saved));

        const added = rows.filter((row): row is SlideRow & { file: File } =>
          Boolean(row.file)
        );
        added.forEach((row) => formData.append("heroImages", row.file));
        formData.set(
          "newHeroItems",
          JSON.stringify(
            added.map((row) => ({
              heroHeading: row.heroHeading,
              heroSubheading: row.heroSubheading,
              ctaText: row.ctaText,
              ctaLink: row.ctaLink,
            }))
          )
        );
      },
      replaceAll: (next) => {
        // The rows being replaced may still hold blob previews.
        rowsRef.current.forEach((row) => {
          if (row.url.startsWith("blob:")) URL.revokeObjectURL(row.url);
        });
        setRows(toRows(next));
      },
    }));

    // Revoke preview URLs only when the field unmounts. Revoking on every rows
    // change would blank the thumbnails that are still on screen.
    useEffect(() => {
      return () => {
        rowsRef.current.forEach((row) => {
          if (row.url.startsWith("blob:")) URL.revokeObjectURL(row.url);
        });
      };
    }, []);

    function addFiles(files: FileList | null) {
      if (!files) return;
      // Count against this batch, not the state captured when the handler ran:
      // picking five files at once must not slip past the limit.
      let slots = Math.max(0, MAX_SLIDES - rows.length);
      const accepted: SlideRow[] = [];
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        if (!file.type.startsWith("image/")) {
          toast.error("That file is not an image.");
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          toast.error("Images must be 10 MB or smaller.");
          continue;
        }
        if (slots <= 0) {
          toast.error(`${MAX_SLIDES} hero images is the limit.`);
          break;
        }
        accepted.push({
          key: crypto.randomUUID(),
          url: URL.createObjectURL(file),
          file,
          heroHeading: "",
          heroSubheading: "",
          ctaText: "Shop Now",
          ctaLink: "/products",
        });
        slots -= 1;
      }
      if (accepted.length > 0) {
        setRows((current) => [...current, ...accepted]);
      }
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }

    function updateRow(key: string, patch: Partial<SlideRow>) {
      setRows((current) =>
        current.map((row) => (row.key === key ? { ...row, ...patch } : row))
      );
    }

    function removeRow(key: string) {
      const target = rows.find((row) => row.key === key);
      if (target?.url.startsWith("blob:")) {
        URL.revokeObjectURL(target.url);
      }
      setRows((current) => current.filter((row) => row.key !== key));
    }

    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium">Hero slides</p>
          <p className="text-xs text-muted-foreground">
            Each image carries its own heading and subheading. Shoppers see the
            text of the slide in view.
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
            No hero slides yet. Add a wide photo to start the carousel.
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((row, index) => (
              <li key={row.key}>
                <fieldset className="rounded-lg border border-border p-3">
                  <legend className="px-1 text-xs font-medium text-muted-foreground">
                    Slide {index + 1}
                  </legend>
                  <div className="flex items-start gap-3">
                    <div className="relative h-[72px] w-[112px] shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                      <Image
                        src={row.url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="112px"
                        unoptimized={row.url.startsWith("blob:")}
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                          aria-label={`Remove slide ${index + 1}`}
                          onClick={() => removeRow(row.key)}
                        >
                          <X aria-hidden="true" className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="space-y-1 sm:col-span-2">
                          <Label
                            htmlFor={`${id}-${row.key}-heading`}
                            className="text-xs"
                          >
                            Heading
                          </Label>
                          <Input
                            id={`${id}-${row.key}-heading`}
                            value={row.heroHeading}
                            maxLength={120}
                            placeholder="Cook with colour"
                            onChange={(event) =>
                              updateRow(row.key, {
                                heroHeading: event.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <Label
                            htmlFor={`${id}-${row.key}-subheading`}
                            className="text-xs"
                          >
                            Subheading
                          </Label>
                          <Input
                            id={`${id}-${row.key}-subheading`}
                            value={row.heroSubheading}
                            maxLength={280}
                            placeholder="Optional line under the heading"
                            onChange={(event) =>
                              updateRow(row.key, {
                                heroSubheading: event.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor={`${id}-${row.key}-cta-text`}
                            className="text-xs"
                          >
                            Button label
                          </Label>
                          <Input
                            id={`${id}-${row.key}-cta-text`}
                            value={row.ctaText}
                            maxLength={40}
                            placeholder="Shop Now"
                            onChange={(event) =>
                              updateRow(row.key, {
                                ctaText: event.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor={`${id}-${row.key}-cta-link`}
                            className="text-xs"
                          >
                            Button link
                          </Label>
                          <Input
                            id={`${id}-${row.key}-cta-link`}
                            value={row.ctaLink}
                            placeholder="/products"
                            onChange={(event) =>
                              updateRow(row.key, {
                                ctaLink: event.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </li>
            ))}
          </ul>
        )}

        <input
          ref={inputRef}
          id={`${id}-files`}
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={(event) => addFiles(event.target.files)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={rows.length >= MAX_SLIDES}
          >
            <ImagePlus aria-hidden="true" />
            {rows.length === 0 ? "Add image" : "Add another image"}
          </Button>
          <span className="text-xs text-muted-foreground">
            {rows.length} of {MAX_SLIDES}
          </span>
        </div>

        {error ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    );
  }
);

HeroSlidesField.displayName = "HeroSlidesField";

export default HeroSlidesField;
