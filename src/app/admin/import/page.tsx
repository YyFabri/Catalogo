
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

type ExtractedProduct = {
  name: string;
  price: number;
  description: string;
  isNew: boolean;
};

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedProduct[] | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
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
        description: 'Revisa los productos extraídos y confirma los cambios.',
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

  const handleConfirmChanges = () => {
    // Aquí iría la lógica para guardar los cambios en Firestore.
    // Por ahora, solo mostraremos una notificación y redirigimos.
    toast({
        title: '¡Éxito!',
        description: 'Los cambios han sido aplicados a tu catálogo. (Simulación)'
    });
    router.push('/admin');
  }

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
              disabled={isProcessing}
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
            disabled={!file || isProcessing}
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
                    <ul className="space-y-3">
                        {extractedData.map((product, index) => (
                           <li key={index} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                                <div className="flex items-center gap-3">
                                   {product.isNew ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                   ) : (
                                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                   )}
                                   <div>
                                       <p className="font-medium">{product.name}</p>
                                       <p className="text-sm text-muted-foreground">${product.price.toFixed(2)} - {product.isNew ? 'Nuevo producto a crear' : 'Precio a actualizar'}</p>
                                   </div>
                                </div>
                           </li>
                        ))}
                    </ul>
                </CardContent>
                <div className="p-6 pt-0 flex justify-end">
                    <Button onClick={handleConfirmChanges}>Confirmar y Guardar Cambios</Button>
                </div>
            </Card>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
