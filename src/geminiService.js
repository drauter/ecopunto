import { GoogleGenerativeAI } from "@google/generative-ai";

// El usuario deberá proveer esta API Key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const genAI = new GoogleGenerativeAI(API_KEY || "");

export async function validateCleanup(imageBlob) {
  console.log("Iniciando validación con Gemini...", { hasKey: !!API_KEY, keyPrefix: API_KEY?.substring(0, 5) });
  
  if (!API_KEY) {
    console.warn("VITE_GEMINI_API_KEY no configurada. Por favor revisa el archivo .env y reinicia el servidor.");
    return { is_valid: false, score: 0, reason: "La llave de la IA no está configurada o no se pudo leer." };
  }

  // 1. Preparar los datos (Base64 y Prompt) una sola vez
  const reader = new FileReader();
  const base64Promise = new Promise((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(imageBlob);
  });
  const base64Data = await base64Promise;
  const mimeType = imageBlob.type || "image/jpeg";

  const prompt = `
    Eres un auditor ambiental estricto para una escuela. Tu misión es validar imágenes de acciones ecológicas (recoger basura, limpiar áreas verdes, reciclar).
    
    REGLAS DE VALIDACIÓN:
    1. El objetivo principal debe ser la LIMPIEZA o el CUIDADO del medio ambiente.
    2. Si la foto NO muestra basura siendo recogida, depositada en un tacho, o un área claramente siendo limpiada, setea "is_valid": false.
    3. DETECCIÓN DE FRAUDE: Rechaza fotos que parezcan repetidas (misma escena en diferente ángulo), fotos de pantallas, o fotos "staged" (basura colocada a propósito para la foto sin limpiar realmente). Si sospechas fraude, "is_valid": false.
    4. Fotos de personas simplemente posando sin hacer nada, selfies sin contexto ambiental, o fotos de objetos aleatorios (comida, ropa, folletos de publicidad) deben ser RECHAZADAS ("is_valid": false).
    5. Si es válida, otorga 1 punto por acciones normales y 2 puntos solo si el impacto es grande (mucha basura recogida o limpieza de un área grande).

    Responde ÚNICAMENTE en este formato JSON puro:
    {
      "is_valid": boolean,
      "score": number, 
      "reason": "Explicación corta en español"
    }
  `;

  // 2. Intentar con diferentes nombres de modelo (fallback)
  const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest", "gemini-2.0-flash-exp"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Intentando con modelo: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      console.log(`Respuesta exitosa con ${modelName}:`, text);
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Respuesta de IA no tiene formato JSON válido");
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.warn(`Falló el modelo ${modelName}:`, error.message);
      lastError = error;
      // Si falla, intentamos con el siguiente en la lista
    }
  }

  // 3. Si llegamos aquí, todos fallaron
  console.error("Todos los modelos de Gemini fallaron.", lastError);
  return { 
    is_valid: false, 
    score: 0, 
    reason: "Error de conexión con la IA. Por favor intenta de nuevo en unos minutos. (" + (lastError?.message || "Servicio no disponible") + ")"
  };
}
