
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const Logo = () => (
    <svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
        <g transform="scale(0.5)">
            <path d="M181.87,45.87C170.89,45.87,162,54.76,162,65.73s8.89,20,19.87,20c8.33,0,15.38-5.11,18.33-12.33h-18.11v-15h29.56 c0.22,1.56,0.44,3.11,0.44,4.78c0,23.33-15.67,40-39.22,40s-40-16.67-40-40,16.67-40,40-40c9.11,0,17.44,3.11,24.11,8.44 l-11,11c-4-3.56-9.11-5.67-15.11-5.67Z" fill="#F06292" transform="translate(13 -5) scale(1.1) rotate(-15 165 65)"/>
            <path d="M218.13,124.13c11,0,19.87-8.89,19.87-19.87s-8.89-20-19.87-20c-8.33,0-15.38,5.11-18.33,12.33h18.11v15h-29.56 c-0.22-1.56-0.44-3.11-0.44-4.78c0-23.33,15.67-40,39.22-40s40,16.67,40,40-16.67,40-40,40c-9.11,0-17.44-3.11-24.11-8.44 l11-11c4,3.56,9.11,5.67,15.11,5.67Z" fill="#81D4FA" transform="translate(-13 5) scale(1.1) rotate(-15 235 105)"/>
        </g>
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
