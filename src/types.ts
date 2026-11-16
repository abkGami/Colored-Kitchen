
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  uniqueId: number;
  category: string;
  features?: string[];
  inStock: boolean;
  trending?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface HeroItem {
  heroImage: string;
  heroHeading: string;
  heroSubheading?: string;
  ctaText: string;
  ctaLink: string;
}

export interface HomePage {
  heroItems: HeroItem[];
}

// Admin views keep the fields the storefront mapping drops: the slug shown in
// Studio's previews, the timestamp that tells staff how fresh a row is, and the
// Sanity image references needed to keep existing photos when a product is
// saved again.
export interface AdminProduct extends Product {
  slug: string;
  updatedAt?: string;
  hasDraft?: boolean;
  imageRefs: Array<{ key: string; url: string; ref: string }>;
}

export interface AdminHomePage {
  heroItems: Array<{ 
    key: string; 
    url: string; 
    ref: string; 
    heroHeading: string;
    heroSubheading?: string;
    ctaText: string;
    ctaLink: string;
  }>;
  updatedAt?: string;
}

export const PRODUCT_CATEGORIES = [
  "pot",
  "blender",
  "cutlery",
  "other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
