
'use server';
/**
 * @fileOverview Flujo de IA para extraer productos de un archivo PDF.
 *
 * - extractProductsFromPdf - Procesa un PDF para extraer información de productos.
 */

import { ai } from '@/ai/genkit';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  ExtractProductsInputSchema, 
  ExtractProductsOutputSchema,
  type ExtractProductsInput,
  type ExtractProductsOutput
} from './extract-products-types';


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
        Debes extraer CADA UNO de los productos que encuentres con su nombre, precio y cantidad de unidades. NADA MÁS. Revisa el documento completo de principio a fin para no omitir ninguno.
        Por ejemplo, si ves un producto llamado "Melbourne" con un precio de "$1292.10" y una etiqueta "x24u", debes extraer: name: "Melbourne", price: 1292.10, quantity: 24.

        Aquí tienes una lista de productos que ya existen en la base de datos:
        ${existingProductsJson}
        
        Para cada producto que extraigas del PDF, compáralo con la lista de productos existentes.
        - Si el nombre del producto del PDF coincide con uno existente, marca 'isNew' como 'false'.
        - Si el producto del PDF no está en la lista de existentes, marca 'isNew' como 'true'.

        Ignora cualquier texto que no sea un nombre de producto, precio o cantidad (índices, portadas, descripciones largas, etc.).
        Proporciona el resultado en el formato JSON especificado.

        Documento a analizar:
        {{media url=pdfDataUri}}
      `,
      input: { pdfDataUri: input.pdfDataUri },
      output: {
        schema: ExtractProductsOutputSchema,
      },
      model: 'googleai/gemini-1.5-flash-latest',
    });

    const output = llmResponse.output;
    if (!output) {
      throw new Error("La IA no pudo procesar el documento.");
    }

    return output;
  }
);
