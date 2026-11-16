import { defineType, defineField } from "sanity";
import { FiHome, FiImage } from "react-icons/fi";

export default defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  icon: FiHome,
  // Singleton behavior is enforced by the Structure Builder in sanity.config.ts.
  // `options.singleton` is not a real Sanity option and fails type-checking.
  fields: [
    defineField({
      name: "heroItems",
      title: "Hero Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "heroImage",
              title: "Hero Image",
              type: "image",
              options: {
                hotspot: true,
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "heroHeading",
              title: "Hero Heading",
              type: "string",
              validation: (Rule) => Rule.required().max(120),
            }),
            defineField({
              name: "heroSubheading",
              title: "Hero Subheading",
              type: "text",
              rows: 3,
            }),
            defineField({
              name: "ctaText",
              title: "CTA Text",
              type: "string",
              initialValue: "Shop Now",
            }),
            defineField({
              name: "ctaLink",
              title: "CTA Link",
              type: "string",
              initialValue: "/products",
            }),
          ],
          validation: (Rule) => Rule.required(),
        },
      ],
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
  ],
  preview: {
    select: {
      title: "heroItems[0].heroHeading",
      media: "heroItems[0].heroImage",
    },
    prepare({ title, media }) {
      return {
        title,
        media,
      };
    },
  },
});
