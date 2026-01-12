"use client";

import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  Package,
  Wand2,
  FolderOpen,
  Terminal,
  BarChart3,
  Search,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Package,
    title: "Prompt Packs",
    description: "Curated bundles of battle-tested prompts for specific workflows. Get started faster.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Wand2,
    title: "Claude Code Skills",
    description: "Export prompts as SKILL.md files. One-click installation into your Claude Code setup.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: ArrowLeftRight,
    title: "Swap Meet",
    description: "Community marketplace for sharing and discovering prompts from other power users.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: FolderOpen,
    title: "Collections",
    description: "Organize your favorite prompts into custom collections. Access them anywhere.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: Terminal,
    title: "CLI Integration",
    description: "Access prompts from your terminal. Perfect for agents and automated workflows.",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track which prompts work best. Understand your usage patterns and optimize.",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "BM25-powered fuzzy search. Find the right prompt in milliseconds, not minutes.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Zap,
    title: "Zero Config",
    description: "No setup required. Browse, copy, and use immediately. It just works.",
    gradient: "from-yellow-500 to-orange-500",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export function FeaturesSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-3 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-full mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Everything you need for prompt engineering
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            A complete toolkit for discovering, organizing, and deploying prompts across your AI workflow.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative"
            >
              <div className="relative h-full p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:shadow-lg hover:shadow-neutral-200/50 dark:hover:shadow-neutral-900/50">
                {/* Icon */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    "bg-gradient-to-br",
                    feature.gradient,
                    "shadow-lg"
                  )}
                  style={{
                    boxShadow: `0 4px 14px -2px ${feature.gradient.includes("violet") ? "rgba(139, 92, 246, 0.3)" : "rgba(99, 102, 241, 0.2)"}`,
                  }}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover gradient border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
