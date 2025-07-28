
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Image from 'next/image';

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
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 ml-2.5">
          <Image
            src="/logo2.png"
            alt="Carmelo Distribuidora Logo"
            width={150}
            height={40}
            className="object-contain"
          />
        </Link>
        <div className="flex items-center">
          <nav className="flex items-center mr-2.5">
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
                  <User className="mr-2 h-4 w-4" />
                  Login
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
