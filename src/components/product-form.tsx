'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long.' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid image URL.' }),
  inStock: z.boolean(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (data: Omit<Product, 'id'>) => void;
}

export function ProductForm({ initialData, onSubmit }: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      imageUrl: initialData?.imageUrl || '',
      inStock: initialData?.inStock || true,
    },
  });

  const isEditing = !!initialData;

  const handleSubmit = (data: ProductFormValues) => {
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Update the details of your product.' : 'Fill out the form to add a new product to your catalog.'}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 'Cozy Knit Sweater'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the product..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="29.99" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://placehold.co/600x400.png" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
             </div>
            <FormField
              control={form.control}
              name="inStock"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div>
                        <FormLabel>In Stock</FormLabel>
                        <FormDescription>Is this product currently available for purchase?</FormDescription>
                    </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {isEditing ? 'Save Changes' : 'Create Product'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
