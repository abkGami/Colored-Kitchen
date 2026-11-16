"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  {
    href: "/admin",
    label: "Products",
    isActive: (pathname: string) =>
      pathname === "/admin" || pathname.startsWith("/admin/products"),
  },
  {
    href: "/admin/home",
    label: "Home page",
    isActive: (pathname: string) => pathname.startsWith("/admin/home"),
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin sections"
      className="flex items-center gap-1 overflow-x-auto"
    >
      {links.map((link) => {
        const active = link.isActive(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              active && "border-pink-500 text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
      <a
        href="/studio"
        className="ml-1 inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Sanity Studio
        <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
      </a>
    </nav>
  );
}
