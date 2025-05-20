
import React, { useRef } from 'react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface TrendingProductsProps {
  products: Product[];
}

const TrendingProducts: React.FC<TrendingProductsProps> = ({ products }) => {
  const isMobile = useIsMobile();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  if (!products || products.length === 0) {
    return null;
  }

  const scrollAmount = 300;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative py-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Trending Now</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full" 
            onClick={scrollLeft}
            aria-label="Scroll left"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full" 
            onClick={scrollRight}
            aria-label="Scroll right"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="w-full pb-4">
        <div 
          ref={scrollContainerRef}
          className="flex space-x-4 pb-2"
        >
          {products.map((product) => (
            <div 
              key={product.id} 
              className={`${isMobile ? 'min-w-[75%]' : 'min-w-[25%]'} flex-shrink-0`}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TrendingProducts;
