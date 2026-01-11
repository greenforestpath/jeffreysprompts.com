"use client";

import { motion } from "framer-motion";
import { Search, Copy, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Browse & Search",
    description: "Explore our curated library of battle-tested prompts. Use fuzzy search to find exactly what you need in seconds.",
    color: "indigo",
  },
  {
    number: "02",
    icon: Copy,
    title: "Copy or Export",
    description: "One-click copy to clipboard, or export as a Claude Code SKILL.md file for permanent installation.",
    color: "violet",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Supercharge Your Workflow",
    description: "Use your prompts with Claude, GPT, or any AI assistant. Track what works and iterate.",
    color: "purple",
  },
];

const colorClasses = {
  indigo: {
    bg: "bg-indigo-100 dark:bg-indigo-950/50",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-800/50",
    gradient: "from-indigo-500 to-indigo-600",
  },
  violet: {
    bg: "bg-violet-100 dark:bg-violet-950/50",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-800/50",
    gradient: "from-violet-500 to-violet-600",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-950/50",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800/50",
    gradient: "from-purple-500 to-purple-600",
  },
};

export function HowItWorksSection() {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.03)_1px,transparent_0)] bg-[size:40px_40px]" />
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
          <span className="inline-block px-3 py-1 text-sm font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 rounded-full mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            From search to ship in seconds
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            No signup required. Find the perfect prompt and start using it immediately.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line (desktop only) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-200 via-violet-200 to-purple-200 dark:from-indigo-900 dark:via-violet-900 dark:to-purple-900 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const colors = colorClasses[step.color as keyof typeof colorClasses];
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative z-10"
                >
                  <div className="relative bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-shadow duration-300">
                    {/* Step number badge */}
                    <div className={`absolute -top-4 left-8 px-3 py-1 rounded-full bg-gradient-to-r ${colors.gradient} text-white text-sm font-bold shadow-lg`}>
                      Step {step.number}
                    </div>

                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl ${colors.bg} ${colors.border} border flex items-center justify-center mb-6 mt-2`}>
                      <step.icon className={`w-8 h-8 ${colors.text}`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
