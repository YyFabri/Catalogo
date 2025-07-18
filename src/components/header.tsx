
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingBag, User } from 'lucide-react';

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      // Ensure this runs only on the client
      if (typeof window !== 'undefined') {
        const authStatus = localStorage.getItem('is_authenticated') === 'true';
        setIsAuthenticated(authStatus);
      }
    };
    
    checkAuth();

    // Listen for storage changes to update auth status across tabs
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [pathname]); // Rerun on pathname change if needed, though storage event is more robust
  
  if (pathname.startsWith('/admin') || pathname.startsWith('/login')) {
      return null;
  }

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
               <Button asChild variant="secondary">
                <Link href="/admin">
                  <User className="mr-2 h-4 w-4" />
                  Admin
                </Link>
              </Button>
            ) : (
              <Button asChild variant="ghost">
                <Link href="/login">
                  Admin Login
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
