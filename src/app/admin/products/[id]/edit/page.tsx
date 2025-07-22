
'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/product-form';
import type { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          toast({
            variant: "destructive",
            title: "Producto no encontrado",
            description: "El producto que intentas editar no existe.",
          });
          router.push('/admin');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar el producto.'});
        router.push('/admin');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, router]);

  const handleUpdateProduct = async (data: Omit<Product, 'id'>) => {
    try {
        const docRef = doc(db, 'products', id);
        await updateDoc(docRef, data);
        toast({
            title: '¡Producto Actualizado!',
            description: `"${data.name}" ha sido guardado.`,
        });
        router.push('/admin');
    } catch (error) {
        console.error("Error updating product: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo actualizar el producto."
        });
    }
  };

  if (isLoading || !product) {
    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
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
    <div className="max-w-2xl mx-auto py-8 px-4">
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
