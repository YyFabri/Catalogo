
'use client';

import { create } from 'zustand';
import { useEffect, useState as useReactState } from 'react';
import type { Product } from '@/lib/types';

const initialProducts: Product[] = [
    { id: '1', name: 'Plush Teddy Bear', description: 'A cuddly companion for all ages.', price: 19.99, imageUrl: 'https://placehold.co/600x400.png', inStock: true, imageHint: 'teddy bear' },
    { id: '2', name: 'Ceramic Coffee Mug', description: 'A beautiful mug for your morning coffee.', price: 12.50, imageUrl: 'https://placehold.co/600x400.png', inStock: true, imageHint: 'coffee mug' },
    { id: '3', name: 'Leather-bound Journal', description: 'For your thoughts, dreams, and plans.', price: 25.00, imageUrl: 'https://placehold.co/600x400.png', inStock: false, imageHint: 'leather journal' },
];

const STORAGE_KEY = 'stockwise_products';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'imageHint'>) => void;
  updateProduct: (id: string, product: Omit<Product, 'id' | 'imageHint'>) => void;
  deleteProduct: (id: string) => void;
  setProducts: (products: Product[]) => void;
  setLoading: (isLoading: boolean) => void;
}

const useProductStoreBase = create<ProductState>((set, get) => ({
  products: [],
  isLoading: true,
  setProducts: (products) => set({ products, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  addProduct: (productData) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      imageHint: productData.name.split(' ').slice(0, 2).join(' ').toLowerCase(),
    };
    const updatedProducts = [...get().products, newProduct];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
    }
    set({ products: updatedProducts });
  },
  updateProduct: (id, productData) => {
    const updatedProducts = get().products.map((p) =>
      p.id === id ? { ...p, ...productData, id, imageHint: productData.name.split(' ').slice(0, 2).join(' ').toLowerCase() } : p
    );
     if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
    }
    set({ products: updatedProducts });
  },
  deleteProduct: (id) => {
    const updatedProducts = get().products.filter((p) => p.id !== id);
     if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
    }
    set({ products: updatedProducts });
  },
}));

// A wrapper hook to handle hydration from localStorage
export const useProductStore = () => {
  const store = useProductStoreBase();
  const { setProducts, setLoading } = useProductStoreBase(state => ({ setProducts: state.setProducts, setLoading: state.setLoading }));
  const [hydrated, setHydrated] = useReactState(false);

  useEffect(() => {
    const storedProducts = localStorage.getItem(STORAGE_KEY);
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
      setProducts(initialProducts);
    }
    setLoading(false);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setProducts, setLoading]);

  return { ...store, isLoading: !hydrated || store.isLoading };
};
