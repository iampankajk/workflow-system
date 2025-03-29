import React from 'react';
import { DashboardNavbar } from '@/components/DashboardNavbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from 'sonner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <DashboardNavbar />
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Toaster position="top-right" />
      </div>
    </ProtectedRoute>
  );
}
