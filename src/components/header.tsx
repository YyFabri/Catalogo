
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const Logo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-8 w-8">
      <path fill="#F06292" d="M128 128V32.3C128 32.3 84.4 35.8 62 80c-22.4 44.2 18 96 18 96h48Z"/>
      <path fill="#81D4FA" d="M128 128v95.7c0 0 43.6 3.5 66-40.7s-18-96-18-96h-48Z"/>
    </svg>
)

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
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 mr-6">
           <Logo/>
          <span className="font-bold text-xl text-foreground">Carmelo Distribuidora</span>
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
