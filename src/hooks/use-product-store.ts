'use client';

import { create } from 'zustand';
import { useEffect, useState as useReactState } from 'react';
import type { Product } from '@/lib/types';

const initialProducts: Product[] = [
    { id: '1', name: 'Oso de Peluche', description: 'Un compañero tierno para todas las edades.', price: 19.99, imageUrl: 'https://placehold.co/600x400.png', inStock: true, imageHint: 'teddy bear', category: 'Juguetes' },
    { id: '2', name: 'Taza de Café de Cerámica', description: 'Una taza hermosa para tu café mañanero.', price: 12.50, imageUrl: 'https://placehold.co/600x400.png', inStock: true, imageHint: 'coffee mug', category: 'Hogar' },
    { id: '3', name: 'Diario de Cuero', description: 'Para tus pensamientos, sueños y planes.', price: 25.00, imageUrl: 'https://placehold.co/600x400.png', inStock: false, imageHint: 'leather journal', category: 'Papelería' },
    { id: '4', name: 'Vela de Soja Perfumada', description: 'Relajante aroma a lavanda y vainilla.', price: 18.00, imageUrl: 'https://placehold.co/600x400.png', inStock: true, imageHint: 'scented candle', category: 'Hogar' },
    { id: '5', name: 'Caja de Rompecabezas de Madera', description: 'Un rompecabezas desafiante para mentes agudas.', price: 35.50, imageUrl: 'https://placehold.co/600x400.png', inStock: true, imageHint: 'puzzle box', category: 'Juguetes' },
];

const STORAGE_KEY = 'stockwise_products';

// This defines the shape of the data required to create or update a product.
// We omit fields that are auto-generated or should not be changed directly by these operations.
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
      description: productData.description,
      price: productData.price,
      imageUrl: productData.imageUrl,
      inStock: productData.inStock,
      category: productData.category || 'Sin categoría',
      imageHint: productData.name.split(' ').slice(0, 2).join(' ').toLowerCase(),
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
        // If name changes, update imageHint as well
        if (productUpdate.name) {
            updatedP.imageHint = productUpdate.name.split(' ').slice(0, 2).join(' ').toLowerCase();
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
