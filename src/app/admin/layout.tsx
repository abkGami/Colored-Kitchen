import Link from "next/link";
import { Suspense } from "react";
import { UserButton } from "@clerk/nextjs";

import AdminNav from "@/components/admin/AdminNav";
import BrandWordmark from "@/components/BrandWordmark";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin-auth";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata = {
  title: "Admin · Colored Kitchen",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white shadow-xl rounded-b-2xl">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
              >
                <BrandWordmark className="brand-wordmark--header" />
              </Link>
              <Badge variant="secondary">Admin</Badge>
            </div>
            <div className="flex items-center gap-3" id="admin-header-actions">
              <Suspense>
                <UserButton appearance={clerkAppearance} />
              </Suspense>
            </div>
          </div>
          <div className="mt-2 border-t border-border pt-1 sm:mt-3">
            <AdminNav />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 pb-20">{children}</main>
    </div>
  );
}
