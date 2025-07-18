export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
  imageHint?: string;
}
