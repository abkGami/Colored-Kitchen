import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="storefront-main flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
