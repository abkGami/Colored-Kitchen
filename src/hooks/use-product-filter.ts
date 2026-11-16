'use client';

import { useMemo, useState } from "react";
import { Product } from "@/types";

interface UseProductFilterOptions {
  limit?: number;
}

export function useProductFilter(
  products: Product[],
  { limit }: UseProductFilterOptions = {}
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    let results = products;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    if (activeCategory) {
      results = results.filter((p) => p.category === activeCategory);
    }

    return limit ? results.slice(0, limit) : results;
  }, [products, searchQuery, activeCategory, limit]);

  return {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    filteredProducts,
  };
}
