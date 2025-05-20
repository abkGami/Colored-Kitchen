import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { mockData } from "@/mockData";
import { Product } from "@/types";
import {
  ShoppingCart,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isFeaturesExpanded, setIsFeaturesExpanded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    // In a real app, this would be an API call to Supabase
    const foundProduct = mockData.products.find((p) => p.id === Number(id));
    if (foundProduct) {
      setProduct(foundProduct);
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handlePurchase = () => {
    if (product) {
      // Format the WhatsApp message with product information
      const message = encodeURIComponent(
        `Hello, I'm interested in purchasing "${
          product.name
        }" for $${product.price.toFixed(
          2
        )}. Could you provide more information?`
      );
      // Open WhatsApp with the pre-filled message
      window.open(`https://wa.me/?text=${message}`, "_blank");
    }
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/products"
        className="inline-flex items-center text-gray-600 hover:text-primary mb-8"
      >
        <ChevronLeft className="h-5 w-5" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="relative overflow-hidden rounded-lg border border-gray-200">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-auto object-cover"
          />
          {product.trending && (
            <span className="absolute top-4 right-4 bg-primary text-white text-sm font-medium px-3 py-1 rounded-full">
              Trending
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          <span className="text-sm text-gray-500 capitalize mb-4">
            {product.category}
          </span>

          <div className="text-2xl font-bold text-primary mb-6">
            ${product.price.toFixed(2)}
          </div>

          <div className="mb-6">
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="flex items-center justify-between w-full py-3 border-b border-gray-200"
            >
              <span className="font-medium">Description</span>
              {isDescriptionExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            <div
              className={`pt-3 pb-6 text-gray-600 ${
                isDescriptionExpanded ? "block" : "hidden"
              }`}
            >
              <p>{product.description}</p>
            </div>
          </div>

          {product.features && (
            <div className="mb-8">
              <button
                onClick={() => setIsFeaturesExpanded(!isFeaturesExpanded)}
                className="flex items-center justify-between w-full py-3 border-b border-gray-200"
              >
                <span className="font-medium">Features</span>
                {isFeaturesExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>

              <div
                className={`pt-3 pb-6 ${
                  isFeaturesExpanded ? "block" : "hidden"
                }`}
              >
                <ul className="list-disc pl-5 text-gray-600">
                  {product.features.map((feature, index) => (
                    <li key={index} className="mb-1">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="mt-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex border border-gray-300 rounded overflow-hidden">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200"
                >
                  -
                </button>
                <span className="px-4 py-2 flex items-center justify-center min-w-[40px]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200"
                >
                  +
                </button>
              </div>

              <div className="flex-1">
                <Button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
              </div>
            </div>

            <Button
              onClick={handlePurchase}
              variant="outline"
              className="w-full"
            >
              Purchase via WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
