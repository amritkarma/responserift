import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { headers } from "next/headers";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ResponseRift • Instant JSON API for Developers",
    template: "%s | ResponseRift",
  },
  description:
    "ResponseRift is an open-source Instant JSON API platform: 12+ resources with full CRUD, filtering, pagination — built with Next.js. Perfect for prototyping and learning.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-csp-nonce") ?? undefined;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
        (function() {
          try {
            var theme = localStorage.getItem('theme');
            if(theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            }
          } catch(e) {}
        })();
      `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Link href="#main-content" className="sr-only focus:not-sr-only">
          Skip to main content
        </Link>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
