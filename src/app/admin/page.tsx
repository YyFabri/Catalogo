'use client';

import { useState, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { useProductStore } from '@/hooks/use-product-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, PackageCheck, PackageX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ title, value, icon: Icon, isLoading }: { title: string, value: string | number, icon: React.ElementType, isLoading: boolean }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
           <Skeleton className="h-5 w-3/4" />
           <Skeleton className="h-6 w-6 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-1/2" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

export default function AdminDashboard() {
  const { products, isLoading } = useProductStore();
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    outOfStock: 0,
    totalValue: 0,
  });

  useEffect(() => {
    if (products.length > 0) {
      const totalProducts = products.length;
      const inStock = products.filter(p => p.inStock).length;
      const outOfStock = totalProducts - inStock;
      const totalValue = products.reduce((sum, p) => sum + p.price, 0);

      setStats({ totalProducts, inStock, outOfStock, totalValue });
    }
  }, [products]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts} 
          icon={Package} 
          isLoading={isLoading} 
        />
        <StatCard 
          title="Total Inventory Value" 
          value={`$${stats.totalValue.toFixed(2)}`} 
          icon={DollarSign} 
          isLoading={isLoading} 
        />
        <StatCard 
          title="Items In Stock" 
          value={stats.inStock} 
          icon={PackageCheck} 
          isLoading={isLoading} 
        />
        <StatCard 
          title="Items Out of Stock" 
          value={stats.outOfStock} 
          icon={PackageX} 
          isLoading={isLoading} 
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Your Admin Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Use the navigation on the left to manage your products and view your site.</p>
        </CardContent>
      </Card>
    </div>
  );
}
