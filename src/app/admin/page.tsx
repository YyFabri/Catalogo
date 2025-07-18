
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import type { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { useProductStore } from '@/hooks/use-product-store';
import { useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminProductsPage() {
  const { products, deleteProduct, isLoading } = useProductStore();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleDelete = () => {
    if (!productToDelete) return;
    deleteProduct(productToDelete.id);
    toast({
      title: 'Producto Eliminado',
      description: `"${productToDelete.name}" ha sido eliminado.`,
    });
    setProductToDelete(null);
  };

  const TableSkeleton = () => (
     <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
         <div key={i} className="flex items-center space-x-4 p-4 border rounded-md">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
         </div>
      ))}
    </div>
  )

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle>Gestión de Productos</CardTitle>
                      <CardDescription>Visualiza, añade, edita o elimina tus productos.</CardDescription>
                    </div>
                     <div className="w-full max-w-md">
                        <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar por producto o categoría..."
                            className="w-full pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        </div>
                     </div>
                    <Button asChild>
                      <Link href="/admin/products/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Producto
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    {isLoading ? (
                       <div className="p-4"><TableSkeleton /></div>
                    ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Imagen</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">
                               {products.length === 0 ? "No se encontraron productos." : `No se encontraron productos para "${searchTerm}".`}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredProducts.map((product) => {
                            const hasVariants = product.variants && product.variants.length > 0;
                            const someInStock = hasVariants && product.variants.some(v => v.inStock);

                            return (
                              <TableRow key={product.id}>
                                <TableCell>
                                  <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    width={40}
                                    height={40}
                                    className="rounded-md object-cover"
                                    data-ai-hint={product.imageHint}
                                  />
                                </TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary">{product.category}</Badge>
                                </TableCell>
                                <TableCell>${product.price.toFixed(2)}</TableCell>
                                <TableCell>
                                  {hasVariants ? (
                                    <Badge variant={someInStock ? 'default' : 'destructive'} className="bg-blue-100 text-blue-800">
                                      {product.variants.length} variantes
                                    </Badge>
                                  ) : (
                                     <Badge variant="destructive">Sin Stock</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button asChild variant="ghost" size="icon">
                                    <Link href={`/admin/products/${product.id}/edit`}>
                                      <Edit className="h-4 w-4" />
                                      <span className="sr-only">Editar</span>
                                    </Link>
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => setProductToDelete(product)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">Eliminar</span>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                    )}
                  </div>
                </CardContent>
              </Card>
            </main>
        </div>
      </div>


      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el producto
              "{productToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
