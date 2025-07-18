
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/product-form';
import type { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductStore } from '@/hooks/use-product-store';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const { products, updateProduct, isLoading } = useProductStore();
  const product = products.find((p) => p.id === id);
  
  useEffect(() => {
    if (!isLoading && !product) {
       toast({
        variant: "destructive",
        title: "Producto no encontrado",
        description: "El producto que intentas editar no existe.",
      });
      router.push('/admin');
    }
  }, [isLoading, product, router])

  const handleUpdateProduct = (data: Omit<Product, 'id'>) => {
    updateProduct(id, data);
    
    toast({
      title: '¡Producto Actualizado!',
      description: `"${data.name}" ha sido guardado.`,
    });
    router.push('/admin');
  };

  if (isLoading || !product) {
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
    <div className="max-w-2xl mx-auto">
        <div className="mb-4">
         <Button asChild variant="outline" size="sm">
            <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Productos
            </Link>
         </Button>
      </div>
      <ProductForm onSubmit={handleUpdateProduct} initialData={product} />
    </div>
  );
}
