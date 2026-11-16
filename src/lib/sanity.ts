import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import { Product, HomePage, AdminProduct, AdminHomePage, HeroItem } from "@/types";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01";

if (!projectId) {
  throw new Error(
    "Missing environment variable NEXT_PUBLIC_SANITY_PROJECT_ID. See .env.local"
  );
}

if (!dataset) {
  throw new Error(
    "Missing environment variable NEXT_PUBLIC_SANITY_DATASET. See .env.local"
  );
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_TOKEN,
  perspective: "published",
  useCdn: false,
});

export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_TOKEN,
  perspective: "previewDrafts",
  useCdn: false,
});

const builder = createImageUrlBuilder(client);

export function urlFor(source: unknown) {
  return builder.image(source);
}

function mapProduct(doc: SanityProductDoc): Product {
  return {
    id: doc._id,
    name: doc.name,
    description: doc.description,
    price: doc.price,
    images: mapImages(doc),
    uniqueId: doc.uniqueId ?? 0,
    category: doc.category,
    features: doc.features,
    inStock: doc.inStock ?? true,
    trending: doc.trending ?? false,
  };
}

function mapImages(doc: SanityProductDoc): string[] {
  // New images array takes precedence when it has valid entries.
  if (doc.images?.length) {
    const urls = doc.images
      .filter((image) => Boolean(image?.asset?._ref))
      .map((image) => imageUrl(image));
    if (urls.length > 0) return urls;
  }
  // Fall back to the legacy single-image field for older documents.
  if (doc.image && typeof doc.image === "object") {
    const legacy = doc.image as { _type?: string; asset?: { _ref?: string } };
    if (legacy.asset?._ref) {
      return [urlFor({ _type: "image", asset: { _ref: legacy.asset._ref } }).url()];
    }
  }
  return [];
}

function imageUrl(image: SanityImage): string {
  return urlFor({ _type: "image", asset: { _ref: image.asset._ref } }).url();
}

/** Reads the legacy single-image field into the same shape as an image array. */
function legacyImages(legacy: unknown): SanityImage[] {
  if (!legacy || typeof legacy !== "object") return [];
  const ref = (legacy as { asset?: { _ref?: string } }).asset?._ref;
  return ref ? [{ _key: "legacy", asset: { _ref: ref } }] : [];
}

/**
 * Turns a document's image array (or the legacy single image field) into
 * admin-ready image items: display URL plus the Sanity asset reference needed
 * to keep the photo on re-save.
 */
function mapImageItems(doc: SanityProductDoc): Array<{ key: string; url: string; ref: string }> {
  const items: Array<{ key: string; url: string; ref: string }> = [];
  const images: SanityImage[] = doc.images?.length
    ? doc.images
    : legacyImages(doc.image);

  images.forEach((image, index) => {
    const ref = image.asset?._ref;
    if (!ref) return;
    items.push({
      key: image._key ?? `legacy-${index}`,
      url: imageUrl(image),
      ref,
    });
  });
  return items;
}

/**
 * Hero slides are one object per image. Documents saved before that change hold
 * a single heading and a plain `heroImages` array instead. Folding the old shape
 * into the new one here keeps the current slides on the storefront (each shows
 * the old document heading) without a migration, and the first save from the
 * admin replaces the old fields with `heroItems`.
 */
const heroItemsProjection = `"heroItems": coalesce(
  heroItems[]{
    _key,
    heroImage,
    heroHeading,
    heroSubheading,
    ctaText,
    ctaLink
  },
  heroImages[]{
    _key,
    "heroImage": @,
    "heroHeading": ^.heroHeading,
    "heroSubheading": ^.heroSubheading,
    "ctaText": ^.ctaText,
    "ctaLink": ^.ctaLink
  }
)`;

function mapHomePage(doc: SanityHomePageDoc): HomePage {
  return {
    heroItems: mapHeroItems(doc),
  };
}

function mapHeroItems(doc: SanityHomePageDoc): HeroItem[] {
  const items: HeroItem[] = [];
  for (const item of doc.heroItems ?? []) {
    const heroImage = itemUrl(item.heroImage);
    // A slide without an image has nothing to show; skip it rather than render
    // an empty frame.
    if (!heroImage) continue;
    items.push({
      heroImage,
      heroHeading: item.heroHeading?.trim() ?? "",
      heroSubheading: item.heroSubheading?.trim() || undefined,
      ctaText: item.ctaText?.trim() || "Shop Now",
      ctaLink: item.ctaLink?.trim() || "/products",
    });
  }
  return items;
}

function itemUrl(image: unknown): string {
  if (!image || typeof image !== "object") return "";
  const ref = (image as { asset?: { _ref?: string } }).asset?._ref;
  return ref ? urlFor({ _type: "image", asset: { _ref: ref } }).url() : "";
}

function mapAdminHeroItems(doc: SanityHomePageDoc): AdminHomePage["heroItems"] {
  const items: AdminHomePage["heroItems"] = [];
  (doc.heroItems ?? []).forEach((item, index) => {
    const ref = item.heroImage?.asset?._ref;
    if (!ref) return;
    items.push({
      // The stable key lives on the array member. Falling back to the image key
      // keeps older documents editable without handing React a new id per load.
      key: item._key ?? item.heroImage?._key ?? `hero-${index}`,
      url: itemUrl(item.heroImage),
      ref,
      heroHeading: item.heroHeading ?? "",
      heroSubheading: item.heroSubheading ?? "",
      ctaText: item.ctaText?.trim() || "Shop Now",
      ctaLink: item.ctaLink?.trim() || "/products",
    });
  });
  return items;
}

// Shared projection. `asset` must stay a reference object: dereferencing it
// (`asset->`) returns the asset document, which has no `_ref`, so mapImages()
// would silently drop every photo.
const productProjection = `{
  _id,
  _type,
  name,
  "slug": slug.current,
  description,
  price,
  "images": images[]{_key, asset},
  image,
  category,
  features,
  inStock,
  trending,
  uniqueId,
  _updatedAt
}`;

export async function getProducts(): Promise<Product[]> {
  try {
    const docs = await client.fetch<SanityProductDoc[]>(
      `*[_type == "product"] | order(_updatedAt desc) ${productProjection}`
    );
    return docs.map(mapProduct);
  } catch (error) {
    console.error("Failed to fetch products from Sanity:", error);
    return [];
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const doc = await client.fetch<SanityProductDoc | null>(
      `*[_type == "product" && _id == $id][0] ${productProjection}`,
      { id: slug }
    );
    return doc ? mapProduct(doc) : null;
  } catch (error) {
    console.error(`Failed to fetch product "${slug}" from Sanity:`, error);
    return null;
  }
}

export async function getHomePage(): Promise<HomePage | null> {
  try {
    const doc = await client.fetch<SanityHomePageDoc | null>(
      `*[_id == "homePage"][0] {
        _id,
        ${heroItemsProjection}
      }`
    );
    return doc ? mapHomePage(doc) : null;
  } catch (error) {
    console.error("Failed to fetch home page from Sanity:", error);
    return null;
  }
}

// The storefront reads the published perspective, which hides drafts. Studio's
// unpublished edits are a real hazard for staff editing here, so the draft
// check runs on a raw-perspective client instead of a GROQ subquery.
const rawClient = client.withConfig({ perspective: "raw" });

async function getDraftProductIds(): Promise<Set<string>> {
  const ids = await rawClient.fetch<string[]>(
    `*[_id in path("drafts.**") && _type == "product"]._id`
  );
  return new Set(ids.map((id) => id.replace(/^drafts\./, "")));
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const [docs, draftIds] = await Promise.all([
    client.fetch<SanityProductDoc[]>(
      `*[_type == "product"] | order(_updatedAt desc) ${productProjection}`
    ),
    getDraftProductIds(),
  ]);
  return docs.map((doc) => ({
    ...mapProduct(doc),
    // The projections alias `"slug": slug.current`, so this is a string, not
    // the `{ current }` document shape.
    slug: doc.slug ?? "",
    updatedAt: doc._updatedAt,
    hasDraft: draftIds.has(doc._id),
    imageRefs: mapImageItems(doc),
  }));
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  const [doc, draft] = await Promise.all([
    client.fetch<SanityProductDoc | null>(
      `*[_type == "product" && _id == $id][0] ${productProjection}`,
      { id }
    ),
    rawClient.fetch<string | null>(`*[_id == $draftId][0]._id`, {
      draftId: `drafts.${id}`,
    }),
  ]);
  if (!doc) return null;
  return {
    ...mapProduct(doc),
    slug: doc.slug ?? "",
    updatedAt: doc._updatedAt,
    hasDraft: Boolean(draft),
    imageRefs: mapImageItems(doc),
  };
}

export async function getAdminHomePage(): Promise<AdminHomePage | null> {
  const doc = await client.fetch<(SanityHomePageDoc & { _updatedAt?: string }) | null>(
    `*[_id == "homePage"][0] {
      _id,
      ${heroItemsProjection},
      _updatedAt
    }`
  );
  if (!doc) return null;
  return {
    heroItems: mapAdminHeroItems(doc),
    updatedAt: doc._updatedAt,
  };
}

type SanityImage = {
  _key?: string;
  asset: {
    _ref: string;
  };
};

type SanityProductDoc = {
  _id: string;
  _type: string;
  name: string;
  // Queries alias `"slug": slug.current`, so this arrives as a plain string.
  slug?: string;
  description: string;
  price: number;
  // Legacy single-image field, kept so older documents still read correctly.
  image?: unknown;
  images?: SanityImage[];
  category: string;
  features?: string[];
  inStock?: boolean;
  trending?: boolean;
  uniqueId?: number;
  _updatedAt?: string;
};

type SanityHeroItem = {
  _key?: string;
  heroImage?: {
    _key?: string;
    asset?: { _ref?: string };
  };
  heroHeading?: string;
  heroSubheading?: string;
  ctaText?: string;
  ctaLink?: string;
};

type SanityHomePageDoc = {
  _id: string;
  heroItems?: SanityHeroItem[];
};
