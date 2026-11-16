import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Sign in · Colored Kitchen",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/40 px-4 py-12">
      <div className="text-center">
        <Link
          href="/"
          className="text-2xl font-bold text-pink-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Colored Kitchen
        </Link>
        <p className="mt-2 text-sm text-muted-foreground">
          Staff access. Shoppers never need an account.
        </p>
      </div>
      <Suspense>
        <SignIn fallbackRedirectUrl="/admin" appearance={clerkAppearance} />
      </Suspense>
    </main>
  );
}
