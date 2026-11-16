import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminProduct } from "@/lib/sanity";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const product = await getAdminProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Products
        </Link>
        <a
          href={`/product/${product.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          View on storefront
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
        </a>
      </div>
      <h1 className="mt-3 text-2xl font-bold">{product.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Editing an existing product. Save to publish the changes.
      </p>
      {product.hasDraft ? (
        <p className="mt-4 max-w-2xl rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
          An unpublished draft of this product is waiting in Sanity Studio.
          Saving here updates the live version; publishing that draft later
          replaces these edits.
        </p>
      ) : null}
      <ProductForm mode="edit" product={product} />
    </div>
  );
}
