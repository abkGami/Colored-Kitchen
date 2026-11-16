'use client'

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import product from "./sanity/schemas/product";
import homePage from "./sanity/schemas/homePage";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local");
}
if (!dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_DATASET in .env.local");
}

export default defineConfig({
  name: "colored-kitchen",
  title: "Colored Kitchen",
  // Must match the route the Studio is mounted on, or the router reads
  // "/studio" as a tool name and renders "Tool not found: studio".
  basePath: "/studio",
  projectId,
  dataset,

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Home Page")
              .id("homePage")
              .child(S.document().schemaType("homePage").documentId("homePage")),
            S.divider(),
            S.documentTypeListItem("product").title("Products"),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: [product, homePage],
  },

  // A singleton must not be deletable or duplicable, or the fixed id can be lost.
  document: {
    actions: (actions, { schemaType }) =>
      schemaType === "homePage"
        ? actions.filter(
            (action) => action.action !== "delete" && action.action !== "duplicate",
          )
        : actions,
  },
});
