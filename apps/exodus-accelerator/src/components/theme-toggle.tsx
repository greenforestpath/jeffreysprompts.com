"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "relative size-10 rounded-full",
        "flex items-center justify-center",
        "text-muted-foreground hover:text-foreground",
        "hover:bg-muted/60 transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      <Sun
        className={cn(
          "size-5 transition-all duration-300",
          resolvedTheme === "dark" ? "scale-0 rotate-90" : "scale-100 rotate-0"
        )}
      />
      <Moon
        className={cn(
          "absolute size-5 transition-all duration-300",
          resolvedTheme === "dark" ? "scale-100 rotate-0" : "scale-0 -rotate-90"
        )}
      />
    </button>
  );
}
