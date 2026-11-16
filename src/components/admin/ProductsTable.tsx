"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteProduct } from "@/app/admin/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminProduct, PRODUCT_CATEGORIES } from "@/types";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatUpdated(iso?: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
}

function capitalise(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function ProductsTable({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<AdminProduct | null>(null);
  const [, startTransition] = useTransition();

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery =
        !needle ||
        product.name.toLowerCase().includes(needle) ||
        product.description.toLowerCase().includes(needle) ||
        product.slug.toLowerCase().includes(needle);
      const matchesCategory =
        category === "all" || product.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [products, query, category]);

  const filtering = query.trim().length > 0 || category !== "all";

  function handleDelete() {
    const target = confirming;
    if (!target) return;

    setConfirming(null);
    setPendingDelete(target.id);
    startTransition(async () => {
      const result = await deleteProduct(target.id, target.name);
      setPendingDelete(null);
      if (result.status === "success") {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message ?? "The product was not deleted.");
      }
    });
  }

  if (products.length === 0) {
    return (
      <div className="mt-8 rounded-lg border border-dashed border-border bg-white px-6 py-16 text-center">
        <h2 className="text-lg font-semibold">No products yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Add the first utensil and it appears on the storefront within a minute.
        </p>
        <Button asChild className="mt-6">
          <Link href="/admin/products/new">
            <Plus aria-hidden="true" />
            Add product
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, description, or slug"
            aria-label="Search products"
            className="pl-9"
          />
        </div>
        <div className="sm:w-48">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger aria-label="Filter by category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {PRODUCT_CATEGORIES.map((value) => (
                <SelectItem key={value} value={value}>
                  {capitalise(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mb-3 mt-4 text-sm text-muted-foreground" aria-live="polite">
        {filtering
          ? `${visible.length} of ${products.length} products`
          : `${products.length} ${
              products.length === 1 ? "product" : "products"
            }`}
      </p>

      <div className="overflow-hidden rounded-lg border border-border bg-white">
        <Table>
          <TableCaption className="sr-only">
            Every product in the store catalog
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden sm:table-cell">#</TableHead>
            <TableHead>Product</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden sm:table-cell">Price</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden lg:table-cell">Updated</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((product) => (
                <TableRow
                  key={product.id}
                  className={
                    pendingDelete === product.id
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                >
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {product.uniqueId}
                  </TableCell>
                  <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                          quality={80}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="block truncate font-medium hover:text-pink-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {product.name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {product.slug || "no slug"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden capitalize text-muted-foreground md:table-cell">
                  {product.category}
                </TableCell>
                <TableCell className="hidden font-medium sm:table-cell">
                  {`$${product.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      variant={product.inStock ? "secondary" : "destructive"}
                    >
                      {product.inStock ? "In stock" : "Out of stock"}
                    </Badge>
                    {product.trending ? (
                      <Badge
                        variant="outline"
                        className="border-primary/40 text-primary"
                      >
                        Trending
                      </Badge>
                    ) : null}
                    {product.hasDraft ? (
                      <Link
                        href="/studio"
                        title="An unpublished draft of this product is waiting in Sanity Studio. Publishing it later replaces edits made here."
                        className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <Badge variant="outline">Draft in Studio</Badge>
                      </Link>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {formatUpdated(product.updatedAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="icon">
                      <Link
                        href={`/admin/products/${product.id}`}
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil aria-hidden="true" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${product.name}`}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setConfirming(product)}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {visible.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-medium">Nothing matches those filters</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search, or clear the category.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : null}
      </div>

      <AlertDialog
        open={confirming !== null}
        onOpenChange={(open) => {
          if (!open) setConfirming(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete “{confirming?.name}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes the product from the shop and cannot be undone.
              {confirming?.hasDraft
                ? " Its unpublished Studio draft is deleted too."
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep product</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
