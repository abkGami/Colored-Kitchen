import Link from "next/link";

import BrandWordmark from "@/components/BrandWordmark";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted/40 px-4 text-center">
      <Link
        href="/"
        className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
      >
        <BrandWordmark className="brand-wordmark--header" />
      </Link>

      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          That page is not part of the catalog.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to the shop</Link>
        </Button>
      </div>
    </main>
  );
};

export default NotFound;
