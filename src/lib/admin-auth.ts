import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * The single definition of "admin" in this app: a signed-in Clerk user whose
 * public metadata carries `role: "admin"`. Kept in one place so a page, a
 * Server Action, and a future route handler can never disagree about it.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const user = await currentUser();
  return user?.publicMetadata?.role === "admin";
}

/**
 * Page-level gate. Signed-out visitors go to sign-in; signed-in visitors
 * without the admin role get a real page explaining why, not a 404.
 */
export async function requireAdmin(): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!(await isCurrentUserAdmin())) redirect("/no-access");
}
