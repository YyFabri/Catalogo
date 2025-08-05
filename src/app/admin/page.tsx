
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
import { PlusCircle, Edit, Trash2, Search, ArrowLeft, LogOut, MoreHorizontal, Check, X, Upload } from 'lucide-react';
import type { Product, Variant } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, doc, deleteDoc, query, orderBy, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const VariantStockManager = ({ product, onStockChange }: { product: Product, onStockChange: (variantId: string, inStock: boolean) => void }) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                     {product.variants.length} variante(s)
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Gestionar Stock</h4>
                        <p className="text-sm text-muted-foreground">
                            Activa o desactiva la disponibilidad de cada variante.
                        </p>
                    </div>
                    <div className="grid gap-2">
                       {product.variants.map(variant => (
                         <div key={variant.id} className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor={`stock-${variant.id}`} className="col-span-2 truncate">{variant.name}</Label>
                            <Switch
                                id={`stock-${variant.id}`}
                                checked={variant.inStock}
                                onCheckedChange={(checked) => onStockChange(variant.id, checked)}
                            />
                         </div>
                       ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}


export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData: Product[] = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsData);
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching products:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los productos.' });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const updateProductField = useCallback(async (productId: string, data: Partial<Product>) => {
    const docRef = doc(db, 'products', productId);
    try {
        await updateDoc(docRef, data);
    } catch(e) {
        console.error("Error updating product:", e);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar el campo.'});
    }
  }, []);

  const handlePriceEdit = (product: Product) => {
    setEditingPriceId(product.id);
    setTempPrice(product.price.toString());
  };
  
  const handlePriceCancel = () => {
    setEditingPriceId(null);
    setTempPrice('');
  };

  const handlePriceSave = async (productId: string) => {
    const price = parseFloat(tempPrice);
    if (!isNaN(price) && price >= 0) {
      await updateProductField(productId, { price });
      toast({ title: 'Precio Actualizado', description: 'El nuevo precio ha sido guardado.'});
      handlePriceCancel();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Por favor, introduce un precio válido.'});
    }
  };

  const handleVariantStockChange = async (productId: string, variantId: string, inStock: boolean) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const updatedVariants = product.variants.map(v => v.id === variantId ? {...v, inStock} : v);
    await updateProductField(productId, { variants: updatedVariants });
  }
  
  const handleProductStockChange = async (productId: string, inStock: boolean) => {
    await updateProductField(productId, { inStock });
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Sesión Cerrada',
        description: 'Has cerrado sesión correctamente.',
      });
      router.push('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cerrar la sesión.',
      });
    }
  };


  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
        await deleteDoc(doc(db, "products", productToDelete.id));
        toast({
            title: 'Producto Eliminado',
            description: `"${productToDelete.name}" ha sido eliminado.`,
        });
    } catch (error) {
        console.error("Error deleting product:", error)
        toast({
            variant: "destructive",
            title: 'Error',
            description: 'No se pudo eliminar el producto.',
        });
    } finally {
        setProductToDelete(null);
    }
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
      <div className="flex min-h-screen w-full flex-col bg-muted/40 p-4 sm:p-6 md:p-8">
            <header className="mb-4 flex items-center justify-center gap-2">
                 <Button asChild variant="outline">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Catálogo
                    </Link>
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                </Button>
            </header>
            <main className="grid flex-1 items-start gap-4">
              <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Gestión de Productos</CardTitle>
                            <CardDescription>Visualiza, añade, edita o elimina tus productos.</CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative w-full sm:w-auto sm:flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Buscar por producto..."
                                    className="w-full pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                             <Button asChild variant="secondary">
                                <Link href="/admin/import">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Importar desde CSV
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href="/admin/products/new">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Añadir Producto
                                </Link>
                            </Button>
                        </div>
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
                          <TableHead className="w-[150px]">Precio</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">
                               {`No se encontraron productos para "${searchTerm}".`}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredProducts.map((product) => {
                            const hasVariants = product.variants && product.variants.length > 0;
                            
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
                                <TableCell>
                                   {editingPriceId === product.id ? (
                                     <div className="flex items-center gap-1">
                                       <Input 
                                          type="number"
                                          value={tempPrice}
                                          onChange={(e) => setTempPrice(e.target.value)}
                                          className="h-9 w-24"
                                          autoFocus
                                          onKeyDown={(e) => e.key === 'Enter' && handlePriceSave(product.id)}
                                       />
                                       <Button variant="ghost" size="icon" onClick={() => handlePriceSave(product.id)}>
                                         <Check className="h-4 w-4 text-green-600" />
                                       </Button>
                                       <Button variant="ghost" size="icon" onClick={handlePriceCancel}>
                                         <X className="h-4 w-4 text-destructive" />
                                       </Button>
                                     </div>
                                   ) : (
                                     <div className="flex items-center gap-2">
                                       <span>${product.price.toFixed(2)}</span>
                                       <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handlePriceEdit(product)}>
                                         <Edit className="h-3 w-3" />
                                       </Button>
                                     </div>
                                   )}
                                </TableCell>
                                <TableCell>
                                  {hasVariants ? (
                                    <VariantStockManager product={product} onStockChange={(variantId, inStock) => handleVariantStockChange(product.id, variantId, inStock)} />
                                  ) : (
                                     <div className="flex items-center space-x-2">
                                        <Switch
                                            id={`stock-${product.id}`}
                                            checked={product.inStock}
                                            onCheckedChange={(checked) => handleProductStockChange(product.id, checked)}
                                        />
                                        <Label htmlFor={`stock-${product.id}`}>{product.inStock ? 'En Stock' : 'Sin Stock'}</Label>
                                    </div>
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
