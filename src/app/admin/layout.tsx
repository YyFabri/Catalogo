'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('is_authenticated') === 'true';
      if (!isAuthenticated) {
        router.replace('/admin/login');
      } else {
        setIsAuth(true);
      }
      setLoading(false);
    }
  }, [router]);

  if (loading || !isAuth) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="container mx-auto p-8">
           <div className="space-y-4">
            <Skeleton className="h-12 w-1/4" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <Header />
      <main className="flex-1 container mx-auto py-8">
        {children}
      </main>
    </div>
  );
}
