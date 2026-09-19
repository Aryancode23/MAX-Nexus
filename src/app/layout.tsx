import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCategories, getPublicTools } from "@/lib/tools-data";

export const metadata: Metadata = {
  title: {
    default: "MAX Nexus — Everyday Digital Work, Made Simple",
    template: "%s | MAX Nexus",
  },
  description:
    "Free online tools for photos, PDFs, documents, signatures, forms and everyday productivity — all in one place.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categories, tools] = await Promise.all([getCategories(), getPublicTools()]);
  const liveTools = tools.filter((t) => t.status !== "disabled");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider>
          <Navbar categories={categories} tools={liveTools} />
          <main className="flex-1">{children}</main>
          <Footer categories={categories} />
        </ThemeProvider>
      </body>
    </html>
  );
}
