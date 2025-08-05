export interface Variant {
  id: string;
  name: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  quantity?: string;
  imageHint?: string;
  description?: string;
  inStock?: boolean;
  variants: Variant[];
}
