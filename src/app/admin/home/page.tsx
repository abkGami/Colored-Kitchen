import HomePageForm from "@/components/admin/HomePageForm";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminHomePage } from "@/lib/sanity";
import { AdminHomePage } from "@/types";

export const metadata = {
  title: "Home page · Colored Kitchen",
};

export const dynamic = "force-dynamic";

export default async function AdminHomePageRoute() {
  await requireAdmin();

  let homePage: AdminHomePage | null = null;
  let loadError = false;

  try {
    homePage = await getAdminHomePage();
  } catch (error) {
    console.error("Failed to load the home page for admin:", error);
    loadError = true;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Home page</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        The hero every shopper lands on. Changes go live on the next visit
        after you save.
      </p>

      {loadError ? (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
        >
          <p className="font-medium text-destructive">
            Could not load the home page
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sanity did not answer. Check the connection and the project ID in
            the environment, then reload this page.
          </p>
        </div>
      ) : (
        <HomePageForm homePage={homePage} />
      )}
    </div>
  );
}
