import inquirer from 'inquirer';
import { initializeDatabase, saveOrder } from './db.js';
import { generateAIResponse, generateConfirmationMessage } from './ai.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde el archivo .env en la raíz del proyecto
dotenv.config({ path: join(__dirname, '.env') });

// Validación de teléfono
function isValidPhone(phone) {
  // Permite números, +, espacios y guiones
  // Debe tener al menos 7 dígitos numéricos
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  const digitsOnly = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && digitsOnly.length >= 7;
}

// Campos a recolectar en orden
const FIELDS = [
  { key: 'customer_name', label: 'nombre', validation: (value) => value.trim().length >= 2 },
  { key: 'phone', label: 'teléfono', validation: isValidPhone },
  { key: 'dish_name', label: 'plato', validation: (value) => value.trim().length >= 2 },
  { key: 'comments', label: 'comentarios', validation: () => true, optional: true }
];

/**
 * Obtiene el siguiente campo que necesita ser recolectado
 */
function getNextField(collectedData) {
  for (const field of FIELDS) {
    if (!collectedData[field.key] || (field.key === 'comments' && !collectedData[field.key])) {
      return field;
    }
  }
  return null;
}

/**
 * Genera el prompt inicial usando IA
 */
async function getInitialGreeting() {
  try {
    const greeting = await generateAIResponse(
      'Inicia la conversación saludando al cliente y preguntando por su nombre.',
      { currentField: 'customer_name' }
    );
    return greeting;
  } catch (error) {
    console.error('Error al generar saludo inicial:', error.message);
    return '¡Hola! Bienvenido a nuestro restaurante. ¿Podrías decirme tu nombre, por favor?';
  }
}

/**
 * Procesa la respuesta del usuario y valida si es correcta
 */
function processUserResponse(userInput, field) {
  const trimmedInput = userInput.trim();
  
  if (!trimmedInput && !field.optional) {
    return { valid: false, value: null };
  }

  if (field.optional && !trimmedInput) {
    return { valid: true, value: '' };
  }

  if (field.validation && !field.validation(trimmedInput)) {
    return { valid: false, value: null };
  }

  return { valid: true, value: trimmedInput };
}

/**
 * Flujo principal del chatbot
 */
async function main() {
  console.log('\n🤖 Chatbot de Registro de Pedidos\n');
  console.log('Inicializando...\n');

  try {
    // Inicializar base de datos
    await initializeDatabase();

    const collectedData = {};
    let conversationHistory = [];

    // Saludo inicial
    const greeting = await getInitialGreeting();
    console.log(`\n🤖 Bot: ${greeting}\n`);

    // Bucle principal de recolección de datos
    while (true) {
      const nextField = getNextField(collectedData);

      if (!nextField) {
        break; // Todos los campos han sido recolectados
      }

      // Obtener respuesta del usuario
      const { userInput } = await inquirer.prompt([
        {
          type: 'input',
          name: 'userInput',
          message: '👤 Tú:',
          validate: (input) => {
            if (!input.trim() && !nextField.optional) {
              return 'Por favor, proporciona una respuesta.';
            }
            return true;
          }
        }
      ]);

      // Procesar y validar respuesta
      const processed = processUserResponse(userInput, nextField);

      if (!processed.valid) {
        // Generar mensaje de error usando IA
        try {
          const errorMessage = await generateAIResponse(
            `El usuario proporcionó: "${userInput}". Esto no es válido para el campo ${nextField.label}. Pídelo de nuevo de forma amable.`,
            {
              collectedData,
              currentField: nextField.key
            }
          );
          console.log(`\n🤖 Bot: ${errorMessage}\n`);
          continue;
        } catch (error) {
          console.error('Error al generar mensaje de error:', error.message);
          if (nextField.key === 'phone') {
            console.log(`\n🤖 Bot: Lo siento, ese número de teléfono no parece válido. ¿Podrías proporcionar un número válido, por favor?\n`);
          } else {
            console.log(`\n🤖 Bot: Por favor, proporciona un ${nextField.label} válido.\n`);
          }
          continue;
        }
      }

      // Guardar dato recolectado
      collectedData[nextField.key] = processed.value;

      // Si no es el último campo, generar siguiente pregunta usando IA
      const remainingFields = FIELDS.filter(f => !collectedData[f.key] || (f.key === 'comments' && !collectedData[f.key]));
      
      if (remainingFields.length > 0) {
        const nextFieldToAsk = remainingFields[0];
        
        try {
          const aiResponse = await generateAIResponse(
            `El usuario respondió: "${userInput}". Ahora necesitas preguntar por el ${nextFieldToAsk.label}.`,
            {
              collectedData,
              currentField: nextFieldToAsk.key
            }
          );
          console.log(`\n🤖 Bot: ${aiResponse}\n`);
        } catch (error) {
          console.error('Error al generar respuesta de IA:', error.message);
          // Fallback a mensaje predeterminado
          const fieldLabels = {
            phone: 'número de teléfono',
            dish_name: 'nombre del plato que desea ordenar',
            comments: 'algún comentario o preferencia especial'
          };
          console.log(`\n🤖 Bot: Perfecto. ¿Podrías proporcionarme tu ${fieldLabels[nextFieldToAsk.key] || nextFieldToAsk.label}?\n`);
        }
      }
    }

    // Todos los datos recolectados, guardar en la base de datos
    console.log('\n💾 Guardando pedido en la base de datos...\n');
    
    const orderId = await saveOrder(collectedData);
    
    console.log(`✓ Pedido guardado con ID: ${orderId}\n`);

    // Generar mensaje de confirmación usando IA
    try {
      const confirmationMessage = await generateConfirmationMessage(collectedData);
      console.log(`🤖 Bot: ${confirmationMessage}\n`);
    } catch (error) {
      console.error('Error al generar mensaje de confirmación:', error.message);
      console.log(`\n🤖 Bot: ¡Perfecto! Tu pedido ha sido registrado exitosamente.\n`);
      console.log(`   Cliente: ${collectedData.customer_name}`);
      console.log(`   Teléfono: ${collectedData.phone}`);
      console.log(`   Plato: ${collectedData.dish_name}`);
      if (collectedData.comments) {
        console.log(`   Comentarios: ${collectedData.comments}`);
      }
      console.log(`   ID de Pedido: ${orderId}\n`);
    }

    console.log('✅ Proceso completado. ¡Gracias por usar nuestro servicio!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Manejar señales de interrupción
process.on('SIGINT', () => {
  console.log('\n\n👋 Programa interrumpido por el usuario. ¡Hasta luego!\n');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Programa terminado. ¡Hasta luego!\n');
  process.exit(0);
});

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ Error no manejado:', reason);
  // No salir inmediatamente, permitir que el programa termine normalmente si es posible
});

// Ejecutar el programa
main().catch((error) => {
  console.error('\n❌ Error fatal:', error.message);
  if (error.stack) {
    console.error('Stack:', error.stack);
  }
  process.exit(1);
});

