
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingBag, User } from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const Header = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
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
            {user ? (
               <Button asChild variant="secondary">
                <Link href="/admin">
                  <User className="mr-2 h-4 w-4" />
                  Admin
                </Link>
              </Button>
            ) : (
              <Button asChild variant="ghost">
                <Link href="/login">
                  Login Admin
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
