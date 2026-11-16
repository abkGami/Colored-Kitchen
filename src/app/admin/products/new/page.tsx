import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata = {
  title: "Add product · Colored Kitchen",
};

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Products
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Add product</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        It reaches the storefront as soon as you save.
      </p>
      <ProductForm mode="create" />
    </div>
  );
}
