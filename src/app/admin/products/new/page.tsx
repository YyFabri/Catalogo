
'use client';

import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/product-form';
import type { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useProductStore } from '@/hooks/use-product-store';

export default function NewProductPage() {
  const router = useRouter();
  const { addProduct } = useProductStore();

  const handleCreateProduct = (data: Omit<Product, 'id' | 'imageHint'>) => {
    addProduct(data);
    
    toast({
      title: 'Product Created!',
      description: `"${data.name}" has been added to the catalog.`,
    });
    router.push('/admin');
  };

  return (
    <div className="max-w-2xl mx-auto">
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
