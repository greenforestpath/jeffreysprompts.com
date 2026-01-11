export interface HelpCategory {
  slug: string;
  title: string;
  iconName: "BookOpen" | "Sparkles" | "Terminal";
  description: string;
  articles: { slug: string; title: string }[];
}

export const helpCategories: HelpCategory[] = [
  {
    slug: "getting-started",
    title: "Getting Started",
    iconName: "BookOpen",
    description: "Learn the basics and get up and running quickly",
    articles: [
      { slug: "introduction", title: "Introduction to JeffreysPrompts" },
      { slug: "browsing-prompts", title: "Browsing and Finding Prompts" },
      { slug: "using-prompts", title: "Using Prompts with AI Models" },
    ],
  },
  {
    slug: "prompts",
    title: "Prompts & Collections",
    iconName: "Sparkles",
    description: "Managing and organizing your prompts",
    articles: [
      { slug: "copying-prompts", title: "Copying Prompts" },
      { slug: "saving-to-basket", title: "Saving to Your Basket" },
      { slug: "exporting", title: "Exporting as Markdown or Skills" },
    ],
  },
  {
    slug: "cli",
    title: "CLI Tool",
    iconName: "Terminal",
    description: "Using the jfp command-line interface",
    articles: [
      { slug: "installation", title: "Installing the CLI" },
      { slug: "basic-usage", title: "Basic Usage" },
      { slug: "search-commands", title: "Search Commands" },
    ],
  },
];
