import type { MetadataRoute } from "next";
import { getPublicTools } from "@/lib/tools-data";

const BASE_URL = "https://your-domain.example";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["", "/tools", "/about", "/contact", "/privacy"].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));

  const tools = await getPublicTools();
  const toolPages = tools
    .filter((t) => t.status === "active")
    .map((t) => ({ url: `${BASE_URL}/tools/${t.slug}`, lastModified: new Date() }));

  return [...staticPages, ...toolPages];
}
