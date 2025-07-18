'use client';

import { create } from 'zustand';
import { useEffect } from 'react';
import type { Product, Variant } from '@/lib/types';

const initialProducts: Product[] = [
    { 
      id: '1', 
      name: 'Oso de Peluche', 
      price: 19.99, 
      imageUrl: 'https://placehold.co/600x400.png', 
      category: 'Juguetes', 
      imageHint: 'teddy bear',
      variants: [
        { id: 'v1', name: 'Marrón', inStock: true },
        { id: 'v2', name: 'Blanco', inStock: false },
      ]
    },
    { 
      id: '2', 
      name: 'Taza de Café de Cerámica', 
      price: 12.50, 
      imageUrl: 'https://placehold.co/600x400.png', 
      category: 'Hogar', 
      imageHint: 'coffee mug',
      variants: []
    },
    { 
      id: '3', 
      name: 'Diario de Cuero', 
      price: 25.00, 
      imageUrl: 'https://placehold.co/600x400.png', 
      category: 'Papelería', 
      imageHint: 'leather journal',
      variants: [] 
    },
    { 
      id: '4', 
      name: 'Vela de Soja Perfumada', 
      price: 18.00, 
      imageUrl: 'https://placehold.co/600x400.png', 
      category: 'Hogar', 
      imageHint: 'scented candle',
      variants: [
        { id: 'v3', name: 'Lavanda', inStock: true },
        { id: 'v4', name: 'Vainilla', inStock: true },
        { id: 'v5', name: 'Eucalipto', inStock: false },
      ]
    },
    { 
      id: '5', 
      name: 'Caja de Rompecabezas de Madera', 
      price: 35.50, 
      imageUrl: 'https://placehold.co/600x400.png', 
      category: 'Juguetes', 
      imageHint: 'puzzle box',
      variants: []
    },
];

const STORAGE_KEY = 'stockwise_products_v2';

type ProductUpsertData = Omit<Product, 'id' | 'imageHint'>;

interface ProductState {
  products: Product[];
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'imageHint' | 'category'> & { category?: string }) => void;
  updateProduct: (id: string, productUpdate: Partial<ProductUpsertData>) => void;
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
      id: Date.now().toString(),
      name: productData.name,
      price: productData.price,
      imageUrl: productData.imageUrl,
      category: productData.category || 'Sin categoría',
      imageHint: productData.name.split(' ').slice(0, 2).join(' ').toLowerCase(),
      variants: productData.variants.map(v => ({...v, id: `v_${Date.now()}_${Math.random()}`})),
    };
    const updatedProducts = [...get().products, newProduct];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
    }
    set({ products: updatedProducts });
  },
  updateProduct: (id, productUpdate) => {
    const updatedProducts = get().products.map((p) => {
      if (p.id === id) {
        const updatedP = { ...p, ...productUpdate };
        if (productUpdate.name) {
            updatedP.imageHint = productUpdate.name.split(' ').slice(0, 2).join(' ').toLowerCase();
        }
        // Ensure new variants get a unique ID
        if (productUpdate.variants) {
          updatedP.variants = productUpdate.variants.map(v => v.id.startsWith('new_') ? {...v, id: `v_${Date.now()}_${Math.random()}`} : v);
        }
        return updatedP;
      }
      return p;
    });
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

export const useProductStore = () => {
  const store = useProductStoreBase();
  const { setProducts, setLoading } = useProductStoreBase(state => ({ setProducts: state.setProducts, setLoading: state.setLoading }));

  useEffect(() => {
    let isMounted = true;
    const loadProducts = () => {
        setLoading(true);
        try {
            const storedProducts = localStorage.getItem(STORAGE_KEY);
            if (isMounted) {
                if (storedProducts) {
                    setProducts(JSON.parse(storedProducts));
                } else {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
                    setProducts(initialProducts);
                }
            }
        } catch (e) {
            console.error("Failed to parse products from localStorage", e);
            if(isMounted) setProducts(initialProducts);
        } finally {
            if(isMounted) setLoading(false);
        }
    };
    
    loadProducts();

    return () => {
        isMounted = false;
    };
  }, [setProducts, setLoading]);

  return store;
};
