import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import TrendingProducts from "@/components/TrendingProducts";
import ProductGrid from "@/components/ProductGrid";
import CategoryFilter from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { mockData } from "@/mockData";
import { Product } from "@/types";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    // In a real app, this would be an API call to Supabase
    const allProducts = mockData.products;
    const trending = allProducts.filter((p) => p.trending);
    const uniqueCategories = [...new Set(allProducts.map((p) => p.category))];

    setProducts(allProducts);
    setTrendingProducts(trending);
    setCategories(uniqueCategories);

    // Initially show just 8 products
    setFilteredProducts(allProducts.slice(0, 8));
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    let results = products;

    if (query) {
      results = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (activeCategory) {
      results = results.filter((p) => p.category === activeCategory);
    }

    setFilteredProducts(results.slice(0, 8));
  };

  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category);

    let results = products;

    if (searchQuery) {
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (category) {
      results = results.filter((p) => p.category === category);
    }

    setFilteredProducts(results.slice(0, 8));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="relative rounded-xl overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
          alt="Kitchen Utensils"
          className="w-full h-[350px] md:h-[500px] object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center z-20 px-6 md:px-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Colored Kitchen
          </h1>
          <p className="text-lg text-white/90 max-w-md mb-6 italic">
            Quality products that last a lifetime.
          </p>
          <div>
            <Link to="/products">
              <Button size="lg" className="px-8">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-12">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* {trendingProducts.length > 0 && (
          <div className="my-12">
            <TrendingProducts products={trendingProducts} />
          </div>
        )} */}
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Our Products</h2>
          <Link to="/products">
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
          <Link to="/products">
            <Button size="lg" className="px-8">
              View All Products
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
