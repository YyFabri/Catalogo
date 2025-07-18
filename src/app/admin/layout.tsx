
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('is_authenticated') === 'true';
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        setIsAuth(true);
      }
      setLoading(false);
    }
  }, [router]);

  if (loading || !isAuth) {
    return (
      <div className="flex min-h-screen bg-muted/40">
        <div className="flex flex-col items-center justify-center w-full">
            <div className="w-full max-w-4xl p-8 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
