'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';
import { Sidebar, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from '@/components/ui/sidebar';
import { LayoutDashboard, Package, LogOut, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

function AdminSidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative">
       <SidebarProvider>
        <Sidebar className="bg-muted/50" collapsible="icon" side="left">
          <SidebarMenu className="flex-1 px-2">
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                <Link href="/admin">
                  <LayoutDashboard />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/products')}>
                <Link href="/admin/products">
                  <Package />
                  Products
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="p-2 border-t border-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onLogout}>
                  <LogOut />
                  Logout
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </Sidebar>
        <SidebarInset>
          {/* This is a placeholder for the main content */}
        </SidebarInset>
      </SidebarProvider>
    </div>
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
        router.replace('/admin/login');
      } else {
        setIsAuth(true);
      }
      setLoading(false);
    }
  }, [router]);

   const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('is_authenticated');
      const event = new Event('storage');
      window.dispatchEvent(event);
      router.push('/admin/login');
    }
  };


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
    <div className="flex min-h-screen bg-muted/40">
        <SidebarProvider>
            <Sidebar className="bg-background border-r" collapsible="icon">
                <SidebarMenu className="flex-1 p-2">
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m15 18-6-6 6-6"/></svg>
                                <span className="absolute left-12">Back to Site</span>
                            </Link>
                         </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={usePathname() === '/admin'}>
                            <Link href="/admin">
                                <LayoutDashboard/>
                                Dashboard
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={usePathname().startsWith('/admin/products')}>
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
                            <SidebarMenuButton onClick={handleLogout}>
                                <LogOut/>
                                Logout
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </div>
            </Sidebar>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </SidebarProvider>
    </div>
  );
}