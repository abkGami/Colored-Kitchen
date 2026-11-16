/**
 * Clerk's design tokens, mapped onto the storefront system in DESIGN.md:
 * Poppins, copper primary (the solid-action colour), 0.5rem radius, hairline
 * borders on white.
 *
 * Two behaviours of @clerk/nextjs 7.9.25 are deliberately accommodated here,
 * both confirmed by measuring the rendered page rather than reading docs:
 *
 * 1. Provider-level `appearance` is ignored. The same variables applied on
 *    <SignIn> turn the button copper (#b87333); on <ClerkProvider> the button
 *    stayed at Clerk's default #2F3037. So each prebuilt component gets the
 *    theme explicitly.
 * 2. Only `variables` take effect. Tailwind class strings passed through
 *    `elements` (e.g. `card`, `shadow-none`) did not change the card, so they
 *    are not shipped here; restyling beyond tokens needs CSS overrides.
 */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#b87333",
    colorPrimaryForeground: "#ffffff",
    colorBackground: "#ffffff",
    colorForeground: "#0b1220",
    colorMutedForeground: "hsl(215.4 16.3% 46.9%)",
    colorInput: "#ffffff",
    colorInputForeground: "#0b1220",
    colorBorder: "hsl(214.3 31.8% 91.4%)",
    colorRing: "#b87333",
    colorDanger: "#ef4444",
    borderRadius: "0.5rem",
    fontFamily: "Poppins, sans-serif",
    fontFamilyButtons: "Poppins, sans-serif",
  },
};
