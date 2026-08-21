import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppDrawer } from '../components/AppDrawer';

export function MainLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <AppDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <main className="flex-1 flex flex-col">
          <Outlet context={{ openDrawer: () => setIsDrawerOpen(true) }} />
        </main>
      </div>
    </div>
  );
}
