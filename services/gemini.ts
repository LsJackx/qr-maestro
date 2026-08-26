import { GoogleGenAI, Type } from "@google/genai";

interface DesignResponse {
  fgColor: string;
  bgColor: string;
  suggestion: string;
}

/**
 * Uses Gemini to generate a visual theme (colors) based on a description.
 */
export const generateQRDesign = async (prompt: string): Promise<DesignResponse> => {
  // Initialize inside the function to prevent "White Screen of Death" on startup if key is missing
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("API Key is missing. Please configure API_KEY in your environment variables.");
    throw new Error("API Key not configured. Please add API_KEY to Vercel Environment Variables.");
  }

  // Create instance only when needed
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Actúa como un Diseñador Gráfico Senior especializado en Branding.
      El usuario quiere un estilo visual para su código QR.
      
      Descripción del usuario: "${prompt}"
      
      Genera una paleta de colores atractiva y legible.
      Reglas:
      1. El contraste debe ser alto para que el QR funcione.
      2. Si es una marca o festividad, usa colores representativos.
      
      Devuelve JSON:
      - fgColor: Color del QR (Hex).
      - bgColor: Color del fondo (Hex).
      - suggestion: Breve consejo de diseño (ej: "Usa el marco circular para este estilo").
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fgColor: { type: Type.STRING },
            bgColor: { type: Type.STRING },
            suggestion: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as DesignResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("No se pudo generar el diseño.");
  }
};