import { useState } from 'react';
import { Outlet } from '@tanstack/react-router';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export const AppLayout = () => {
  // Desktop: collapsed or expanded sidebar
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile: sheet open or closed
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className='flex h-screen overflow-hidden'>
        {/* Desktop sidebar — hidden on mobile */}
        <div className='hidden md:block'>
          <Sidebar
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed((prev) => !prev)}
          />
        </div>

        {/* Mobile sidebar — Sheet slides in from the left */}
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetContent side='left' className='w-64 p-0'>
            <SheetTitle className='sr-only'>Navigation menu</SheetTitle>
            <Sidebar
              isCollapsed={false}
              onToggle={() => setIsMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Main content area — takes remaining width */}
        <div className='flex flex-1 flex-col overflow-hidden'>
          <Header onMobileMenuToggle={() => setIsMobileOpen(true)} />
          <main className='flex-1 overflow-y-auto p-4 md:p-6'>
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};
