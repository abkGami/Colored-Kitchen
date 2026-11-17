import { getHomePage, getProducts } from "@/lib/sanity";
import HomeShell from "@/components/HomeShell";
import HeroCarousel from "@/components/HeroCarousel";

// Published Sanity content should reach the site without a full rebuild.
export const revalidate = 60;

export default async function Home() {
  const [homePage, products] = await Promise.all([
    getHomePage(),
    getProducts(),
  ]);

  const trendingProducts = products.filter((p) => p.trending);
  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="container mx-auto px-4 py-8">
      {homePage && homePage.heroItems.length > 0 && (
        <HeroCarousel heroItems={homePage.heroItems} />
      )}

      <HomeShell products={products} categories={categories} trending={trendingProducts} />
    </div>
  );
}
