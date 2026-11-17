import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Italiana } from "next/font/google";
import "./../index.css";
import { Providers } from "./providers";

const italiana = Italiana({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-brand-face",
});

export const metadata: Metadata = {
  title: "Colored Kitchen",
  description: "Premium kitchen utensils for every cooking need.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={italiana.variable}>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin=""
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClerkProvider>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}