'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { PlusCircle, Trash2 } from 'lucide-react';

const variantSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: 'El nombre de la variante no puede estar vacío.' }),
  inStock: z.boolean(),
});

const formSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  price: z.coerce.number().positive({ message: 'El precio debe ser un número positivo.' }),
  imageUrl: z.string().url({ message: 'Por favor, introduce una URL de imagen válida.' }),
  imageHint: z.string().optional(),
  category: z.string().min(2, { message: 'La categoría debe tener al menos 2 caracteres.' }),
  variants: z.array(variantSchema).default([]),
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
      price: initialData?.price || 0,
      imageUrl: initialData?.imageUrl || 'https://placehold.co/600x400.png',
      category: initialData?.category || '',
      imageHint: initialData?.imageHint || '',
      variants: initialData?.variants || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants"
  });

  const isEditing = !!initialData;

  const handleSubmit = (data: ProductFormValues) => {
    const finalData = {
        ...data,
        imageHint: data.name.split(' ').slice(0, 2).join(' ').toLowerCase(),
        variants: data.variants.map(v => ({
            id: v.id.startsWith('new_') ? `v_${Date.now()}_${Math.random()}` : v.id,
            name: v.name,
            inStock: v.inStock
        }))
    };
    onSubmit(finalData);
  };
  
  const addNewVariant = () => {
    append({ id: `new_${Date.now()}`, name: '', inStock: true });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Actualiza los detalles de tu producto.' : 'Completa el formulario para añadir un nuevo producto a tu catálogo.'}
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
                  <FormLabel>Nombre del Producto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 'Buzo de punto acogedor'" {...field} />
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
                      <FormLabel>Precio ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="29.99" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej: 'Juguetes'" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
             </div>
             <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>URL de la Imagen</FormLabel>
                        <FormControl>
                            <Input placeholder="https://placehold.co/600x400.png" {...field} />
                        </FormControl>
                         <FormDescription>
                            Puedes usar <a href="https://placehold.co" target="_blank" rel="noopener noreferrer" className="underline">placehold.co</a> para imágenes de prueba.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
            />
           
              <Card className="bg-muted/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Variantes del Producto</CardTitle>
                      <CardDescription>Añade y gestiona las versiones disponibles (ej. color, talle). Si no hay variantes, el producto se considerará "Sin Stock".</CardDescription>
                    </div>
                     <Button type="button" size="sm" onClick={addNewVariant}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir
                      </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.length === 0 ? (
                    <p className="text-sm text-center text-muted-foreground py-4">No hay variantes. Haz clic en "Añadir" para crear una.</p>
                  ) : (
                    fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-4 p-3 rounded-md border bg-background">
                         <FormField
                            control={form.control}
                            name={`variants.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="flex-grow">
                                <FormLabel className="sr-only">Nombre de Variante</FormLabel>
                                <FormControl>
                                  <Input placeholder={`Variante ${index + 1} (ej: Rojo)`} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name={`variants.${index}.inStock`}
                            render={({ field }) => (
                              <FormItem className="flex flex-col items-center gap-2">
                                <FormLabel className="text-xs">En Stock</FormLabel>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Producto')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
