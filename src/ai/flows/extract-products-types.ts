/**
 * @fileOverview Tipos y esquemas para el flujo de extracción de productos.
 */
import { z } from 'zod';

// Esquema de entrada: un PDF como data URI.
export const ExtractProductsInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "Un archivo PDF codificado como data URI. Formato esperado: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ExtractProductsInput = z.infer<typeof ExtractProductsInputSchema>;

// Esquema para un solo producto extraído.
const ExtractedProductSchema = z.object({
    name: z.string().describe('El nombre del producto.'),
    price: z.number().describe('El precio del producto.'),
    description: z.string().describe('Una breve descripción del producto.'),
    isNew: z.boolean().describe('Se establece en true si es un producto nuevo, false si ya existe y solo se actualiza el precio.'),
});

// Esquema de salida: una lista de productos extraídos.
export const ExtractProductsOutputSchema = z.object({
  products: z.array(ExtractedProductSchema),
});
export type ExtractProductsOutput = z.infer<typeof ExtractProductsOutputSchema>;
