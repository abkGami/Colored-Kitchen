import { getProducts } from "@/lib/sanity";
import { Product } from "@/types";
import ProductsShell from "@/components/ProductsShell";

// Published Sanity content should reach the site without a full rebuild.
export const revalidate = 60;

export default async function ProductsPage() {
  const products = await getProducts();

  const categories = [...new Set(products.map((p) => p.category))];
  const trendingProducts = products.filter((p) => p.trending);

  return (
    <ProductsShell
      products={products}
      categories={categories}
      trending={trendingProducts}
    />
  );
}
