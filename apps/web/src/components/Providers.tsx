"use client";

import { ThemeProvider } from "./theme-provider";
import { SpotlightSearch } from "./SpotlightSearch";
import { ToastProvider, Toaster } from "@/components/ui/toast";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system">
      <ToastProvider>
        {children}
        <SpotlightSearch />
        <Toaster />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default Providers;
