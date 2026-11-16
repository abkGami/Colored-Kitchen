import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Accounts · Colored Kitchen",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/40 px-4 py-12">
      <Link
        href="/"
        className="text-2xl font-bold text-pink-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Colored Kitchen
      </Link>

      {/* Public sign-up is disabled on the Clerk instance (sign_up_mode:
          "restricted"). This route exists so Clerk's "Sign up" link has
          somewhere honest to land instead of a dead form or a 404. */}
      <div className="w-full max-w-md rounded-lg border border-border bg-white p-6">
        <h1 className="text-2xl font-bold">Accounts are created by the owner</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          There is no public sign-up for this shop. If you need access to the
          admin, ask the store owner to create your account and give it the{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">admin</code>{" "}
          role.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/sign-in">Go to sign in</Link>
        </Button>
        <Link
          href="/"
          className="mt-4 inline-block text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          ← Back to the storefront
        </Link>
      </div>
    </main>
  );
}
