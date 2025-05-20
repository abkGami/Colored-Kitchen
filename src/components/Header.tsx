import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/hooks/useCart";

const Header = () => {
  const { cartItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-xl rounded-b-2xl">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* <Link to="/" className="text-2xl font-bold text-copper"> */}
        <Link to="/" className="text-2xl font-bold text-pink-500">
          Colored Kitchen
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
