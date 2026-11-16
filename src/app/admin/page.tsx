import Link from "next/link";
import { Plus } from "lucide-react";

import ProductsTable from "@/components/admin/ProductsTable";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminProducts } from "@/lib/sanity";
import { AdminProduct } from "@/types";

// Staff must always see the catalog as it is, not a cached snapshot.
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  // Checked here as well as in the layout: a layout does not re-run on client
  // navigation between admin pages, so the gate has to sit with the data.
  await requireAdmin();

  let products: AdminProduct[] = [];
  let loadError = false;

  try {
    products = await getAdminProducts();
  } catch (error) {
    console.error("Failed to load products for admin:", error);
    loadError = true;
  }

  const outOfStock = products.filter((product) => !product.inStock).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} in the catalog
            {outOfStock > 0 ? `, ${outOfStock} out of stock` : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus aria-hidden="true" />
            Add product
          </Link>
        </Button>
      </div>

      {loadError ? (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
        >
          <p className="font-medium text-destructive">Could not load products</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sanity did not answer. Check the connection and the project ID in
            the environment, then reload this page.
          </p>
        </div>
      ) : (
        <ProductsTable products={products} />
      )}
    </div>
  );
}
