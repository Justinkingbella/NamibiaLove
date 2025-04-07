import React, { ReactNode } from 'react';
import Header from './header';
import BottomNav from './bottom-nav';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
  hideBottomNav?: boolean;
  requireAuth?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  hideHeader = false,
  hideBottomNav = false,
  requireAuth = true,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-white shadow-lg">
      {!hideHeader && <Header />}
      <main className={`pb-20 ${hideBottomNav ? 'pb-0' : ''}`}>{children}</main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
};

export default MainLayout;
