# DESIGN.md — Colored Kitchen

The visual system shipped in this repo. Everything here is read from the code, not aspirational:
each claim names the file that owns it. Change the code, then change this file.

## World

A warm, high-street kitchenware storefront. White surfaces, one hot accent, heavy rounded cards,
and Poppins everywhere. It should feel like a well-lit shop floor, not a SaaS dashboard — which is
also why the admin inherits the storefront rather than introducing a second visual language.

Two documents bound any design work here:

- `PRODUCT.md` — what the business is (a real store with live customers; "projects" in the owner's
  vocabulary means a catalog product).
- `.impeccable/surfaces/src-app-admin.md` — the admin surface brief and its direction contract.

## Tokens

Owned by `src/index.css` (`:root` block) and mapped in `tailwind.config.ts` (`theme.extend.colors`).
All values are HSL channel triplets consumed as `hsl(var(--token))`.

| Token | Value | Role |
| --- | --- | --- |
| `--background` / `--card` | `0 0% 100%` | Page and card surfaces are pure white |
| `--foreground` | `222.2 84% 4.9%` | Near-black body text |
| `--primary` | `25 56% 46%` | Copper. Solid action buttons, focus ring |
| `--muted` / `--secondary` / `--accent` | `210 40% 96.1%` | Cool grey fills: image placeholders, inactive chips |
| `--muted-foreground` | `215.4 16.3% 46.9%` | Secondary copy, hints, table meta |
| `--destructive` | `0 84.2% 60.2%` | Delete actions and error text |
| `--border` / `--input` | `214.3 31.8% 91.4%` | Every 1px hairline |
| `--radius` | `0.5rem` | Cards, inputs, images; `lg` = this, `md`/`sm` step down |

Named accent colours also exist in Tailwind config: `copper #B87333`, `copper-light #D2946B`,
`terracotta #E08362`. They are available but the shipped UI mostly uses the tokens above.

**One fork worth naming.** The brand pink (`pink-500`, Tailwind's stock `#ec4899`) is hard-coded in
`src/components/Header.tsx:15`, `src/components/ProductCard.tsx:33`, `src/components/admin/AdminNav.tsx:40`
and `src/components/admin/ProductsTable.tsx:204` for the logo, cart badge, active nav underline, and
link hover — while `--primary` copper drives solid buttons (`bg-primary` via `src/components/ui/button.tsx`).
So there are two accent values living side by side. It is the incumbent look, and the admin matches it
deliberately; treat unifying them as a store-wide decision, not an admin fix.

## Type

One family: **Poppins** (300–700), loaded in `src/app/layout.tsx` and applied globally through
`body { @apply font-poppins }` in `src/index.css`. No second face, no display face.

Observed scale, by role:

- Page title — `text-2xl font-bold` (`src/app/admin/page.tsx:29`)
- Card / section heading — `text-base sm:text-lg font-semibold` (`src/components/ProductCard.tsx:33`)
- Body — `text-sm`
- Meta, hints, timestamps — `text-xs text-muted-foreground`
- Prices — bold, `$` prefixed (`ProductCard`, `ProductForm`)

## Layout

- Shell: `container mx-auto px-4 py-8`, `pb-20` on the admin so the last card clears the fold
  (`src/app/admin/layout.tsx`).
- Header: `sticky top-0 z-50 bg-white shadow-xl rounded-b-2xl`, logo left in pink bold, nav in a
  bordered row beneath (`src/components/Header.tsx`, mirrored in `src/app/admin/layout.tsx`).
- Cards: `rounded-lg border border-border bg-white`, generous internal padding, no drop shadows at rest.
- Product cards lift on hover — `.product-card` in `src/index.css` (`hover:shadow-lg hover:-translate-y-1`).
- Grids: 1-up by default, 2-up at `xs`, 3-up at `md`, 4-up at `lg` (`src/components/ProductGrid.tsx:21`).
- Admin forms: two columns at `lg` — fields left, sticky image/status column right.

## Storefront surfaces

**Product page (`src/app/product/[id]`, `src/components/ProductDetailShell.tsx`, `src/components/ProductImageGallery.tsx`).**
The lead image fills a rounded card and carries copper previous/next arrows
vertically centred on its left and right edges (`GalleryArrow`); clicking the
image opens a full-screen lightbox showing it at a larger size. When a product
has multiple images, a thumbnail strip sits below the lead image and the
lightbox carries the same arrows plus an image counter. Arrow keys step through
the gallery anywhere on the page. The product's serial number shows beside the
category ("Product #4").

**Home page (`src/app/page.tsx`).**
The hero is a carousel of `heroItems`: each slide carries its own image, heading,
subheading and call to action, so the copy changes with the image. Slides are
edited per image on `/admin/home` (and in Studio); up to five. It cycles with
user-triggered previous/next arrows and dot navigation. The arrows are the same
`GalleryArrow` control used on the product page, inset from the hero edges at the
vertical centre; the hero copy is padded clear of them. A single slide renders as
before. Documents saved before the per-slide model still read through a
compatibility projection that lends each old image the document heading, so the
carousel never disappears between a schema change and the next save.

## Components

`src/components/ui/*` is shadcn/ui on Radix. Use it; don't hand-roll a control.
Inventory in active use: `button`, `input`, `textarea`, `label`, `select`, `switch`, `badge`,
`alert-dialog`, `card`, `table`, `separator`, `sheet` (image lightbox).

Specifics worth keeping:

- Primary button = `bg-primary` copper, white text, `rounded-md`.
- Image arrows = `GalleryArrow` (`src/components/GalleryArrow.tsx`): a copper
  circle with a white chevron, `rounded-full`, offset shadow and hairline ring
  so it stays legible over any photograph, `40px` on mobile and `44–48px` above
  `md`. The same control is used by the hero, the product gallery and the
  lightbox; disabled at the first/last image where the set does not wrap.
- Outline button = bordered, transparent, used for "View All"-style secondary navigation.
- Destructive = `--destructive` text on a `destructive/5` fill with `destructive/30` border
  (`src/app/admin/page.tsx:46`) — never a solid red block.
- Focus is always visible: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
- State is spelled out in words, not colour alone: draft badge, "No image yet", empty-filter copy,
  and error text with `role="alert"`.

## Admin surface

`/admin` is an Operate-mode surface: the same world as the storefront, denser, with zero marketing.
Its contract (`src/components/admin/`):

- Header carries the same wordmark and a `Badge` reading "Admin"; `#admin-header-actions` is the
  reserved slot for account UI in `src/app/admin/layout.tsx`.
- Nav is a bordered tab strip: Products / Home page / Sanity Studio (external).
- Tables use `Table` with thumbnail + name as the row identity, muted meta columns, and one row-level
  action cluster. Row names link to edit; hover turns pink like product titles.
- Every mutation has three states: pending (spinner in `SubmitButton`), error (inline `role="alert"`),
  success (redirect or toast-free confirmation copy). Nothing is silent.
- Destructive actions go through `AlertDialog` and name the item being deleted.
- Images are uploaded, never referenced by path: `MultiImageField` previews new
  images as `blob:` URLs immediately and keeps existing photos on re-save;
  uploading more images appends to the set instead of overwriting it. Removing
  a thumbnail excludes it from the next save. Every product carries a serial
  number (`uniqueId`) shown in the table and the edit form; the admin assigns
  the lowest free number on create, so deleted numbers are reused.

## Accessibility floor

- Semantic `table`/`thead`/`th`, labelled inputs via `Label htmlFor`, `useId` for generated ids.
- Every icon-only affordance carries `aria-hidden` on the icon plus a text label or `aria-label`.
- Contrast: near-black on white for body, `--muted-foreground` only for secondary copy — not for
  anything a user must read to act.
- Reduced-motion: keep transitions to hover shadow/translate; nothing autoplays.

## Auth surfaces

Clerk owns identity; the storefront's visual language owns the pages. Three
routes live outside the storefront chrome:

- `/sign-in` — centred card on `bg-muted/40`, the pink wordmark above it, one
  line of plain-language context. The prebuilt Clerk component sits inside
  `<Suspense>`; signed-in visitors are bounced to `/admin` automatically.
- `/sign-up` — deliberately **not** a form. Public sign-up is off on the Clerk
  instance (`sign_up_mode: "restricted"`), so this route only explains that the
  owner creates accounts, and points back to sign-in.
- `/no-access` — reached when a signed-in account lacks the admin role. Spells
  out the fix (set `publicMetadata.role` to `admin`) with the exact CLI command,
  plus the account menu, instead of a bare 404.

**The gate.** `src/lib/admin-auth.ts` is the only definition of "admin":
`isCurrentUserAdmin()` (signed in + `publicMetadata.role === "admin"`) and
`requireAdmin()` (redirects to `/sign-in`, then `/no-access`). Every admin page
calls `requireAdmin()` — not just the layout, because layouts do not re-run on
client navigation — and every Server Action calls `adminDenial()` first, since
actions are public endpoints that can be invoked without the page.

`src/proxy.ts` holds a bare `clerkMiddleware()` with no route matching: the
check lives next to the data it guards, per Clerk's current guidance. `/studio`
is intentionally not gated here — it authenticates against Sanity itself.

**Theming Clerk.** `src/lib/clerk-appearance.ts` maps Clerk's variables onto the
tokens above (copper `#b87333`, Poppins, `0.5rem`). Two quirks of
`@clerk/nextjs@7.9.25` are documented in that file because they cost debugging:
provider-level `appearance` is ignored (it must be set on each component), and
`elements` class overrides do not apply.

## Changing this system

1. Change the token in `src/index.css` (or the Tailwind config for structural values).
2. Prove it on the storefront and `/admin` in the same pass — both read the same tokens.
3. Re-shoot at 1280×900 and 390×844 before calling it done.
