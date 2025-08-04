
'use server';
/**
 * @fileOverview Flujo de IA para extraer productos de un archivo PDF.
 *
 * - extractProductsFromPdf - Procesa un PDF para extraer información de productos.
 * - ExtractProductsInput - El tipo de entrada para la función.
 * - ExtractProductsOutput - El tipo de salida de la función.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

// Función principal exportada que será llamada desde el frontend.
export async function extractProductsFromPdf(
  input: ExtractProductsInput
): Promise<ExtractProductsOutput> {
  return extractProductsFlow(input);
}


// Definición del "flow" de Genkit.
const extractProductsFlow = ai.defineFlow(
  {
    name: 'extractProductsFlow',
    inputSchema: ExtractProductsInputSchema,
    outputSchema: ExtractProductsOutputSchema,
  },
  async (input) => {
    
    // 1. Obtener la lista de productos existentes desde Firestore.
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const existingProducts = productsSnapshot.docs.map(doc => ({
      name: doc.data().name,
      price: doc.data().price
    }));
    const existingProductsJson = JSON.stringify(existingProducts);

    // 2. Definir y ejecutar el prompt de IA.
    const llmResponse = await ai.generate({
      prompt: `
        Eres un asistente de gestión de catálogos experto.
        Tu tarea es analizar el siguiente documento PDF, que es un catálogo de productos.
        Debes extraer cada producto que encuentres con su nombre, precio y una breve descripción.

        Aquí tienes una lista de productos que ya existen en la base de datos:
        ${existingProductsJson}
        
        Para cada producto que extraigas del PDF, compáralo con la lista de productos existentes.
        - Si el nombre del producto del PDF coincide con uno existente, marca 'isNew' como 'false'.
        - Si el producto del PDF no está en la lista de existentes, marca 'isNew' como 'true'.

        Ignora cualquier texto que no sea una descripción de producto (índices, portadas, etc.).
        Proporciona el resultado en el formato JSON especificado.

        Documento a analizar:
        {{media url=pdfDataUri}}
      `,
      input: { pdfDataUri: input.pdfDataUri },
      output: {
        schema: ExtractProductsOutputSchema,
      },
    });

    const output = llmResponse.output();
    if (!output) {
      throw new Error("La IA no pudo procesar el documento.");
    }

    return output;
  }
);
