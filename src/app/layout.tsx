import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { siteData } from "@/data/site-content";
import "./globals.css";

const uiFont = Manrope({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: siteData.site.name,
  description: "Photography portfolio of Michael Yuan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${uiFont.variable} ${displayFont.variable}`}>
        <div className="site-shell">
          <Sidebar />
          <main className="content-shell">{children}</main>
        </div>
      </body>
    </html>
  );
}
