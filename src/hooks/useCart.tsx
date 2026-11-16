
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '@/types';
import { toast } from "@/hooks/use-toast";

interface CartContextProps {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  // Guards the save effect: without it, the first mount writes `[]` to storage
  // before the restore effect's state update lands. React StrictMode double-runs
  // effects in dev, so the second restore reads that `[]` and the cart is wiped.
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems, isHydrated]);

  const addToCart = (product: Product, quantity = 1) => {
    // Read the current cart here rather than inside the updater: React may run
    // an updater during render, and calling toast() from there updates the
    // Toaster while another component renders (React throws for that).
    const existingItem = cartItems.find((item) => item.product.id === product.id);

    if (existingItem) {
      setTimeout(() => toast({
        title: "Updated cart",
        description: `${product.name} quantity updated to ${existingItem.quantity + quantity}`,
      }), 0);

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
      return;
    }

    setTimeout(() => toast({
      title: "Added to cart",
      description: `${product.name} added to your cart`,
    }), 0);

    setCartItems((prevItems) => [...prevItems, { product, quantity }]);
  };

  const removeFromCart = (productId: string) => {
    const itemToRemove = cartItems.find((item) => item.product.id === productId);

    if (itemToRemove) {
      setTimeout(() => toast({
        title: "Removed from cart",
        description: `${itemToRemove.product.name} removed from your cart`,
      }), 0);
    }

    setCartItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setTimeout(() => toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    }), 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextProps => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
