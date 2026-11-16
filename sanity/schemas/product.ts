import { defineType, defineField } from "sanity";
import { FiPackage, FiImage, FiTrendingUp, FiCheckCircle } from "react-icons/fi";

export default defineType({
  name: "product",
  title: "Product",
  type: "document",
  icon: FiPackage,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "images",
      title: "Product photos",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1).max(8),
    }),
    defineField({
      name: "uniqueId",
      title: "Unique ID",
      description: "Serial number assigned by the admin. Reused when a product is deleted.",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: ["pot", "blender", "cutlery", "other"],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "inStock",
      title: "In Stock",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "trending",
      title: "Trending",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "name",
      category: "category",
      price: "price",
      media: "images",
      trending: "trending",
    },
    prepare({ title, category, price, media, trending }) {
      return {
        title,
        subtitle: `${category} - $${price?.toFixed(2)}`,
        media,
      };
    },
  },
});
