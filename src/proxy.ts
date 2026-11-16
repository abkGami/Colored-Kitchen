import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Next.js 16 renamed the middleware convention to `proxy`. Protection is NOT
// declared here: each admin page and Server Action calls requireAdmin() /
// isCurrentUserAdmin(), which keeps the check next to the data it guards.
//
// Public sign-up is disabled: any request to /sign-up is redirected to
// /sign-in. Accounts are created only by the owner in the Clerk dashboard,
// where the user's public metadata is set to { role: "admin" }.
export default clerkMiddleware((auth, request) => {
  if (request.nextUrl.pathname.startsWith("/sign-up")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Always run for Clerk-specific frontend API routes
    "/__clerk/(.*)",
  ],
};
