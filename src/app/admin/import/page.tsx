
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, UploadCloud, WandSparkles, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { extractProductsFromPdf } from '@/ai/flows/extract-products-flow';
import type { ExtractProductsOutput } from '@/ai/flows/extract-products-types';
import { db } from '@/lib/firebase';
import { collection, writeBatch, getDocs, query, where, addDoc } from 'firebase/firestore';

type ExtractedProduct = ExtractProductsOutput['products'][0];

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedProduct[] | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setExtractedData(null); // Reset data when new file is selected
    } else {
      toast({
        variant: 'destructive',
        title: 'Archivo no válido',
        description: 'Por favor, selecciona un archivo PDF.',
      });
      setFile(null);
    }
  };

  const readFileAsDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleProcessPdf = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No hay archivo',
        description: 'Por favor, selecciona un archivo PDF para procesar.',
      });
      return;
    }

    setIsProcessing(true);
    setExtractedData(null);
    toast({ title: 'Procesando PDF...', description: 'La IA está analizando el documento. Esto puede tardar un momento.' });

    try {
      const pdfDataUri = await readFileAsDataUri(file);
      const result = await extractProductsFromPdf({ pdfDataUri });
      setExtractedData(result.products);
      toast({
        variant: 'default',
        title: 'Extracción completada',
        description: `Se encontraron ${result.products.length} productos. Revisa y confirma los cambios.`,
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        variant: 'destructive',
        title: 'Error de procesamiento',
        description: 'No se pudo procesar el archivo PDF. Inténtalo de nuevo.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmChanges = async () => {
    if (!extractedData) return;
    
    setIsSaving(true);
    toast({ title: 'Guardando cambios...', description: 'Aplicando actualizaciones al catálogo.' });
    
    try {
        const batch = writeBatch(db);
        const productsRef = collection(db, 'products');
        let newCount = 0;
        let updatedCount = 0;

        for (const product of extractedData) {
            if (product.isNew) {
                // Crear nuevo producto
                const newDocRef = doc(productsRef); // Crea una referencia con un ID único
                batch.set(newDocRef, {
                    name: product.name,
                    price: product.price,
                    quantity: product.quantity || null,
                    category: 'Importado',
                    imageUrl: 'https://placehold.co/400x400.png',
                    imageHint: product.name.split(' ').slice(0, 2).join(' ').toLowerCase(),
                    description: '',
                    inStock: true,
                    variants: []
                });
                newCount++;
            } else {
                // Actualizar producto existente
                const q = query(productsRef, where("name", "==", product.name));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    batch.update(doc.ref, { 
                        price: product.price,
                        quantity: product.quantity || null
                    });
                    updatedCount++;
                });
            }
        }
        
        await batch.commit();

        toast({
            title: '¡Éxito!',
            description: `${newCount} producto(s) creado(s) y ${updatedCount} producto(s) actualizado(s).`
        });
        router.push('/admin');

    } catch (error) {
        console.error("Error saving changes:", error);
        toast({
            variant: 'destructive',
            title: 'Error al guardar',
            description: 'No se pudieron aplicar los cambios. Inténtalo de nuevo.',
        });
        setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Panel
          </Link>
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <WandSparkles className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Importación de Productos con IA</CardTitle>
              <CardDescription>
                Sube un catálogo en PDF y deja que la IA extraiga y actualice tus productos.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 border-2 border-dashed rounded-lg text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">
              Selecciona un archivo PDF
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Arrastra y suelta un archivo aquí, o haz clic para buscar.
            </p>
            <Input
              id="pdf-upload"
              type="file"
              className="sr-only"
              onChange={handleFileChange}
              accept="application/pdf"
              disabled={isProcessing || isSaving}
            />
             <label htmlFor="pdf-upload" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring cursor-pointer">
              {isProcessing ? 'Procesando...' : 'Seleccionar archivo'}
            </label>
            {file && !isProcessing && (
                <div className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                </div>
            )}
          </div>

          <Button
            onClick={handleProcessPdf}
            disabled={!file || isProcessing || isSaving}
            className="w-full"
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <WandSparkles className="mr-2 h-4 w-4" />
            )}
            {isProcessing ? 'Analizando con IA...' : 'Extraer Productos del PDF'}
          </Button>

          {extractedData && (
            <Card>
                <CardHeader>
                    <CardTitle>Resultados de la Extracción</CardTitle>
                    <CardDescription>Revisa los cambios propuestos antes de guardarlos en tu catálogo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3 max-h-72 overflow-y-auto pr-2">
                        {extractedData.map((product, index) => (
                           <li key={index} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                                <div className="flex items-center gap-3">
                                   {product.isNew ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                   ) : (
                                        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                                   )}
                                   <div className="min-w-0">
                                       <p className="font-medium truncate">{product.name}</p>
                                       <p className="text-sm text-muted-foreground">${product.price.toFixed(2)} - {product.isNew ? 'Nuevo producto a crear' : 'Precio a actualizar'}</p>
                                   </div>
                                </div>
                                {product.quantity && <Badge variant="secondary">x{product.quantity}</Badge>}
                           </li>
                        ))}
                    </ul>
                </CardContent>
                <div className="p-6 pt-0 flex justify-end">
                    <Button onClick={handleConfirmChanges} disabled={isSaving || isProcessing}>
                         {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar y Guardar Cambios
                    </Button>
                </div>
            </Card>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
