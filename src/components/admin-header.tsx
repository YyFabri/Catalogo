
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft, Home, LayoutDashboard, Package, LogOut } from 'lucide-react';
import { Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

interface AdminHeaderProps {
  onLogout: () => void;
}

const AdminHeader = ({ onLogout }: AdminHeaderProps) => {
    const pathname = usePathname();

    const navItems = [
        { href: '/', icon: Home, label: 'Back to Site', srLabel: 'Back to Site' },
        { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', srLabel: 'Dashboard' },
        { href: '/admin/products', icon: Package, label: 'Products', srLabel: 'Products' },
    ];

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline">
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs p-0">
                    <Sidebar className="bg-background border-r flex">
                        <SidebarMenu className="flex-1 p-2">
                            {navItems.map(item => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                                        <Link href={item.href}>
                                            <item.icon />
                                            {item.label}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                        <div className="p-2 mt-auto border-t">
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton onClick={onLogout} tooltip="Logout">
                                        <LogOut/>
                                        Logout
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </div>
                    </Sidebar>
                </SheetContent>
            </Sheet>
        </header>
    );
}

export default AdminHeader;
