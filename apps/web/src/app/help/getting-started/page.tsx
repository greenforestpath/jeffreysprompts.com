"use client";

import { HelpLayout, ArticleCard } from "@/components/help/HelpLayout";
import { helpCategories } from "@/lib/help-categories";
import { BookOpen } from "lucide-react";

export default function GettingStartedPage() {
  const category = helpCategories.find((c) => c.slug === "getting-started");

  return (
    <HelpLayout
      title="Getting Started"
      description="Learn the basics and get up and running quickly"
      category="getting-started"
    >
      <div className="grid gap-4">
        {category?.articles.map((article) => (
          <ArticleCard
            key={article.slug}
            href={`/help/getting-started/${article.slug}`}
            title={article.title}
            icon={BookOpen}
          />
        ))}
      </div>
    </HelpLayout>
  );
}
