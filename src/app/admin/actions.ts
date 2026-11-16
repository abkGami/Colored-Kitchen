"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "crypto";

import { client, urlFor } from "@/lib/sanity";
import { isCurrentUserAdmin } from "@/lib/admin-auth";
import { PRODUCT_CATEGORIES, type AdminHomePage } from "@/types";

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Canonical slides after a successful home-page save. */
  slides?: AdminHomePage["heroItems"];
};

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGES = 8;
const MAX_HERO_ITEMS = 5;

const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Give the product a name of at least 2 characters.")
    .max(120, "Keep the name under 120 characters."),
  description: z
    .string()
    .trim()
    .min(10, "Write at least a sentence so shoppers know what this is.")
    .max(4000, "Keep the description under 4000 characters."),
  price: z
    .number({ invalid_type_error: "Enter a price as a number." })
    .positive("The price must be greater than zero.")
    .max(100000000, "That price looks too large."),
  category: z.enum(PRODUCT_CATEGORIES, {
    errorMap: () => ({ message: "Pick one of the four categories." }),
  }),
  features: z
    .array(z.string().trim().min(1).max(160))
    .max(12, "Twelve features is the limit."),
  inStock: z.boolean(),
  trending: z.boolean(),
  existingImages: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value) return true;
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Existing image list is invalid." }
    ),
});

const heroSlideSchema = z.object({
  heroHeading: z
    .string()
    .trim()
    .min(2, "Give every slide a heading.")
    .max(120, "Keep slide headings under 120 characters."),
  heroSubheading: z
    .string()
    .trim()
    .max(280, "Keep slide subheadings under 280 characters.")
    .optional()
    .default(""),
  ctaText: z
    .string()
    .trim()
    .min(1, "Name the button action.")
    .max(40, "Keep the button label under 40 characters."),
  ctaLink: z
    .string()
    .trim()
    .refine(
      (value) =>
        value.startsWith("/") ||
        value.startsWith("https://") ||
        value.startsWith("#"),
      "Use a path starting with /, or a full https:// address."
    ),
});

const savedHeroSlideSchema = heroSlideSchema.extend({
  // The array member key keeps the slide stable across saves; the asset ref is
  // what actually survives when the array is rewritten.
  key: z.string().min(1),
  ref: z.string().min(1),
});

const homePageSchema = z.object({
  saved: z.array(savedHeroSlideSchema),
  added: z.array(heroSlideSchema),
});

class UserFacingError extends Error {}

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function fieldErrorsFrom(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

/**
 * Serial numbers are reused: the next product gets the lowest positive
 * integer not currently assigned, so deleting a product frees its number.
 */
async function nextSerialNumber(): Promise<number> {
  const assigned = await client.fetch<(number | null)[]>(
    `*[_type == "product" && defined(uniqueId)].uniqueId`
  );
  const used = new Set(
    assigned
      .filter((value): value is number => typeof value === "number")
      .filter((value) => Number.isFinite(value) && value > 0)
  );
  let next = 1;
  while (used.has(next)) next += 1;
  return next;
}

/**
 * Turns a Sanity failure into something a shop owner can act on. The 401/403
 * case is the one staff will actually hit when the dataset token is read-only.
 */
function describeWriteError(error: unknown) {
  const statusCode = (error as { statusCode?: number })?.statusCode;
  const raw = error instanceof Error ? error.message : String(error);

  if (statusCode === 401 || statusCode === 403) {
    return "Sanity refused the write. SANITY_API_TOKEN needs Editor permission on this dataset.";
  }
  if (statusCode === 429) {
    return "Sanity is rate-limiting writes right now. Wait a moment, then try again.";
  }
  if (raw.includes("fetch failed") || raw.includes("ENOTFOUND")) {
    return "Could not reach Sanity. Check the connection, then try again.";
  }
  console.error("Sanity write failed:", error);
  return "The change was not saved. Try again, and check the server log if it keeps failing.";
}

function assertImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new UserFacingError("That file is not an image.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new UserFacingError("Images must be 10 MB or smaller.");
  }
}

async function uploadImage(file: File) {
  assertImage(file);
  const asset = await client.assets.upload("image", file, {
    filename: file.name,
  });
  return {
    // Array members need a stable key. Without one the array is technically
    // invalid and Studio's image input can refuse to edit it.
    _key: crypto.randomUUID(),
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
  };
}

function revalidateProduct(id?: string) {
  revalidatePath("/");
  revalidatePath("/products");
  if (id) revalidatePath(`/product/${id}`);
}

type ParsedProduct = z.infer<typeof productSchema>;

function readProductForm(
  formData: FormData
): { data: ParsedProduct } | { failure: FormState } {
  if (!readText(formData, "price").trim()) {
    return {
      failure: {
        status: "error",
        message: "Some fields need attention.",
        fieldErrors: { price: "Enter a price." },
      },
    };
  }

  const parsed = productSchema.safeParse({
    name: readText(formData, "name"),
    description: readText(formData, "description"),
    price: Number(readText(formData, "price")),
    category: readText(formData, "category"),
    features: formData
      .getAll("features")
      .map((value) => String(value).trim())
      .filter(Boolean),
    inStock: readText(formData, "inStock") === "true",
    trending: readText(formData, "trending") === "true",
    existingImages: readText(formData, "existingImages") || undefined,
  });

  if (!parsed.success) {
    return {
      failure: {
        status: "error",
        message: "Some fields need attention.",
        fieldErrors: fieldErrorsFrom(parsed.error),
      },
    };
  }
  return { data: parsed.data };
}

function readImageFiles(formData: FormData): File[] {
  return formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

/** Hero uploads travel under their own key so product images never mix in. */
function readHeroImageFiles(formData: FormData): File[] {
  return formData
    .getAll("heroImages")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

/**
 * Reads a JSON array a client component attached to the form. Bad JSON is not a
 * write hazard: it degrades to an empty list and the slide validation reports
 * the real problem.
 */
function readJsonArray(formData: FormData, key: string): unknown[] {
  const raw = readText(formData, key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readExistingImageRefs(formData: FormData): SanityImageRef[] {
  const raw = readText(formData, "existingImages");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (value): value is SanityImageRef =>
        Boolean(value) &&
        typeof value === "object" &&
        typeof (value as SanityImageRef)._key === "string" &&
        Boolean((value as SanityImageRef).asset) &&
        typeof (value as SanityImageRef).asset._ref === "string"
    );
  } catch {
    return [];
  }
}

interface SanityImageRef {
  _key: string;
  asset: {
    _type: "reference";
    _ref: string;
  };
}

function productFields(
  data: ParsedProduct,
  formData: FormData
): Record<string, unknown> {
  return {
    name: data.name,
    slug: {
      _type: "slug",
      current: readText(formData, "slug").trim() || slugify(data.name),
    },
    description: data.description,
    price: data.price,
    category: data.category,
    features: data.features,
    inStock: data.inStock,
    trending: data.trending,
  };
}

function imageFailure(message: string): FormState {
  return {
    status: "error",
    message: "Some fields need attention.",
    fieldErrors: { image: message },
  };
}

/**
 * Server Actions are public endpoints: they can be invoked without ever
 * rendering the page that hosts the form. Every write re-checks the same role
 * gate the pages use, and fails closed with a message the form can show.
 */
async function adminDenial(): Promise<FormState | null> {
  if (await isCurrentUserAdmin()) return null;
  return {
    status: "error",
    message:
      "Your account is not allowed to save changes. Sign in again with an admin account.",
  };
}

export async function createProduct(formData: FormData): Promise<FormState> {
  const denied = await adminDenial();
  if (denied) return denied;

  const parsed = readProductForm(formData);
  if ("failure" in parsed) return parsed.failure;
  const { data } = parsed;

  const existingImages = readExistingImageRefs(formData);
  const newImages = readImageFiles(formData);
  if (existingImages.length + newImages.length === 0) {
    return imageFailure("Choose at least one product photo.");
  }
  if (existingImages.length + newImages.length > MAX_IMAGES) {
    return imageFailure(`Eight product photos is the limit.`);
  }

  try {
    const uploaded = await Promise.all(newImages.map(uploadImage));
    const created = await client.create({
      _type: "product",
      ...productFields(data, formData),
      uniqueId: await nextSerialNumber(),
      images: [...existingImages, ...uploaded],
    });
    revalidateProduct(created._id);
    return { status: "success", message: `“${data.name}” is live.` };
  } catch (error) {
    if (error instanceof UserFacingError) return imageFailure(error.message);
    return { status: "error", message: describeWriteError(error) };
  }
}

export async function updateProduct(
  id: string,
  formData: FormData
): Promise<FormState> {
  const denied = await adminDenial();
  if (denied) return denied;

  const parsed = readProductForm(formData);
  if ("failure" in parsed) return parsed.failure;
  const { data } = parsed;

  const existingImages = readExistingImageRefs(formData);
  const newImages = readImageFiles(formData);
  if (existingImages.length + newImages.length === 0) {
    return imageFailure("Keep at least one product photo.");
  }
  if (existingImages.length + newImages.length > MAX_IMAGES) {
    return imageFailure(`Eight product photos is the limit.`);
  }

  try {
    const uploaded = await Promise.all(newImages.map(uploadImage));
    const fields: Record<string, unknown> = {
      ...productFields(data, formData),
      images: [...existingImages, ...uploaded],
    };
    // Backfill a serial only for legacy documents that never had one. This is
    // read from the document, not the form: the edit form does not post it, so
    // trusting form data here would re-number an existing product on each save.
    const currentSerial = await client.fetch<number | null>(
      `*[_id == $id][0].uniqueId`,
      { id }
    );
    if (typeof currentSerial !== "number") {
      fields.uniqueId = await nextSerialNumber();
    }

    await client.patch(id).set(fields).commit();
    revalidateProduct(id);
    return { status: "success", message: `“${data.name}” saved.` };
  } catch (error) {
    if (error instanceof UserFacingError) return imageFailure(error.message);
    return { status: "error", message: describeWriteError(error) };
  }
}

export async function deleteProduct(
  id: string,
  name: string
): Promise<FormState> {
  const denied = await adminDenial();
  if (denied) return denied;

  try {
    // The storefront reads published documents, but a leftover Studio draft
    // would keep the product visible in Studio and could republish it. Remove
    // both so "Delete product" means gone.
    const draftId = `drafts.${id}`;
    const hasDraft = Boolean(
      await client
        .withConfig({ perspective: "raw" })
        .fetch<string | null>(`*[_id == $draftId][0]._id`, { draftId })
    );

    const transaction = client.transaction().delete(id);
    if (hasDraft) transaction.delete(draftId);
    await transaction.commit();

    revalidateProduct(id);
    return { status: "success", message: `“${name}” deleted.` };
  } catch (error) {
    return { status: "error", message: describeWriteError(error) };
  }
}

export async function saveHomePage(formData: FormData): Promise<FormState> {
  const denied = await adminDenial();
  if (denied) return denied;

  const newImages = readHeroImageFiles(formData);
  const parsed = homePageSchema.safeParse({
    saved: readJsonArray(formData, "existingHeroItems"),
    added: readJsonArray(formData, "newHeroItems"),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const list = issue?.path[0];
    const index = typeof issue?.path[1] === "number" ? issue.path[1] : null;
    const where =
      index === null
        ? ""
        : list === "saved"
          ? `Slide ${index + 1}: `
          : `New image ${index + 1}: `;
    return {
      status: "error",
      message: "Some fields need attention.",
      fieldErrors: {
        heroItems: `${where}${issue?.message ?? "Check every slide."}`,
      },
    };
  }

  const { saved, added } = parsed.data;
  const total = saved.length + newImages.length;
  if (total === 0) {
    return imageFailure("Choose at least one hero image.");
  }
  if (total > MAX_HERO_ITEMS) {
    return imageFailure(`${MAX_HERO_ITEMS} hero images is the limit.`);
  }
  if (added.length !== newImages.length) {
    return imageFailure("Each new hero image needs its own heading.");
  }

  try {
    const uploaded = await Promise.all(newImages.map(uploadImage));

    const savedItems = saved.map((slide) => ({
      _key: slide.key,
      heroImage: {
        _type: "image" as const,
        // Every member of an array needs a key; derive it from the slide so a
        // save does not churn ids Studio is watching.
        _key: `${slide.key}-image`,
        asset: { _type: "reference" as const, _ref: slide.ref },
      },
      heroHeading: slide.heroHeading,
      heroSubheading: slide.heroSubheading,
      ctaText: slide.ctaText,
      ctaLink: slide.ctaLink,
    }));

    const createdItems = uploaded.map((image, index) => ({
      _key: image._key,
      heroImage: image,
      heroHeading: added[index].heroHeading,
      heroSubheading: added[index].heroSubheading,
      ctaText: added[index].ctaText,
      ctaLink: added[index].ctaLink,
    }));

    const heroItems = [...savedItems, ...createdItems];

    await client
      .transaction()
      .createIfNotExists({ _id: "homePage", _type: "homePage" })
      .patch("homePage", (patch) => patch.set({ heroItems }))
      .commit();

    // Hand the editor the stored shape so a second save does not upload the
    // same files again or drop the slides this save just created.
    const slides: AdminHomePage["heroItems"] = heroItems.map((item) => ({
      key: item._key,
      url: urlFor(item.heroImage).url(),
      ref: item.heroImage.asset._ref,
      heroHeading: item.heroHeading,
      heroSubheading: item.heroSubheading,
      ctaText: item.ctaText,
      ctaLink: item.ctaLink,
    }));

    revalidatePath("/");
    return { status: "success", message: "Home page saved.", slides };
  } catch (error) {
    if (error instanceof UserFacingError) return imageFailure(error.message);
    return { status: "error", message: describeWriteError(error) };
  }
}
