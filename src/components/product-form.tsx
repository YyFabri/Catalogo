
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { PlusCircle, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Progress } from './ui/progress';
import Image from 'next/image';

const variantSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: 'El nombre de la variante no puede estar vacío.' }),
  inStock: z.boolean(),
});

const formSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  description: z.string().optional(),
  price: z.coerce.number().positive({ message: 'El precio debe ser un número positivo.' }),
  quantity: z.string().optional(),
  imageUrl: z.string().url({ message: 'Por favor, sube una imagen válida.' }),
  category: z.string().min(2, { message: 'La categoría debe tener al menos 2 caracteres.' }),
  inStock: z.boolean().default(false),
  variants: z.array(variantSchema).default([]),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (data: Omit<Product, 'id' | 'imageHint'>) => void;
}

export function ProductForm({ initialData, onSubmit }: ProductFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);


  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      quantity: initialData?.quantity || '',
      imageUrl: initialData?.imageUrl || '',
      category: initialData?.category || '',
      inStock: initialData?.inStock || false,
      variants: initialData?.variants || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants"
  });

  const isEditing = !!initialData;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));

    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setIsUploading(true);
    setUploadProgress(0);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        setIsUploading(false);
        form.setError("imageUrl", { type: "manual", message: "Error al subir la imagen. Inténtalo de nuevo." });
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          form.setValue('imageUrl', downloadURL, { shouldValidate: true });
          setIsUploading(false);
        });
      }
    );
  };


  const handleSubmit = (data: ProductFormValues) => {
    const finalData = {
        ...data,
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
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe tu producto..." {...field} />
                  </FormControl>
                   <FormDescription>
                        Una buena descripción ayuda a los clientes a entender mejor el producto.
                   </FormDescription>
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción de Unidad/Cantidad</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Ej: x24u, 500g, etc." {...field} />
                      </FormControl>
                      <FormDescription>Dejar vacío si se vende por unidad.</FormDescription>
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
                  <FormLabel>Imagen del Producto</FormLabel>
                  <FormControl>
                     <div className="flex items-center gap-4">
                        <label htmlFor="file-upload" className="flex-grow cursor-pointer">
                            <div className="flex items-center justify-center w-full h-32 px-4 transition bg-background border-2 border-dashed rounded-md appearance-none hover:border-primary">
                                <span className="flex items-center space-x-2">
                                <Upload className="w-6 h-6 text-muted-foreground" />
                                <span className="font-medium text-muted-foreground">
                                    {isUploading ? `Subiendo... ${uploadProgress.toFixed(0)}%` : 'Haz clic para subir o arrastra una imagen'}
                                </span>
                                </span>
                            </div>
                            <Input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" disabled={isUploading} />
                         </label>
                         {imagePreview && (
                            <div className="w-32 h-32 flex-shrink-0 relative">
                                <Image src={imagePreview} alt="Vista previa" fill className="rounded-md object-cover" />
                            </div>
                         )}
                     </div>
                  </FormControl>
                  {isUploading && <Progress value={uploadProgress} className="w-full mt-2" />}
                  <FormDescription>Sube una imagen para tu producto (PNG, JPG, WEBP).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
           
              <Card className="bg-muted/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Variantes y Stock</CardTitle>
                      <CardDescription>
                         Añade variantes (color, talle) o gestiona el stock general.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between rounded-lg border bg-background p-4">
                     <div>
                        <FormLabel htmlFor="product-stock">Stock General</FormLabel>
                        <FormDescription>
                            Actívalo si el producto no tiene variantes y está disponible.
                        </FormDescription>
                      </div>
                      <FormField
                          control={form.control}
                          name="inStock"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Switch 
                                  id="product-stock"
                                  checked={field.value} 
                                  onCheckedChange={field.onChange} 
                                  disabled={fields.length > 0}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                  </div>


                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-muted/50 px-2 text-muted-foreground">O</span>
                    </div>
                   </div>

                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                         <div>
                            <h4 className="text-sm font-medium">Variantes Específicas</h4>
                             <p className="text-sm text-muted-foreground">Añade versiones si el producto viene en distintos tipos.</p>
                         </div>
                         <Button type="button" size="sm" onClick={addNewVariant}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Variante
                          </Button>
                      </div>

                      {fields.length === 0 ? (
                        <p className="text-sm text-center text-muted-foreground py-4">No hay variantes.</p>
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
                  </div>
                </CardContent>
              </Card>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={form.formState.isSubmitting || isUploading}>
              {isUploading ? 'Subiendo imagen...' : (form.formState.isSubmitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Producto'))}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
