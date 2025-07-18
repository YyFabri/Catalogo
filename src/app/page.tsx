import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import Header from '@/components/header';

const products: Product[] = [
  {
    id: '1',
    name: 'Pink Dream Sweater',
    description: 'A cozy and stylish sweater made from 100% cashmere.',
    price: 59.99,
    imageUrl: 'https://placehold.co/600x400.png',
    inStock: true,
    imageHint: 'pink sweater',
  },
  {
    id: '2',
    name: 'Sky Blue Jeans',
    description: 'Perfect fit denim that is both comfortable and durable.',
    price: 79.99,
    imageUrl: 'https://placehold.co/600x400.png',
    inStock: true,
    imageHint: 'blue jeans',
  },
  {
    id: '3',
    name: 'Classic White Sneakers',
    description: 'Versatile sneakers that go with any outfit.',
    price: 89.99,
    imageUrl: 'https://placehold.co/600x400.png',
    inStock: false,
    imageHint: 'white sneakers',
  },
  {
    id: '4',
    name: 'Minimalist Wristwatch',
    description: 'An elegant timepiece with a leather strap.',
    price: 149.99,
    imageUrl: 'https://placehold.co/600x400.png',
    inStock: true,
    imageHint: 'wristwatch',
  },
  {
    id: '5',
    name: 'Soft Cotton Scarf',
    description: 'A light and soft scarf for a touch of elegance.',
    price: 29.99,
    imageUrl: 'https://placehold.co/600x400.png',
    inStock: true,
    imageHint: 'cotton scarf',
  },
  {
    id: '6',
    name: 'Leather Backpack',
    description: 'A durable and spacious backpack for daily use.',
    price: 120.0,
    imageUrl: 'https://placehold.co/600x400.png',
    inStock: true,
    imageHint: 'leather backpack',
  },
  {
    id: '7',
    name: 'Gradient Sunglasses',
    description: 'Stylish sunglasses with UV protection.',
    price: 45.5,
    imageUrl: 'https://placehold.co/600x400.png',
    inStock: false,
    imageHint: 'sunglasses',
  },
  {
    id: '8',
    name: 'Wool Blend Beanie',
    description: 'Keep warm with this soft wool blend beanie.',
    price: 22.0,
    imageUrl: 'https://placehold.co/600x400.png',
    inStock: true,
    imageHint: 'beanie hat',
  },
];

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
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
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
