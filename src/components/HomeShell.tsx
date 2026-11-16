'use client';

import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import TrendingProducts from "@/components/TrendingProducts";
import ProductGrid from "@/components/ProductGrid";
import CategoryFilter from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types";
import { useProductFilter } from "@/hooks/use-product-filter";

interface HomeShellProps {
  products: Product[];
  categories: string[];
  trending: Product[];
}

export default function HomeShell({
  products,
  categories,
  trending,
}: HomeShellProps) {
  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    filteredProducts,
  } = useProductFilter(products, { limit: 8 });

  const handleSearch = setSearchQuery;
  const handleCategoryChange = setActiveCategory;

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="mb-12">
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Our Products</h2>
          <Link href="/products">
            <Button variant="outline" className="flex items-center gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        <ProductGrid products={filteredProducts} />

        <div className="mt-10 text-center">
          <Link href="/products">
            <Button size="lg" className="px-8">
              View All Products
            </Button>
          </Link>
        </div>
      </section>

      {trending.length > 0 && (
        <TrendingProducts products={trending} />
      )}
    </div>
  );
}
