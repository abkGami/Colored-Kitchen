import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { ChevronLeft, Trash, ShoppingCart } from "lucide-react";

const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
  } = useCart();

  const handlePurchaseAll = () => {
    // Format the WhatsApp message with all cart items
    const itemsList = cartItems
      .map(
        (item) =>
          `${item.product.name} (Qty: ${item.quantity}) - $${(
            item.product.price * item.quantity
          ).toFixed(2)}`
      )
      .join("\n");

    const totalPrice = getTotalPrice().toFixed(0);

    const message = encodeURIComponent(
      `Hello, I'd like to purchase the following items:\n\n${itemsList}\n\nTotal: $${totalPrice}`
    );

    // Open WhatsApp with the pre-filled message
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mb-6">
          <ShoppingCart className="h-16 w-16 mx-auto text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-8">
          Looks like you haven't added any products to your cart yet.
        </p>
        <Link to="/products">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Link
            to="/products"
            className="inline-flex items-center text-gray-600 hover:text-pink-500"
          >
            <ChevronLeft className="h-5 w-5" />
            Continue Shopping
          </Link>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearCart}
          className="flex items-center gap-1"
        >
          <Trash className="h-4 w-4" /> Clear Cart
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="mb-8">
        <div className="hidden md:grid grid-cols-12 gap-4 py-3 border-b border-gray-200 font-medium">
          <div className="col-span-6">Product</div>
          <div className="col-span-2 text-center">Price</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-2 text-right">Subtotal</div>
        </div>

        {cartItems.map((item) => (
          <div
            key={item.product.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 py-6 border-b border-gray-200"
          >
            <div className="col-span-6 flex gap-4">
              <div className="w-20 h-20 rounded overflow-hidden border border-gray-200">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">
                  <Link
                    to={`/product/${item.product.id}`}
                    className="hover:text-pink-500"
                  >
                    {item.product.name}
                  </Link>
                </h3>
                <span className="text-sm text-gray-500 capitalize">
                  {item.product.category}
                </span>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-sm text-red-500 flex items-center gap-1 mt-2"
                >
                  <Trash className="h-3 w-3" /> Remove
                </button>
              </div>
            </div>

            <div className="col-span-2 flex md:justify-center items-center">
              <span className="md:hidden font-medium mr-2">Price:</span>
              <span className="text-pink-500">
                ${item.product.price.toFixed(2)}
              </span>
            </div>

            <div className="col-span-2 flex md:justify-center items-center">
              <span className="md:hidden font-medium mr-2">Quantity:</span>
              <div className="flex border border-gray-300 rounded overflow-hidden">
                <button
                  onClick={() =>
                    updateQuantity(item.product.id, item.quantity - 1)
                  }
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200"
                >
                  -
                </button>
                <span className="px-3 py-1 flex items-center justify-center min-w-[32px]">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.product.id, item.quantity + 1)
                  }
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>

            <div className="col-span-2 flex md:justify-end items-center">
              <span className="md:hidden font-medium mr-2">Subtotal:</span>
              <span className="font-medium">
                ${(item.product.price * item.quantity).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:justify-end">
        <div className="md:w-1/3 bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">${getTotalPrice().toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-4 font-bold text-lg">
            <span>Total:</span>
            <span>${getTotalPrice().toFixed(2)}</span>
          </div>
          <Button onClick={handlePurchaseAll} className="w-full">
            Purchase via WhatsApp
          </Button>
          <p className="text-xs text-gray-500 mt-4 text-center">
            You'll be redirected to WhatsApp to complete your purchase
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
