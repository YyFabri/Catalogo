'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

const initialProducts: Product[] = [
    { id: '1', name: 'Plush Teddy Bear', description: 'A cuddly companion for all ages.', price: 19.99, imageUrl: 'https://placehold.co/600x400.png', inStock: true, imageHint: 'teddy bear' },
    { id: '2', name: 'Ceramic Coffee Mug', description: 'A beautiful mug for your morning coffee.', price: 12.50, imageUrl: 'https://placehold.co/600x400.png', inStock: true, imageHint: 'coffee mug' },
    { id: '3', name: 'Leather-bound Journal', description: 'For your thoughts, dreams, and plans.', price: 25.00, imageUrl: 'https://placehold.co/600x400.png', inStock: false, imageHint: 'leather journal' },
];

const STORAGE_KEY = 'stockwise_products';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    const storedProducts = localStorage.getItem(STORAGE_KEY);
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
      setProducts(initialProducts);
    }
  }, []);

  const handleDelete = () => {
    if (!productToDelete) return;

    const updatedProducts = products.filter((p) => p.id !== productToDelete.id);
    setProducts(updatedProducts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
    setProductToDelete(null);

    toast({
      title: 'Product Deleted',
      description: `"${productToDelete.name}" has been removed.`,
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>View, add, edit, or delete your products.</CardDescription>
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
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
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
                        <Badge variant={product.inStock ? 'outline' : 'destructive'} className={product.inStock ? "border-green-600 text-green-600" : ""}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setProductToDelete(product)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              "{productToDelete?.name}".
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
}
