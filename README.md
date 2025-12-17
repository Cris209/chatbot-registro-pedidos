# 🤖 Chatbot de Registro de Pedidos

Un chatbot interactivo de línea de comandos (CLI) para registrar pedidos de restaurante, desarrollado con Node.js y SQLite. Utiliza un flujo simple con preguntas pregrabadas para recolectar información del cliente.

## 📋 Características

- **Interfaz Conversacional Simple**: Flujo directo con preguntas pregrabadas y amigables
- **Validación de Datos**: Valida automáticamente los datos ingresados (especialmente números de teléfono)
- **Base de Datos SQLite**: Almacena todos los pedidos de forma persistente
- **Arquitectura Modular**: Código organizado en módulos separados para fácil mantenimiento
- **Manejo de Errores**: Gestión robusta de errores con mensajes claros
- **Sin Dependencias Externas de IA**: No requiere API keys ni servicios externos

## 🛠️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** (viene incluido con Node.js)

## 📦 Instalación

1. **Clona o descarga este proyecto** en tu máquina local

2. **Instala las dependencias** ejecutando:
   ```bash
   npm install
   ```

   Esto instalará las siguientes dependencias:
   - `sqlite3`: Para la gestión de la base de datos SQLite
   - `inquirer`: Para la interfaz interactiva en la terminal

## 🚀 Uso

Ejecuta el chatbot con:

```bash
node index.js
```

O usando npm:

```bash
npm start
```

### Flujo del Chatbot

El bot te guiará a través de una conversación simple para recolectar la siguiente información:

1. **Nombre del Cliente** (`customer_name`)
2. **Teléfono** (`phone`) - Se valida que sea un número válido
3. **Nombre del Plato** (`dish_name`)
4. **Comentarios** (`comments`) - Opcional, para preferencias especiales

Una vez que todos los datos sean recolectados y validados, el pedido se guardará automáticamente en la base de datos SQLite y recibirás un mensaje de confirmación con el resumen del pedido.

## 📁 Estructura del Proyecto

```
backend-proyect/
├── index.js          # Archivo principal con el flujo del chatbot
├── db.js             # Módulo para gestión de la base de datos SQLite
├── package.json       # Dependencias y scripts del proyecto
├── .gitignore        # Archivos a ignorar en git
├── orders.db         # Base de datos SQLite (se crea automáticamente)
└── README.md         # Este archivo
```

## 🗄️ Base de Datos

El proyecto utiliza SQLite y crea automáticamente una base de datos llamada `orders.db` con la siguiente estructura:

```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  dish_name VARCHAR(255) NOT NULL,
  comments TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

La tabla se crea automáticamente la primera vez que ejecutas el programa.

## 🔧 Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución JavaScript
- **SQLite3**: Base de datos relacional ligera
- **Inquirer.js**: Biblioteca para crear interfaces CLI interactivas

## 📝 Notas Técnicas

- La validación de teléfono permite números con formato internacional (+, espacios, guiones)
- Todos los datos se almacenan localmente en SQLite
- El código utiliza async/await para manejo de promesas
- Los mensajes del chatbot son pregrabados y personalizables en el código
- No requiere configuración de API keys ni servicios externos

## 🐛 Solución de Problemas

### Error al crear la base de datos
- Verifica que tengas permisos de escritura en el directorio del proyecto
- Asegúrate de que no haya otro proceso usando el archivo `orders.db`

### Error al instalar dependencias
- Asegúrate de tener Node.js y npm instalados correctamente
- Intenta ejecutar `npm install` nuevamente
- Si el problema persiste, elimina `node_modules` y `package-lock.json` y vuelve a instalar

## 🎨 Personalización

Puedes personalizar los mensajes del chatbot editando el objeto `MESSAGES` en el archivo `index.js`:

```javascript
const MESSAGES = {
  greeting: '¡Hola! Bienvenido a nuestro restaurante...',
  askName: '¿Podrías decirme tu nombre, por favor?',
  // ... más mensajes
};
```

## 📄 Licencia

ISC

## 👨‍💻 Desarrollo

Este proyecto fue desarrollado siguiendo las mejores prácticas de Node.js:
- Código modular y reutilizable
- Manejo adecuado de errores
- Validación de datos
- Uso de async/await para operaciones asíncronas
- Flujo simple y directo sin dependencias externas complejas

---

¡Disfruta usando el chatbot! 🎉
