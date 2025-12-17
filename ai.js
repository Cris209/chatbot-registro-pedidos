import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde el archivo .env en la raíz del proyecto
const envPath = join(__dirname, '.env');

// Intentar cargar con dotenv primero
const result = dotenv.config({ path: envPath });

// Si dotenv falla, cargar manualmente
if (result.error || !process.env.OPENROUTER_API_KEY) {
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    const lines = envContent.split(/\r?\n/);
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          process.env[key.trim()] = value;
        }
      }
    }
  } catch (err) {
    console.warn('Advertencia: No se pudo cargar el archivo .env:', err.message);
  }
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Modelo configurable desde .env
// El modelo original solicitado no está disponible, usando un modelo alternativo de Gemini
// Puedes cambiarlo en el archivo .env agregando: OPENROUTER_MODEL=nombre_del_modelo
const MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY no está configurada en el archivo .env');
}

/**
 * Genera una respuesta natural usando OpenRouter API
 * @param {string} userMessage - Mensaje del usuario
 * @param {Object} context - Contexto de la conversación
 * @param {Object} context.collectedData - Datos ya recolectados
 * @param {string} context.currentField - Campo actual que se está solicitando
 * @returns {Promise<string>} Respuesta generada por la IA
 */
export async function generateAIResponse(userMessage, context = {}) {
  const { collectedData = {}, currentField = '' } = context;
  
  // Construir el contexto para la IA
  let systemPrompt = `Eres un asistente amable y empático de un restaurante que está tomando pedidos por teléfono. 
Tu objetivo es recolectar la siguiente información del cliente:
1. Nombre del cliente (customer_name)
2. Teléfono (phone) - debe ser válido (solo números, puede incluir +, espacios o guiones)
3. Nombre del plato que desea ordenar (dish_name)
4. Comentarios adicionales (comments) - opcional pero pregunta si tiene alguna preferencia especial

Sé natural, amable y conversacional. No uses formato de lista, habla como si fuera una conversación telefónica real.`;

  // Agregar información sobre los datos ya recolectados
  if (Object.keys(collectedData).length > 0) {
    systemPrompt += `\n\nDatos ya recolectados:\n`;
    for (const [key, value] of Object.entries(collectedData)) {
      systemPrompt += `- ${key}: ${value}\n`;
    }
  }

  // Agregar información sobre el campo actual
  if (currentField) {
    const fieldDescriptions = {
      customer_name: 'Estás preguntando por el nombre del cliente.',
      phone: 'Estás preguntando por el número de teléfono. Si el usuario proporciona un teléfono inválido (con letras que no sean +, espacios o guiones), pídelo de nuevo amablemente.',
      dish_name: 'Estás preguntando por el nombre del plato que desea ordenar.',
      comments: 'Estás preguntando si tiene algún comentario o preferencia especial sobre el pedido.'
    };
    systemPrompt += `\n${fieldDescriptions[currentField] || ''}`;
  }

  systemPrompt += `\n\nResponde de forma breve, natural y empática. No repitas la pregunta de forma obvia, simplemente continúa la conversación.`;

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/your-repo', // Opcional pero recomendado
          'X-Title': 'Chatbot Registro Pedidos' // Opcional
        }
      }
    );

    const aiMessage = response.data.choices[0]?.message?.content?.trim();
    
    if (!aiMessage) {
      throw new Error('No se recibió respuesta de la API');
    }

    return aiMessage;
  } catch (error) {
    if (error.response) {
      const errorMsg = error.response.data.error?.message || 'Error desconocido';
      // No mostrar el objeto completo del error, solo el mensaje
      throw new Error(`Error de API: ${errorMsg}`);
    } else if (error.request) {
      throw new Error('No se pudo conectar con OpenRouter API');
    } else {
      throw new Error(`Error: ${error.message}`);
    }
  }
}

/**
 * Genera un mensaje de confirmación final después de guardar el pedido
 * @param {Object} orderData - Datos del pedido guardado
 * @returns {Promise<string>} Mensaje de confirmación generado por la IA
 */
export async function generateConfirmationMessage(orderData) {
  const userMessage = `El pedido ha sido registrado exitosamente con los siguientes datos:
- Cliente: ${orderData.customer_name}
- Teléfono: ${orderData.phone}
- Plato: ${orderData.dish_name}
- Comentarios: ${orderData.comments || 'Ninguno'}

Genera un mensaje de confirmación amable y profesional para el cliente.`;

  const systemPrompt = `Eres un asistente de restaurante. Genera un mensaje de confirmación breve, amable y profesional confirmando que el pedido ha sido registrado. Incluye los detalles del pedido de forma natural.`;

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/your-repo',
          'X-Title': 'Chatbot Registro Pedidos'
        }
      }
    );

    const confirmationMessage = response.data.choices[0]?.message?.content?.trim();
    
    if (!confirmationMessage) {
      throw new Error('No se recibió respuesta de la API');
    }

    return confirmationMessage;
  } catch (error) {
    if (error.response) {
      const errorMsg = error.response.data.error?.message || 'Error desconocido';
      throw new Error(`Error de API: ${errorMsg}`);
    } else {
      throw new Error(`Error: ${error.message}`);
    }
  }
}

