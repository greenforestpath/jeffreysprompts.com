import type { MetadataRoute } from "next";
import { getAllSitemapEntries } from "@/lib/seo/sitemap";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  return getAllSitemapEntries();
}
