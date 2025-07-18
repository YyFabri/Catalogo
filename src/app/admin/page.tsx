'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';
import { useProductStore } from '@/hooks/use-product-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// Helper to group products by category
const groupByCategory = (products: Product[]) => {
  return products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);
};

const EditableProductRow = ({ product }: { product: Product }) => {
  const { updateProduct, deleteProduct } = useProductStore.getState();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleFieldChange = (field: keyof Product, value: string | number | boolean) => {
    updateProduct(product.id, { ...product, [field]: value });
  };
  
  const handleDebouncedSave = (field: keyof Product, value: string | number) => {
     updateProduct(product.id, { ...product, [field]: value });
     toast({
        title: 'Product Updated',
        description: `"${product.name}" has been updated.`,
     });
  }

  const handleDelete = () => {
    if (!productToDelete) return;
    deleteProduct(productToDelete.id);
    toast({
      title: 'Product Deleted',
      description: `"${productToDelete.name}" has been removed.`,
    });
    setProductToDelete(null);
  };

  return (
    <>
      <div className="grid grid-cols-6 gap-4 items-center p-4 border-b">
        <Input
          defaultValue={product.name}
          onBlur={(e) => handleDebouncedSave('name', e.target.value)}
          className="col-span-2"
        />
        <Input
          type="number"
          defaultValue={product.price}
           onBlur={(e) => handleDebouncedSave('price', parseFloat(e.target.value) || 0)}
          className="col-span-1"
        />
        <div className="col-span-2">
            <Select
                value={product.inStock ? 'inStock' : 'outOfStock'}
                onValueChange={(value) => handleFieldChange('inStock', value === 'inStock')}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="inStock">In Stock</SelectItem>
                    <SelectItem value="outOfStock">Out of Stock</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="col-span-1 flex justify-end">
          <Button variant="ghost" size="icon" onClick={() => setProductToDelete(product)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product "{productToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default function AdminDashboard() {
  const { products, isLoading } = useProductStore();
  const groupedProducts = groupByCategory(products);
  const categories = Object.keys(groupedProducts);

  if (isLoading) {
      return (
         <div className="space-y-4">
             <Skeleton className="h-10 w-1/4" />
             <Card>
                 <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-5 w-1/2" />
                 </CardHeader>
                 <CardContent>
                    <Skeleton className="h-12 w-full mt-4" />
                    <Skeleton className="h-12 w-full mt-2" />
                    <Skeleton className="h-12 w-full mt-2" />
                 </CardContent>
             </Card>
         </div>
      )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
             <div>
                <CardTitle>Your Products</CardTitle>
                <CardDescription>View, edit, and manage your product catalog below.</CardDescription>
             </div>
             <Button asChild>
                <Link href="/admin/products/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Product
                </Link>
             </Button>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
             <p className="text-center text-muted-foreground py-8">No products yet. Add your first one!</p>
          ) : (
          <Accordion type="multiple" defaultValue={categories} className="w-full">
            {categories.map((category) => (
              <AccordionItem value={category} key={category}>
                <AccordionTrigger className="text-lg font-medium capitalize">
                  <div className="flex items-center gap-2">
                    {category}
                    <Badge variant="outline">{groupedProducts[category].length}</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-6 gap-4 items-center p-4 font-semibold text-muted-foreground">
                    <div className="col-span-2">Name</div>
                    <div className="col-span-1">Price</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>
                   {groupedProducts[category].map((product) => (
                    <EditableProductRow key={product.id} product={product} />
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}