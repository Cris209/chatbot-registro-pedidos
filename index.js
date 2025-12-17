import inquirer from 'inquirer';
import { initializeDatabase, saveOrder } from './db.js';

// Validación de teléfono
function isValidPhone(phone) {
  // Permite números, +, espacios y guiones
  // Debe tener al menos 7 dígitos numéricos
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  const digitsOnly = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && digitsOnly.length >= 7;
}

// Mensajes pregrabados del chatbot
const MESSAGES = {
  greeting: '¡Hola! Bienvenido a nuestro restaurante. Me encantaría ayudarte con tu pedido.',
  askName: '¿Podrías decirme tu nombre, por favor?',
  askPhone: 'Perfecto, {name}. Ahora necesito tu número de teléfono para contactarte.',
  askPhoneInvalid: 'Lo siento, ese número de teléfono no parece válido. ¿Podrías proporcionar un número válido, por favor?',
  askDish: 'Excelente. ¿Qué plato te gustaría ordenar?',
  askComments: '¿Tienes algún comentario o preferencia especial para tu pedido? (opcional)',
  askCommentsOptional: 'Si no tienes comentarios, puedes presionar Enter para continuar.',
  saving: '💾 Guardando tu pedido en la base de datos...',
  success: '✅ ¡Perfecto! Tu pedido ha sido registrado exitosamente.',
  confirmation: (data) => {
    let msg = `\n📋 Resumen de tu pedido:\n`;
    msg += `   👤 Cliente: ${data.customer_name}\n`;
    msg += `   📞 Teléfono: ${data.phone}\n`;
    msg += `   🍽️  Plato: ${data.dish_name}\n`;
    if (data.comments) {
      msg += `   📝 Comentarios: ${data.comments}\n`;
    }
    msg += `   🆔 ID de Pedido: ${data.orderId}\n`;
    return msg;
  },
  thankYou: '¡Gracias por usar nuestro servicio! Tu pedido estará listo pronto. 👨‍🍳'
};

// Campos a recolectar en orden
const FIELDS = [
  { 
    key: 'customer_name', 
    label: 'nombre',
    question: (data) => data.customer_name ? MESSAGES.askPhone.replace('{name}', data.customer_name) : MESSAGES.askName,
    validation: (value) => value.trim().length >= 2,
    errorMessage: 'Por favor, proporciona un nombre válido (mínimo 2 caracteres).'
  },
  { 
    key: 'phone', 
    label: 'teléfono',
    question: (data) => MESSAGES.askPhone.replace('{name}', data.customer_name || ''),
    validation: isValidPhone,
    errorMessage: MESSAGES.askPhoneInvalid
  },
  { 
    key: 'dish_name', 
    label: 'plato',
    question: () => MESSAGES.askDish,
    validation: (value) => value.trim().length >= 2,
    errorMessage: 'Por favor, proporciona el nombre de un plato válido.'
  },
  { 
    key: 'comments', 
    label: 'comentarios',
    question: () => MESSAGES.askComments,
    validation: () => true,
    optional: true,
    errorMessage: ''
  }
];

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

    // Saludo inicial
    console.log(`\n🤖 Bot: ${MESSAGES.greeting}\n`);

    // Bucle principal de recolección de datos
    for (const field of FIELDS) {
      let isValid = false;
      
      while (!isValid) {
        // Mostrar la pregunta
        const question = field.question(collectedData);
        console.log(`\n🤖 Bot: ${question}\n`);

        // Obtener respuesta del usuario
        const { userInput } = await inquirer.prompt([
          {
            type: 'input',
            name: 'userInput',
            message: '👤 Tú:',
            validate: (input) => {
              if (!input.trim() && !field.optional) {
                return 'Por favor, proporciona una respuesta.';
              }
              return true;
            }
          }
        ]);

        // Procesar y validar respuesta
        const processed = processUserResponse(userInput, field);

        if (!processed.valid) {
          // Mostrar mensaje de error
          if (field.errorMessage) {
            console.log(`\n🤖 Bot: ${field.errorMessage}\n`);
          }
          continue; // Volver a pedir el dato
        }

        // Guardar dato recolectado
        collectedData[field.key] = processed.value;
        isValid = true;

        // Si es opcional y está vacío, no mostrar confirmación
        if (field.optional && !processed.value) {
          console.log(`\n🤖 Bot: Entendido, sin comentarios adicionales.\n`);
        }
      }
    }

    // Todos los datos recolectados, guardar en la base de datos
    console.log(`\n${MESSAGES.saving}\n`);
    
    const orderId = await saveOrder(collectedData);
    
    console.log(`✓ Pedido guardado con ID: ${orderId}\n`);

    // Mostrar mensaje de confirmación
    console.log(`🤖 Bot: ${MESSAGES.success}\n`);
    console.log(MESSAGES.confirmation({ ...collectedData, orderId }));
    console.log(`\n🤖 Bot: ${MESSAGES.thankYou}\n`);

    console.log('✅ Proceso completado.\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
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

// Ejecutar el programa
main().catch((error) => {
  console.error('\n❌ Error fatal:', error.message);
  if (error.stack) {
    console.error('Stack:', error.stack);
  }
  process.exit(1);
});
