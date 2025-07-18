'use client';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import Header from '@/components/header';
import { useProductStore } from '@/hooks/use-product-store';
import { Skeleton } from '@/components/ui/skeleton';


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


const ProductCard = ({ product }: { product: Product }) => (
  <Card className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl animate-in fade-in zoom-in-95">
    <div className="relative h-48 w-full">
      <Image
        src={product.imageUrl}
        alt={product.name}
        fill
        className="object-cover"
        data-ai-hint={product.imageHint}
      />
    </div>
    <CardHeader>
      <CardTitle className="text-xl">{product.name}</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col flex-grow">
      <div className="flex-grow">
         <p className="text-muted-foreground text-2xl font-semibold mb-4">${product.price.toFixed(2)}</p>
      </div>
      <Badge variant={product.inStock ? 'default' : 'destructive'} className="self-start bg-accent text-accent-foreground">
        {product.inStock ? 'In Stock' : 'Out of Stock'}
      </Badge>
    </CardContent>
  </Card>
);

export default function Home() {
  const { products, isLoading } = useProductStore();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl font-headline">
              Our Catalog
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
              Browse our curated collection of high-quality products.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </section>
      </main>
      <footer className="bg-muted py-6">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} StockWise Catalog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
