"use client";

import { ThemeProvider } from "./theme-provider";
import { SpotlightSearch } from "./SpotlightSearch";
import { BasketProvider } from "@/contexts/basket-context";
import { ToastProvider, Toaster } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useServiceWorker } from "@/hooks/useServiceWorker";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Register service worker for PWA offline support
  useServiceWorker();

  return (
    <ThemeProvider defaultTheme="system">
      <ToastProvider>
        <BasketProvider>
          <ErrorBoundary variant="default">
            {children}
          </ErrorBoundary>
          <ErrorBoundary variant="minimal" fallback={null}>
            <SpotlightSearch />
          </ErrorBoundary>
          <Toaster />
        </BasketProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default Providers;
