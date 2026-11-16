'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="product-card bg-white rounded-lg overflow-hidden border border-gray-200 flex flex-col h-full">
      <Link href={`/product/${product.id}`} className="overflow-hidden">
        <div className="relative w-full h-40 sm:h-48">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 25vw, (max-width: 1200px) 12vw, 240px"
              quality={80}
              onError={() => {}}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>
      </Link>
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-base sm:text-lg mb-1 hover:text-pink-500 truncate">
          <Link href={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <span className="text-xs sm:text-sm text-gray-500 mb-2">
          {product.category}
        </span>
        <div className="mt-auto pt-3 sm:pt-4 flex items-center justify-between">
          <span className="font-bold text-base sm:text-lg">
            ${product.price.toFixed(2)}
          </span>
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
