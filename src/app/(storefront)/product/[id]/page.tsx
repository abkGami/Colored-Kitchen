import { notFound } from "next/navigation";
import { getProduct } from "@/lib/sanity";
import ProductDetailShell from "@/components/ProductDetailShell";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return notFound();
  }

  return <ProductDetailShell product={product} />;
}
