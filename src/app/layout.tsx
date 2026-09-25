import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCategories, getPublicTools } from "@/lib/tools-data";
import { getSettings } from "@/lib/settings-data";
import { getPublishedDocumentPacks } from "@/lib/document-packs-data";
import { SITE_URL } from "@/lib/site";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { AuthProvider } from "@/components/AuthProvider";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: settings.default_seo_title, template: `%s | ${settings.site_name}` },
    description: settings.default_seo_description,
    manifest: "/manifest.webmanifest",
    icons: { icon: "/favicon.png", apple: "/apple-touch-icon.png" },
    openGraph: {
      type: "website",
      siteName: settings.site_name,
      title: settings.default_seo_title,
      description: settings.default_seo_description,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.default_seo_title,
      description: settings.default_seo_description,
    },
  };
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0e" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categories, tools, settings, packs] = await Promise.all([getCategories(), getPublicTools(), getSettings(), getPublishedDocumentPacks()]);
  const liveTools = tools.filter((t) => t.status !== "disabled");
  const packResults = packs.map((p: any) => ({ slug: p.slug, name: p.name, description: p.description || "" }));

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <AuthProvider>
            <ServiceWorkerRegister />
            <Navbar categories={categories} tools={liveTools} siteName={settings.site_name} packs={packResults} />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer categories={categories} settings={settings} />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
