"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import {
  createProduct,
  updateProduct,
  type FormState,
} from "@/app/admin/actions";
import FormField from "@/components/admin/FormField";
import MultiImageField, {
  type MultiImageFieldApi,
} from "@/components/admin/MultiImageField";
import SubmitButton from "@/components/admin/SubmitButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AdminProduct, PRODUCT_CATEGORIES } from "@/types";

const initialState: FormState = { status: "idle" };

function capitalise(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function ProductForm({
  mode,
  product,
}: {
  mode: "create" | "edit";
  product?: AdminProduct;
}) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(initialState);
  const [isPending, startTransition] = useTransition();
  const errorRef = useRef<HTMLDivElement>(null);

  const [category, setCategory] = useState<string>(product?.category ?? "pot");
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [trending, setTrending] = useState(product?.trending ?? false);
  const galleryRef = useRef<MultiImageFieldApi>(null);
  const [features, setFeatures] = useState<string[]>(
    product?.features?.length ? product.features : [""]
  );

  // Runs after the error panel exists, unlike a call right after setState.
  useEffect(() => {
    if (state.status !== "error") return;
    errorRef.current?.scrollIntoView({ block: "center" });
    errorRef.current?.focus({ preventScroll: true });
  }, [state]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      galleryRef.current?.appendTo(formData);

      const result =
        mode === "edit" && product
          ? await updateProduct(product.id, formData)
          : await createProduct(formData);

      setState(result);

      if (result.status === "success") {
        toast.success(result.message ?? "Saved.");
        if (mode === "create") {
          router.push("/admin");
        }
        router.refresh();
        return;
      }

      toast.error(result.message ?? "The product was not saved.");
    });
  }

  function updateFeature(index: number, value: string) {
    setFeatures((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item))
    );
  }

  function removeFeature(index: number) {
    setFeatures((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"
    >
      <div className="space-y-6 rounded-lg border border-border bg-white p-6">
        {state.status === "error" && state.message ? (
          <div
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm font-medium text-destructive focus:outline-none"
          >
            {state.message}
          </div>
        ) : null}

        <FormField label="Name" htmlFor="name" error={state.fieldErrors?.name}>
          <Input
            id="name"
            name="name"
            defaultValue={product?.name}
            placeholder="Copper sauté pan"
            required
            autoComplete="off"
          />
        </FormField>

        <FormField
          label="Description"
          htmlFor="description"
          error={state.fieldErrors?.description}
          hint="What it is, what it is made of, and who it suits."
        >
          <Textarea
            id="description"
            name="description"
            defaultValue={product?.description}
            rows={5}
            required
          />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Price (USD)"
            htmlFor="price"
            error={state.fieldErrors?.price}
          >
            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
              >
                $
              </span>
              <Input
                id="price"
                name="price"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                className="pl-7"
                defaultValue={product?.price}
                placeholder="0.00"
                required
              />
            </div>
          </FormField>

          <FormField
            label="Category"
            htmlFor="category"
            error={state.fieldErrors?.category}
          >
            <input type="hidden" name="category" value={category} />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {capitalise(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">Features</p>
            <p className="text-xs text-muted-foreground">
              Short lines shown on the product page. Leave blank to skip.
            </p>
          </div>

          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                name="features"
                value={feature}
                onChange={(event) => updateFeature(index, event.target.value)}
                placeholder={index === 0 ? "Solid copper core" : "Another feature"}
                aria-label={`Feature ${index + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove feature ${index + 1}`}
                onClick={() => removeFeature(index)}
              >
                <X aria-hidden="true" />
              </Button>
            </div>
          ))}

          {features.length < 12 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFeatures((current) => [...current, ""])}
            >
              <Plus aria-hidden="true" />
              Add feature
            </Button>
          ) : null}
          {state.fieldErrors?.features ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {state.fieldErrors.features}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-5 lg:sticky lg:top-32">
        <div className="rounded-lg border border-border bg-white p-6">
          <MultiImageField
            ref={galleryRef}
            label="Product photos"
            existing={product?.imageRefs}
            error={state.fieldErrors?.image}
            required={mode === "create"}
            aspect="square"
            hint="JPG, PNG or WebP up to 10 MB. Existing photos stay unless you remove them."
          />
        </div>

        <div className="space-y-5 rounded-lg border border-border bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label htmlFor="inStock">In stock</Label>
              <p className="text-xs text-muted-foreground">
                Shoppers can add it to the cart.
              </p>
            </div>
            <Switch id="inStock" checked={inStock} onCheckedChange={setInStock} />
            <input type="hidden" name="inStock" value={String(inStock)} />
          </div>

          <div className="flex items-start justify-between gap-4 border-t border-border pt-5">
            <div>
              <Label htmlFor="trending">Trending</Label>
              <p className="text-xs text-muted-foreground">
                Also shows in the trending row.
              </p>
            </div>
            <Switch
              id="trending"
              checked={trending}
              onCheckedChange={setTrending}
            />
            <input type="hidden" name="trending" value={String(trending)} />
          </div>

          <div className="border-t border-border pt-5">
            <FormField
              label="Slug"
              htmlFor="slug"
              hint="Optional. Built from the name when left blank."
            >
              <Input
                id="slug"
                name="slug"
                defaultValue={product?.slug}
                placeholder="copper-saute-pan"
                autoComplete="off"
              />
            </FormField>
          </div>
        </div>

        <div className="space-y-2">
          <SubmitButton
            label={mode === "create" ? "Add product" : "Save changes"}
            pendingLabel={mode === "create" ? "Adding…" : "Saving…"}
            pending={isPending}
            className="w-full"
          />
          <Button asChild variant="outline" className="w-full">
            <Link href="/admin">Back to products</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}
