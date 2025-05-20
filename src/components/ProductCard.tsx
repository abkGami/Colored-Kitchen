
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  
  return (
    <div className="product-card bg-white rounded-lg overflow-hidden border border-gray-200 flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-40 sm:h-48 object-cover hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-base sm:text-lg mb-1 hover:text-copper truncate">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <span className="text-xs sm:text-sm text-gray-500 mb-2">{product.category}</span>
        <div className="mt-auto pt-3 sm:pt-4 flex items-center justify-between">
          <span className="font-bold text-base sm:text-lg">${product.price.toFixed(2)}</span>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => addToCart(product)}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
