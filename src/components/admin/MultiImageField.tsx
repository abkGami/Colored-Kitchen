"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

interface ImageItem {
  key: string;
  url: string;
  ref?: string;
  file?: File;
}

interface MultiImageFieldProps {
  label: string;
  existing?: Array<{ key: string; url: string; ref: string }>;
  error?: string;
  hint?: string;
  required?: boolean;
  aspect?: "square" | "wide";
  max?: number;
}

export interface MultiImageFieldApi {
  /** Appends newly picked images to a FormData under the "images" key. */
  appendTo: (formData: FormData) => void;
}

const MultiImageField = React.forwardRef<MultiImageFieldApi, MultiImageFieldProps>(
  function MultiImageField(
    {
      label,
      existing = [],
      error,
      hint,
      required = false,
      aspect = "wide",
      max = 8,
    }: MultiImageFieldProps,
    ref: React.Ref<MultiImageFieldApi>
  ) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<ImageItem[]>(
    existing.map((image) => ({
      key: image.key,
      url: image.url,
      ref: image.ref,
    }))
  );

  useImperativeHandle(ref, () => ({
    appendTo: (formData: FormData) => {
      items.forEach((item) => {
        if (item.file) {
          formData.append("images", item.file);
        }
      });
    },
  }));

  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.url.startsWith("blob:")) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [items]);

  function addFiles(files: FileList | null) {
    if (!files) return;
    // Count against this batch, not the state captured when the handler was
    // created: picking ten files at once previously slipped past the limit.
    let slots = Math.max(0, max - items.length);
    const accepted: ImageItem[] = [];
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
        toast.error(`${max} images is the limit.`);
        break;
      }
      accepted.push({
        key: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        file,
      });
      slots -= 1;
    }
    if (accepted.length > 0) {
      setItems((current) => [...current, ...accepted]);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function removeItem(key: string) {
    const target = items.find((item) => item.key === key);
    if (target?.url.startsWith("blob:")) {
      URL.revokeObjectURL(target.url);
    }
    setItems((current) => current.filter((item) => item.key !== key));
  }

  const existingImages = items.filter((item): item is ImageItem & { ref: string } => Boolean(item.ref));
  const newFiles = items.filter((item) => Boolean(item.file));

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border border-border bg-muted flex flex-col items-center justify-center",
          aspect === "square" ? "aspect-square" : "aspect-[16/9]",
          items.length > 0 ? "p-1" : ""
        )}
      >
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImagePlus aria-hidden="true" className="h-6 w-6" />
            <span className="text-sm">No images yet</span>
          </div>
        ) : (
          <div className="flex w-full flex-wrap gap-2 max-h-full overflow-y-auto pb-2">
            {items.map((item) => (
              <div
                key={item.key}
                className="relative shrink-0 rounded-md border border-border overflow-hidden"
                style={{ width: 110, height: 110 }}
              >
                <Image
                  src={item.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="110px"
                  unoptimized={item.url.startsWith("blob:")}
                  priority
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 bg-white/90 hover:bg-white"
                  aria-label={`Remove image ${item.key.slice(-4)}`}
                  onClick={() => removeItem(item.key)}
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <input
          ref={inputRef}
          id={id}
          name="images"
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={(event) => addFiles(event.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={items.length >= max}
        >
          <ImagePlus aria-hidden="true" />
          {items.length === 0 ? "Add image" : "Add another image"}
        </Button>
        {newFiles.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {newFiles.length} new image{newFiles.length > 1 ? "s" : ""} ready to upload
          </p>
        )}
      </div>
      <input
        name="existingImages"
        type="hidden"
        value={JSON.stringify(existingImages.map((item) => ({ _key: item.key, asset: { _type: "reference" as const, _ref: item.ref } })))}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint ?? "JPG, PNG or WebP up to 10 MB. Existing photos stay unless you remove them."}
        </p>
      )}
    </div>
  );
}
);

MultiImageField.displayName = "MultiImageField";

export default MultiImageField;
