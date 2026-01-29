/**
 * Internationalization Proxy (Next.js 16+)
 *
 * Handles locale detection and routing for multi-language support.
 * - Detects user's preferred language from browser/cookie
 * - Redirects to locale-prefixed URLs
 * - Sets locale cookie for persistence
 *
 * Note: In Next.js 16, middleware.ts was renamed to proxy.ts
 */

import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware({
  // Supported locales
  locales,

  // Default locale when no locale is detected
  defaultLocale,

  // Don't redirect default locale (en) to /en prefix
  // This keeps English URLs clean (/ instead of /en/)
  localePrefix: "as-needed",

  // Detect locale from browser Accept-Language header
  localeDetection: true,
});

export async function proxy(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for:
  // - API routes (/api/...)
  // - Static files (/_next/static/..., /favicon.ico, etc.)
  // - Monitoring routes (/monitoring)
  // - Robots and sitemap
  matcher: [
    // Match all pathnames except those starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico, sitemap.xml, robots.txt
    // - monitoring (Sentry tunnel)
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|monitoring|icons|manifest.json).*)",
  ],
};
