
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, Package, LogOut, Home } from 'lucide-react';
import Link from 'next/link';
import AdminHeader from '@/components/admin-header';

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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
                <Skeleton className="h-12 w-1/4" />
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar className="bg-background border-r hidden md:flex" collapsible="icon">
            <SidebarMenu className="flex-1 p-2">
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Back to Site">
                        <Link href="/">
                            <Home />
                            <span className="sr-only">Back to Site</span>
                        </Link>
                     </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin'} tooltip="Dashboard">
                        <Link href="/admin">
                            <LayoutDashboard/>
                            Dashboard
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/products')} tooltip="Products">
                        <Link href="/admin/products">
                            <Package/>
                            Products
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            <div className="p-2 mt-auto border-t">
                <SidebarMenu>
                     <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                            <LogOut/>
                            Logout
                        </Button>
                    </SidebarMenuItem>
                </SidebarMenu>
            </div>
        </Sidebar>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <AdminHeader onLogout={handleLogout} />
          <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
