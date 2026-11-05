import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNavigation } from './BottomNavigation';
import { ToastContainer } from '../common/Toast';
import { IngredientFormModal } from '../inventory/IngredientFormModal';
import { ScanGroceriesModal } from '../inventory/ScanGroceriesModal';

export const AppLayout: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-cream-100 text-ink-primary font-sans">
      {/* Desktop Sidebar */}
      <Sidebar onOpenScanModal={() => setIsScanModalOpen(true)} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <Header
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenScanModal={() => setIsScanModalOpen(true)}
        />

        <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />

      {/* Global Notifications */}
      <ToastContainer />

      {/* Global Modals */}
      <IngredientFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <ScanGroceriesModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />
    </div>
  );
};
