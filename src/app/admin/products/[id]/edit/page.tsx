'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/product-form';
import type { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

const STORAGE_KEY = 'stockwise_products';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const productToEdit = products.find((p) => p.id === params.id);
    if (productToEdit) {
      setProduct(productToEdit);
    } else {
      toast({
        variant: "destructive",
        title: "Product not found",
        description: "The product you are trying to edit does not exist.",
      });
      router.push('/admin');
    }
    setLoading(false);
  }, [params.id, router]);

  const handleUpdateProduct = (data: Omit<Product, 'id'>) => {
    const updatedProduct: Product = {
      ...data,
      id: params.id,
    };
    
    const storedProducts: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updatedProducts = storedProducts.map((p) =>
      p.id === params.id ? updatedProduct : p
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
    
    toast({
      title: 'Product Updated!',
      description: `"${updatedProduct.name}" has been saved.`,
    });
    router.push('/admin');
  };

  if (loading) {
    return (
        <div>
           <div className="mb-4">
                <Skeleton className="h-9 w-40" />
           </div>
           <Card className="w-full">
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                     <div className="flex gap-4">
                        <div className="space-y-2 w-full">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2 w-full">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-32" />
                </CardFooter>
            </Card>
        </div>
    );
  }

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
      <ProductForm onSubmit={handleUpdateProduct} initialData={product} />
    </div>
  );
}
