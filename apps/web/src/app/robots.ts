import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/sitemap";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/", "/admin/", "/settings/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
