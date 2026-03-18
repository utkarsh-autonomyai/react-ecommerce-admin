import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client';
import { applyTheme, useThemeStore } from '@/stores/theme.store';
import { OfflineBanner } from '@/components/shared/offline-banner';
import { useEffect } from 'react';

const RootLayout = () => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    applyTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (useThemeStore.getState().theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <OfflineBanner />
      <Outlet />
      <Toaster richColors closeButton position='bottom-right' />
      <ReactQueryDevtools initialIsOpen={false} />
      <TanStackRouterDevtools position='bottom-right' />
    </QueryClientProvider>
  );
};

export const Route = createRootRoute({
  component: RootLayout,
});
