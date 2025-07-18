"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingBag, LogOut } from 'lucide-react';

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(localStorage.getItem('is_authenticated') === 'true');
    };
    
    checkAuth();

    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('is_authenticated');
    setIsAuthenticated(false);
    
    const event = new Event('storage');
    window.dispatchEvent(event);

    router.push('/admin/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 mr-6 font-bold text-lg">
          <ShoppingBag className="h-6 w-6 text-primary" style={{color: 'hsl(var(--accent))'}} />
          StockWise
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {isAuthenticated ? (
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button asChild variant={pathname.startsWith('/admin') ? "secondary" : "ghost"}>
                <Link href="/admin/login">
                  Admin Panel
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
