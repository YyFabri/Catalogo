
'use client';

import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/product-form';
import type { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function NewProductPage() {
  const router = useRouter();

  const handleCreateProduct = async (data: Omit<Product, 'id'>) => {
    try {
      await addDoc(collection(db, 'products'), {
          ...data,
          imageHint: data.name.split(' ').slice(0, 2).join(' ').toLowerCase(),
      });
      toast({
        title: '¡Producto Creado!',
        description: `"${data.name}" ha sido añadido al catálogo.`,
      });
      router.push('/admin');
    } catch (e) {
      console.error("Error adding document: ", e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el producto."
      });
    }
  };

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
      <ProductForm onSubmit={handleCreateProduct} />
    </div>
  );
}
