
import React, { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import ProductGrid from '@/components/ProductGrid';
import CategoryFilter from '@/components/CategoryFilter';
import TrendingProducts from '@/components/TrendingProducts';
import { mockData } from '@/mockData';
import { Product } from '@/types';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    // In a real app, this would be an API call to Supabase
    const allProducts = mockData.products;
    const trending = allProducts.filter(p => p.trending);
    const uniqueCategories = [...new Set(allProducts.map(p => p.category))];
    
    setProducts(allProducts);
    setFilteredProducts(allProducts);
    setTrendingProducts(trending);
    setCategories(uniqueCategories);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    let results = products;
    
    if (query) {
      results = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (activeCategory) {
      results = results.filter(p => p.category === activeCategory);
    }
    
    setFilteredProducts(results);
  };

  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category);
    
    let results = products;
    
    if (searchQuery) {
      results = results.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (category) {
      results = results.filter(p => p.category === category);
    }
    
    setFilteredProducts(results);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative mb-12 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
          alt="Kitchen Utensils" 
          className="w-full h-[300px] md:h-[400px] object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center z-20 px-6 md:px-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">All Kitchen Utensils</h1>
          <p className="text-lg text-white/90 max-w-md">
            Find everything you need to elevate your cooking experience.
          </p>
        </div>
      </div>
      
      {/* Trending Section */}
      {trendingProducts.length > 0 && (
        <div className="mb-12">
          <TrendingProducts products={trendingProducts} />
        </div>
      )}
      
      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>
      
      {/* Main Products Section */}
      <h2 className="text-2xl font-bold mb-6">All Products</h2>
      
      <CategoryFilter 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
      
      <div className="mb-4 text-sm text-gray-500">
        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
      </div>
      
      <ProductGrid products={filteredProducts} />
    </div>
  );
};

export default ProductsPage;
