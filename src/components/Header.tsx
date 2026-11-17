'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";

import BrandWordmark from "@/components/BrandWordmark";
import { useCart } from "@/hooks/useCart";

export default function Header() {
  const pathname = usePathname();
  const { getTotalItems } = useCart();
  const itemCount = getTotalItems();
  const shopActive =
    pathname === "/products" || pathname.startsWith("/product/");
  const cartActive = pathname === "/cart";

  return (
    <header className="store-header">
      <div className="container mx-auto px-4">
        <div className="store-header__inner">
          <nav aria-label="Shop" className="store-header__nav">
            <Link
              href="/products"
              className="store-header__link"
              aria-current={shopActive ? "page" : undefined}
            >
              Shop
            </Link>
          </nav>

          <Link
            href="/"
            className="store-header__brand"
            aria-label="Colored Kitchen, home"
          >
            <BrandWordmark className="brand-wordmark--header" />
          </Link>

          <div className="store-header__nav store-header__nav--end">
            <Link
              href="/cart"
              className="store-header__cart"
              aria-label={
                itemCount === 1 ? "Cart, 1 item" : `Cart, ${itemCount} items`
              }
              aria-current={cartActive ? "page" : undefined}
            >
              <ShoppingCart
                className="store-header__cart-icon"
                aria-hidden="true"
              />
              <span className="store-header__cart-label">Cart</span>
              {itemCount > 0 && (
                <span className="store-header__count" aria-hidden="true">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
