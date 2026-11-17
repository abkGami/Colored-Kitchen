import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { UserButton } from "@clerk/nextjs";
import BrandWordmark from "@/components/BrandWordmark";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "No access · Colored Kitchen",
  robots: { index: false, follow: false },
};

export default function NoAccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/40 px-4 py-12">
      <Link
        href="/"
        className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
      >
        <BrandWordmark className="brand-wordmark--header" />
      </Link>

      <div className="w-full max-w-md rounded-lg border border-border bg-white p-6">
        <h1 className="text-2xl font-bold">This account is not an admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You are signed in, but this account has not been given the{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">admin</code>{" "}
          role, so it cannot change the catalog.
        </p>

        <h2 className="mt-5 text-sm font-semibold">Giving an account access</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          In the Clerk dashboard, open Users, pick the account, and set its
          public metadata to:
        </p>
        <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-muted p-3 text-xs">
          {`{ "role": "admin" }`}
        </pre>
        <p className="mt-3 text-sm text-muted-foreground">
          Or from the project directory with the Clerk CLI:
        </p>
        <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-muted p-3 text-xs">
          {`npx -y clerk@latest api /users/<user_id>/metadata \\
  -X PATCH -d '{"public_metadata":{"role":"admin"}}' --yes`}
        </pre>
        <p className="mt-2 text-xs text-muted-foreground">
          Reload this page afterwards. The role is read from the user record on
          every request, so no sign-out is needed.
        </p>

        <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
          <Suspense>
            <UserButton appearance={clerkAppearance} />
          </Suspense>
          <div className="text-sm">
            <p className="font-medium">Signed in</p>
            <p className="text-xs text-muted-foreground">
              Use the avatar menu to switch accounts or sign out.
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          ← Back to the storefront
        </Link>
      </div>
    </main>
  );
}
