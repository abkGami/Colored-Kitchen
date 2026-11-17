'use client';

import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import ProductGrid from "@/components/ProductGrid";
import CategoryFilter from "@/components/CategoryFilter";
import TrendingProducts from "@/components/TrendingProducts";
import { Product } from "@/types";
import { useProductFilter } from "@/hooks/use-product-filter";

interface ProductsShellProps {
  products: Product[];
  categories: string[];
  trending: Product[];
}

export default function ProductsShell({
  products,
  categories,
  trending,
}: ProductsShellProps) {
  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    filteredProducts,
  } = useProductFilter(products);

  const handleSearch = setSearchQuery;
  const handleCategoryChange = setActiveCategory;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative mb-12 rounded-xl overflow-hidden h-[240px] md:h-[320px]">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10"></div>
        <Image
          src="https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
          alt="Kitchen Utensils"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1200px"
          quality={80}
        />
        <div className="absolute inset-0 flex flex-col justify-center z-20 px-6 md:px-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            All Kitchen Utensils
          </h1>
          <p className="text-lg text-white/90 max-w-md">
            Find everything you need to elevate your cooking experience.
          </p>
        </div>
      </div>

      <div className="mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      <h2 className="text-2xl font-bold mb-6">All Products</h2>

      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      <div className="mb-4 text-sm text-gray-500">
        {filteredProducts.length}{" "}
        {filteredProducts.length === 1 ? "product" : "products"} found
      </div>

      <ProductGrid products={filteredProducts} />

      {trending.length > 0 && <TrendingProducts products={trending} />}
    </div>
  );
}
