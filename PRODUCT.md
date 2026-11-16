# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Shoppers.** People buying kitchen utensils for a home kitchen, browsing and
  comparing by category, price, and product photos on phone and desktop.
- **Store staff.** The owner and anyone they trust to keep the catalog current.
  They work in short sessions, usually right after receiving stock or adding a
  new line, and need to publish a product without learning a CMS.

Both audiences were confirmed by the owner, who describes Colored Kitchen as a
real store with live customers.

## Product Purpose

Colored Kitchen sells kitchen utensils online. The storefront presents a
catalog of products with photos, prices, categories, feature lists, and stock
state; a shopper builds a cart and checks out. Staff keep that catalog and the
homepage current. Success is a shopper finding and buying the utensil they came
for, and staff publishing a correct product page without help.

## Positioning

A focused kitchen-utensil catalog: pots, blenders, and cutlery merchandised with
large product photography and a small, browsable category set, rather than a
general marketplace.

## Operating Context

- Content lives in Sanity (`product` and `homePage` documents). The storefront
  reads the `published` perspective and revalidates cached pages every 60
  seconds (`src/app/page.tsx`, `src/app/products/page.tsx`).
- Sanity Studio is mounted at `/studio` and is the existing editing surface:
  product CRUD, the `homePage` singleton, and Vision (GROQ console).
- Deployed on Vercel behind a Sanity CDN; images are served from
  `cdn.sanity.io` (`next.config.js` `images.remotePatterns`).
- Product categories are a fixed list in the schema: `pot`, `blender`,
  `cutlery`, `other`.

## Capabilities and Constraints

- Next.js 16 App Router, React 19, Tailwind + shadcn/ui (default style, CSS
  variables), Poppins throughout, TypeScript.
- Staff edit the catalog in two places: a storefront-styled admin at `/admin`
  (products CRUD and the home page singleton) and Sanity Studio at `/studio`
  for drafts, revision history, Vision and the asset library.
- Sanity write access requires `SANITY_API_TOKEN` with Editor permission.
  The token currently in `.env.local` has Editor permission on this dataset.
- Product images and the hero image are Sanity image assets; any editing surface
  must upload to Sanity, not to local storage. A product now holds multiple
  images (`images` array); shoppers view them through an arrow slider on the
  product page and can expand any image into a lightbox. The home page hero is
  an array of `heroItems`, one object per slide: each holds its own image,
  heading, subheading and call to action, and adding a slide appends instead of
  replacing. Older documents that still carry `heroImages` plus a single
  `heroHeading` are folded into the same shape when read; the next save from
  `/admin/home` writes `heroItems` and leaves the old fields untouched.
- Each product receives a unique serial number (`uniqueId`) when created by the
  admin: the lowest positive integer not currently assigned. When a product is
  deleted its number is freed and can be reassigned, so the catalog does not
  accumulate unused numbers.
- The cart is client-side (`src/hooks/useCart.tsx`); there is no order pipeline
  or customer record in this repository.
- `src/integrations/supabase/client.ts` holds an unused Supabase client with a
  hardcoded project URL and publishable key. It is dead code; nothing imports
  it. Recorded here so it is not mistaken for an active data layer.
- `Header` and `Footer` are built but not mounted in `src/app/layout.tsx`, so
  the storefront currently renders no global navigation.

## Brand Commitments

- Name: **Colored Kitchen**. The browser title and footer still say "Kitchen
  Utensil Emporium"; the storefront header wordmark is "Colored Kitchen".
- Voice: plain, warm, product-first. No hype, no urgency devices.
- Palette already in code: copper `--primary` (`25 56% 46%`), pink accent used
  for hover and category selection, white surfaces, `rounded-2xl` nav chrome.
- Contact details in `src/components/Footer.tsx` are real and must not be
  replaced.

## Evidence on Hand

- Real catalog: product names, descriptions, prices, photos, features, and stock
  state in the Sanity dataset.
- Real staff contact details in the footer.
- Absent, and not to be fabricated: customer names, testimonials, ratings,
  order counts, revenue figures, press mentions, or partner logos.

## Product Principles

1. The catalog is the product. Every screen serves browsing or maintaining it.
2. Staff edits should reach the storefront without a deploy and without a
   second content system.
3. Currency is naira in the shop's real trade, while the current UI formats
   prices with `$`; treat this as an open display decision, not a settled fact.
4. A shopper's path is never blocked by admin tooling; admin surfaces stay
   behind their own route.
