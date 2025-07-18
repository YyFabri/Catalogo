'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Product, Variant } from '@/lib/types';
import Header from '@/components/header';
import { useProductStore } from '@/hooks/use-product-store';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, X } from 'lucide-react';

const ProductCardSkeleton = () => (
  <Card className="flex flex-col overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
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
  const someInStock = hasVariants && product.variants.some(v => v.inStock);

  return (
    <Card 
      className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl animate-in fade-in zoom-in-95 cursor-pointer"
      onClick={() => hasVariants && onSelect(product)}
    >
      <div className="relative h-48 w-full">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          data-ai-hint={product.imageHint}
        />
        <Badge variant="secondary" className="absolute top-2 right-2">{product.category}</Badge>
      </div>
      <CardHeader>
        <CardTitle className="text-xl">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow">
        <div className="flex-grow">
          <p className="text-muted-foreground text-2xl font-semibold mb-4">${product.price.toFixed(2)}</p>
        </div>
        {hasVariants ? (
           <Badge variant={someInStock ? 'default' : 'destructive'} className="self-start bg-accent text-accent-foreground">
              {someInStock ? 'Ver variantes' : 'Sin Stock'}
            </Badge>
        ) : (
          <Badge variant='destructive' className="self-start">
            Sin Stock
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

const VariantModal = ({ product, onClose }: { product: Product, onClose: () => void }) => {
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
                <p className="text-xl font-semibold text-primary mb-4">${product.price.toFixed(2)}</p>
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Variantes disponibles:</h3>
                    <ul className="space-y-2">
                        {product.variants.map(variant => (
                            <li key={variant.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                               <span>{variant.name}</span>
                               <Badge variant={variant.inStock ? 'default' : 'destructive'} className="bg-accent text-accent-foreground">
                                 {variant.inStock ? 'En Stock' : 'Sin Stock'}
                               </Badge>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};


export default function Home() {
  const { products, isLoading } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl font-headline">
              Nuestro Catálogo
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
              Explora nuestra cuidada colección de productos de alta calidad.
            </p>
          </div>

          <div className="mb-12 max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por producto o categoría..."
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
                    <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
                ))}
            </div>
          ) : (
             <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">No se encontraron productos para "{searchTerm}".</p>
            </div>
          )}
        </section>
      </main>
      <footer className="bg-muted py-6">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Catálogo StockWise. Todos los derechos reservados.</p>
        </div>
      </footer>
      {selectedProduct && <VariantModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}
