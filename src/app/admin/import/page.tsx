
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

type CsvProduct = Omit<Product, 'id' | 'imageUrl' | 'variants' | 'inStock'>;
type ProductToImport = CsvProduct & { status: 'new' | 'update'; existingId?: string; };

export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [productsToImport, setProductsToImport] = useState<ProductToImport[]>([]);
    const [error, setError] = useState('');
    const { toast } = useToast();
    const router = useRouter();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setError('');
            setProductsToImport([]);
        } else {
            setError('Por favor, selecciona un archivo .csv válido.');
            setFile(null);
        }
    };

    const parseCSV = async () => {
        if (!file) {
            setError('Primero selecciona un archivo.');
            return;
        }
        setIsParsing(true);
        setError('');

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            const headers = lines[0].split(',').map(h => h.trim());
            const requiredHeaders = ['name', 'price', 'category'];

            if (!requiredHeaders.every(h => headers.includes(h))) {
                setError(`El archivo CSV debe contener las columnas: ${requiredHeaders.join(', ')}.`);
                setIsParsing(false);
                return;
            }

            const productsData: CsvProduct[] = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if(values.length < headers.length) continue; // Skip empty or malformed lines

                const productObj: any = {};
                headers.forEach((header, index) => {
                    productObj[header] = values[index] || '';
                });

                productsData.push({
                    name: productObj.name,
                    price: parseFloat(productObj.price) || 0,
                    category: productObj.category,
                    description: productObj.description || '',
                    unitDescription: productObj.unitDescription || '',
                    weight: productObj.weight || '',
                });
            }
            
            await checkExistingProducts(productsData);
            setIsParsing(false);
        };

        reader.readAsText(file);
    };

    const checkExistingProducts = async (products: CsvProduct[]) => {
        const productNames = products.map(p => p.name);
        const existingProducts: (Product & {id: string})[] = [];
        const CHUNK_SIZE = 30; // Firestore 'in' query limit

        if (productNames.length > 0) {
            for (let i = 0; i < productNames.length; i += CHUNK_SIZE) {
                const chunk = productNames.slice(i, i + CHUNK_SIZE);
                const q = query(collection(db, 'products'), where('name', 'in', chunk));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach(doc => {
                    existingProducts.push({ id: doc.id, ...doc.data() } as Product & {id: string});
                });
            }
        }
        
        const productsWithStatus = products.map(p => {
            const existing = existingProducts.find(ep => ep.name.toLowerCase() === p.name.toLowerCase());
            if (existing) {
                return { ...p, status: 'update', existingId: existing.id } as ProductToImport;
            }
            return { ...p, status: 'new' } as ProductToImport;
        });

        setProductsToImport(productsWithStatus);
    };

    const handleImport = async () => {
        if (productsToImport.length === 0) return;
        
        setIsImporting(true);
        const batch = writeBatch(db);
        let newCount = 0;
        let updateCount = 0;

        productsToImport.forEach(product => {
            const productData = {
                name: product.name,
                price: Number(product.price),
                category: product.category,
                description: product.description || '',
                unitDescription: product.unitDescription || '',
                weight: product.weight || '',
                imageUrl: `https://placehold.co/600x400.png`,
                imageHint: product.name.split(' ').slice(0, 2).join(' ').toLowerCase(),
                variants: [],
                inStock: true,
            };

            if (product.status === 'new') {
                const newProductRef = doc(collection(db, 'products'));
                batch.set(newProductRef, productData);
                newCount++;
            } else if (product.status === 'update' && product.existingId) {
                const productRef = doc(db, 'products', product.existingId);
                // We only update the price for existing products as planned
                batch.update(productRef, { price: productData.price });
                updateCount++;
            }
        });
        
        try {
            await batch.commit();
            
            if(newCount > 0 || updateCount > 0){
                toast({
                    title: '¡Importación Exitosa!',
                    description: `Se crearon ${newCount} productos y se actualizaron ${updateCount}.`,
                });
            } else {
                 toast({ title: 'Sin cambios', description: `No se necesitaron crear o actualizar productos.`});
            }
            router.push('/admin');

        } catch (e) {
             console.error("Error committing batch: ", e);
             toast({ variant: 'destructive', title: 'Error', description: 'Hubo un problema al importar los productos.'});
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-4">
                <Button asChild variant="outline" size="sm">
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Productos
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Importar Productos desde CSV</CardTitle>
                    <CardDescription>Sube un archivo CSV para añadir o actualizar productos masivamente. El archivo debe contener las columnas requeridas: `name`, `price`, `category`. Opcionales: `description`, `unitDescription`, `weight`.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-2 border-dashed rounded-lg">
                        <div className="flex-grow">
                             <label htmlFor="csv-upload" className="font-medium">Seleccionar archivo CSV</label>
                             <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} className="mt-2" />
                             {file && <p className="text-sm text-muted-foreground mt-2 flex items-center"><FileText className="h-4 w-4 mr-2"/> {file.name}</p>}
                             {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                        </div>
                        <Button onClick={parseCSV} disabled={!file || isParsing}>
                            {isParsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4" />}
                            Analizar Archivo
                        </Button>
                    </div>

                    {productsToImport.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium mb-2">Vista Previa de la Importación</h3>
                            <p className="text-sm text-muted-foreground mb-4">Se encontraron {productsToImport.length} productos en el archivo. Revisa los cambios antes de confirmar.</p>
                            <div className="max-h-64 overflow-y-auto rounded-md border">
                                <ul className="divide-y">
                                    {productsToImport.map((product, index) => (
                                        <li key={index} className="p-3 flex items-center justify-between">
                                           <div className="flex items-center gap-3">
                                                {product.status === 'new' ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                                                <div>
                                                    <p className="font-medium">{product.name} <Badge variant={product.status === 'new' ? 'default' : 'secondary'}>{product.status === 'new' ? 'Nuevo' : 'Actualizar'}</Badge></p>
                                                    <p className="text-sm text-muted-foreground">${Number(product.price).toFixed(2)} - {product.category}</p>
                                                </div>
                                           </div>
                                            <div className="flex items-center gap-2">
                                                {product.unitDescription && <Badge variant="outline">{product.unitDescription}</Badge>}
                                                {product.weight && <Badge variant="outline">{product.weight}</Badge>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleImport} disabled={productsToImport.length === 0 || isImporting}>
                         {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4" />}
                        Confirmar y Guardar Cambios
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
