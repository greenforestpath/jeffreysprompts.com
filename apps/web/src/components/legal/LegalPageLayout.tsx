import Link from "next/link";
import { FileText, Shield, Users, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableOfContentsItem {
  id: string;
  title: string;
}

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  version?: string;
  icon: "terms" | "privacy" | "guidelines";
  tableOfContents: TableOfContentsItem[];
  children: React.ReactNode;
}

const iconMap = {
  terms: FileText,
  privacy: Shield,
  guidelines: Users,
};

const legalPages = [
  { href: "/terms", label: "Terms of Service", icon: FileText },
  { href: "/privacy", label: "Privacy Policy", icon: Shield },
  { href: "/guidelines", label: "Community Guidelines", icon: Users },
];

export function LegalPageLayout({
  title,
  lastUpdated,
  version = "1.0",
  icon,
  tableOfContents,
  children,
}: LegalPageLayoutProps) {
  const Icon = iconMap[icon];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 print:bg-white">
      {/* Header */}
      <div className="border-b border-border/60 bg-white dark:bg-zinc-900 print:border-b-2 print:border-black">
        <div className="container-wide py-8 sm:py-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 print:hidden">
                <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                {title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
              <span>Last updated: {lastUpdated}</span>
              <span className="hidden sm:inline">•</span>
              <span>Version {version}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-wide py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[250px_1fr] xl:grid-cols-[280px_1fr]">
          {/* Sidebar - Table of Contents */}
          <aside className="hidden lg:block print:hidden">
            <div className="sticky top-20 space-y-6">
              {/* Table of Contents */}
              <nav className="space-y-2">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                  On this page
                </h2>
                <ul className="space-y-1">
                  {tableOfContents.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white py-1 transition-colors"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Other Legal Pages */}
              <div className="border-t border-border/60 pt-6">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                  Legal documents
                </h2>
                <ul className="space-y-1">
                  {legalPages.map((page) => {
                    const PageIcon = page.icon;
                    return (
                      <li key={page.href}>
                        <Link
                          href={page.href}
                          className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white py-1.5 transition-colors"
                        >
                          <PageIcon className="h-4 w-4" />
                          {page.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-w-0">
            {/* Mobile TOC */}
            <details className="lg:hidden mb-8 bg-white dark:bg-zinc-900 rounded-lg border border-border/60 print:hidden">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-zinc-900 dark:text-white">
                Table of Contents
                <ChevronRight className="h-4 w-4 transition-transform [details[open]>summary>&]:rotate-90" />
              </summary>
              <nav className="px-4 pb-4">
                <ul className="space-y-1">
                  {tableOfContents.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white py-1"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>

            {/* Page Content */}
            <article className={cn(
              "prose prose-zinc dark:prose-invert max-w-none",
              "prose-headings:scroll-mt-20",
              "prose-h2:text-xl prose-h2:font-semibold prose-h2:border-b prose-h2:border-border/40 prose-h2:pb-2 prose-h2:mb-4",
              "prose-h3:text-lg prose-h3:font-medium",
              "prose-p:text-zinc-600 dark:prose-p:text-zinc-400",
              "prose-li:text-zinc-600 dark:prose-li:text-zinc-400",
              "prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline",
              "print:prose-headings:break-after-avoid print:prose-p:orphans-3 print:prose-p:widows-3"
            )}>
              {children}
            </article>

            {/* Footer */}
            <footer className="mt-12 pt-8 border-t border-border/60 print:hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                <p>
                  Questions? Contact us at{" "}
                  <a
                    href="mailto:legal@jeffreysprompts.com"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    legal@jeffreysprompts.com
                  </a>
                </p>
                <button
                  onClick={() => window.print()}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Print this page
                </button>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
