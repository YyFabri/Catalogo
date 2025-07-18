
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LogOut, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';

function AdminHeader({ onLogout }: { onLogout: () => void }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 mr-6 font-bold text-lg">
          <ShoppingBag className="h-6 w-6 text-primary" style={{color: 'hsl(var(--accent))'}} />
          <span className="font-bold">StockWise</span>
          <span className="text-sm font-light text-muted-foreground ml-2">Admin Panel</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
           <Button asChild variant="secondary" size="sm">
              <Link href="/">
                Back to Site
              </Link>
            </Button>
           <Button onClick={onLogout} variant="outline" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}


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

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('is_authenticated');
      window.dispatchEvent(new Event('storage'));
      router.push('/login');
    }
  };

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
    <div className="min-h-screen bg-muted/40">
      <AdminHeader onLogout={handleLogout} />
      <main className="p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
