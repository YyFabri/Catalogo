'use client';

import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/product-form';
import type { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const STORAGE_KEY = 'stockwise_products';

export default function NewProductPage() {
  const router = useRouter();

  const handleCreateProduct = (data: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...data,
      id: Date.now().toString(),
    };

    const storedProducts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updatedProducts = [...storedProducts, newProduct];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
    
    toast({
      title: 'Product Created!',
      description: `"${newProduct.name}" has been added to the catalog.`,
    });
    router.push('/admin');
  };

  return (
    <div>
       <div className="mb-4">
         <Button asChild variant="outline" size="sm">
            <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
            </Link>
         </Button>
      </div>
      <ProductForm onSubmit={handleCreateProduct} />
    </div>
  );
}
