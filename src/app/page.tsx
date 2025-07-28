
'use client';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Product } from '@/lib/types';
import Header from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';


const ProductCardSkeleton = () => (
  <Card className="flex flex-col overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
       <Skeleton className="h-4 w-full mt-2" />
       <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="flex flex-col flex-grow">
      <div className="flex-grow">
        <Skeleton className="h-8 w-1/4 mb-4" />
      </div>
      <Skeleton className="h-6 w-20" />
    </CardContent>
  </Card>
);

const ProductCard = ({ product, onSelect }: { product: Product; onSelect: (product: Product) => void; }) => {
  const hasVariants = product.variants && product.variants.length > 0;
  let inStock = false;
  
  if (hasVariants) {
    inStock = product.variants.some(v => v.inStock);
  } else {
    inStock = !!product.inStock;
  }

  return (
    <Card 
      className={`flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl animate-in fade-in zoom-in-95 ${inStock ? 'cursor-pointer' : 'cursor-default opacity-70'}`}
      onClick={() => inStock && onSelect(product)}
    >
      <div className="relative h-48 w-full">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          data-ai-hint={product.imageHint}
        />
        <Badge variant="secondary" className="absolute top-2 left-2">{product.category}</Badge>
        {product.quantity && (
          <div className="absolute top-2 right-2 flex items-center justify-center w-12 h-12 bg-gray-700/80 rounded-full">
            <span className="text-white font-bold text-sm">x{product.quantity}u</span>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-xl">{product.name}</CardTitle>
        {product.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{product.description}</p>}
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <div className="flex-grow">
          <p className="text-muted-foreground text-2xl font-semibold mb-4 text-foreground">${product.price.toFixed(2)}</p>
        </div>
        <Badge className={`self-start ${inStock ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}>
          {hasVariants && inStock ? 'Ver variantes' : inStock ? 'En Stock' : 'Sin Stock'}
        </Badge>
      </CardContent>
    </Card>
  );
};

const VariantModal = ({ product, onClose }: { product: Product, onClose: () => void }) => {
  const hasVariants = product.variants && product.variants.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-md m-4 p-6 relative animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="h-5 w-5" />
          <span className="sr-only">Cerrar</span>
        </button>
        <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative w-full h-48 sm:w-40 sm:h-auto flex-shrink-0 rounded-lg overflow-hidden">
                 <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    data-ai-hint={product.imageHint}
                />
            </div>
            <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
                <p className="text-xl font-semibold text-foreground mb-4">${product.price.toFixed(2)}</p>
                 {product.description && <p className="text-sm text-muted-foreground mb-4">{product.description}</p>}
                
                {hasVariants ? (
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Variantes disponibles:</h3>
                        <ul className="space-y-2">
                            {product.variants.filter(v => v.inStock).map(variant => (
                                <li key={variant.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                  <span>{variant.name}</span>
                                  <Badge className="bg-green-600 text-white">
                                    En Stock
                                  </Badge>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                   <Badge className="bg-green-600 text-white">En Stock</Badge>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};


export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectProduct = (product: Product) => {
    const hasVariants = product.variants && product.variants.length > 0;
    if (hasVariants) {
        setSelectedProduct(product);
    } else if (product.inStock) {
        setSelectedProduct(product);
    }
  }

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative container mx-auto px-4 py-8 md:py-12 overflow-hidden">
           <div
            aria-hidden="true"
            className="absolute -top-40 -left-12 h-96 w-96 rounded-full bg-primary/10 blur-3xl -z-10"
            />
            <div
            aria-hidden="true"
            className="absolute -bottom-40 -right-12 h-96 w-96 rounded-full bg-accent/10 blur-3xl -z-10"
            />
          <div className="relative text-center mb-8 flex flex-col items-center">
            <Image 
              src="/logo.png" 
              alt="Carmelo Distribuidora Logo"
              width={400} 
              height={150}
              className="object-contain"
              priority
            />
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
              Explora nuestra cuidada colección de productos de alta calidad.
            </p>
          </div>

          <div className="mb-12 max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por producto, categoría o descripción..."
                className="w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
             </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onSelect={handleSelectProduct} />
                ))}
            </div>
          ) : (
             <div className="text-center py-16">
                 <p className="text-xl text-muted-foreground">
                    {products.length === 0 ? "No hay productos en el catálogo todavía." : `No se encontraron productos para "${searchTerm}".`}
                </p>
            </div>
          )}
        </section>
      </main>
      <footer className="bg-muted py-6">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Carmelo Distribuidora. Todos los derechos reservados.</p>
        </div>
      </footer>
      {selectedProduct && <VariantModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}
