
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft, Home, LayoutDashboard, Package, LogOut } from 'lucide-react';

interface AdminHeaderProps {
  onLogout: () => void;
}

const AdminHeader = ({ onLogout }: AdminHeaderProps) => {
    const pathname = usePathname();

    const navItems = [
        { href: '/', icon: Home, label: 'Back to Site' },
        { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/admin/products', icon: Package, label: 'Products' },
    ];

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline" className="sm:hidden">
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs">
                    <nav className="grid gap-6 text-lg font-medium">
                         {navItems.map(item => (
                             <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-4 px-2.5 ${pathname === item.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                         ))}
                         <button
                            onClick={onLogout}
                            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                         >
                             <LogOut className="h-5 w-5" />
                             Logout
                         </button>
                    </nav>
                </SheetContent>
            </Sheet>
        </header>
    );
}

export default AdminHeader;
