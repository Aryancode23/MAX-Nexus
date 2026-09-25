import type { MetadataRoute } from "next";
import { getPublicTools } from "@/lib/tools-data";
import { getPublishedGuides } from "@/lib/guides-data";
import { getPublishedDocumentPacks } from "@/lib/document-packs-data";

import { SITE_URL as BASE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["", "/tools", "/guides", "/faq", "/about", "/contact", "/privacy", "/document-packs"].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));

  const [tools, guides, packs] = await Promise.all([getPublicTools(), getPublishedGuides(), getPublishedDocumentPacks()]);

  const toolPages = tools
    .filter((t) => t.status === "active")
    .map((t) => ({ url: `${BASE_URL}/tools/${t.slug}`, lastModified: new Date() }));

  const guidePages = guides.map((g: any) => ({
    url: `${BASE_URL}/guides/${g.slug}`,
    lastModified: g.updated_at ? new Date(g.updated_at) : new Date(),
  }));

  const packPages = packs.map((p: any) => ({
    url: `${BASE_URL}/document-packs/${p.slug}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...toolPages, ...guidePages, ...packPages];
}
