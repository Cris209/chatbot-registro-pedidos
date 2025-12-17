# 🤖 Chatbot de Registro de Pedidos

Un chatbot interactivo de línea de comandos (CLI) para registrar pedidos de restaurante, desarrollado con Node.js, SQLite y la API de OpenRouter para generar respuestas naturales y empáticas.

## 📋 Características

- **Interfaz Conversacional Natural**: Utiliza la API de OpenRouter (modelo Gemini 2.0 Flash Thinking) para generar respuestas empáticas y naturales
- **Validación de Datos**: Valida automáticamente los datos ingresados (especialmente números de teléfono)
- **Base de Datos SQLite**: Almacena todos los pedidos de forma persistente
- **Arquitectura Modular**: Código organizado en módulos separados para fácil mantenimiento
- **Manejo de Errores**: Gestión robusta de errores con mensajes claros

## 🛠️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** (viene incluido con Node.js)
- **Cuenta de OpenRouter** con API Key (puedes obtenerla en [https://openrouter.ai](https://openrouter.ai))

## 📦 Instalación

1. **Clona o descarga este proyecto** en tu máquina local

2. **Instala las dependencias** ejecutando:
   ```bash
   npm install
   ```

   Esto instalará las siguientes dependencias:
   - `sqlite3`: Para la gestión de la base de datos SQLite
   - `inquirer`: Para la interfaz interactiva en la terminal
   - `dotenv`: Para cargar variables de entorno
   - `axios`: Para realizar peticiones HTTP a la API de OpenRouter

## ⚙️ Configuración

1. **Crea un archivo `.env`** en la raíz del proyecto con el siguiente contenido:

   ```env
   OPENROUTER_API_KEY=tu_api_key_aqui
   ```

   > **Nota**: Reemplaza `tu_api_key_aqui` con tu API Key real de OpenRouter.

2. **Obtener API Key de OpenRouter**:
   - Visita [https://openrouter.ai](https://openrouter.ai)
   - Crea una cuenta o inicia sesión
   - Ve a la sección de API Keys
   - Genera una nueva API Key
   - Copia la clave y pégala en tu archivo `.env`

## 🚀 Uso

Una vez configurado, ejecuta el chatbot con:

```bash
node index.js
```

O usando npm:

```bash
npm start
```

### Flujo del Chatbot

El bot te guiará a través de una conversación natural para recolectar la siguiente información:

1. **Nombre del Cliente** (`customer_name`)
2. **Teléfono** (`phone`) - Se valida que sea un número válido
3. **Nombre del Plato** (`dish_name`)
4. **Comentarios** (`comments`) - Opcional, para preferencias especiales

Una vez que todos los datos sean recolectados y validados, el pedido se guardará automáticamente en la base de datos SQLite y recibirás un mensaje de confirmación generado por la IA.

## 📁 Estructura del Proyecto

```
backend-proyect/
├── index.js          # Archivo principal con el flujo del chatbot
├── db.js             # Módulo para gestión de la base de datos SQLite
├── ai.js             # Módulo para integración con OpenRouter API
├── package.json       # Dependencias y scripts del proyecto
├── .env              # Variables de entorno (no incluido en git)
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
- **OpenRouter API**: Servicio para acceder a modelos de IA (Gemini 2.0 Flash Thinking)
- **Inquirer.js**: Biblioteca para crear interfaces CLI interactivas
- **Axios**: Cliente HTTP para peticiones a APIs
- **dotenv**: Gestión de variables de entorno

## 📝 Notas Técnicas

- El chatbot utiliza el modelo `google/gemini-2.0-flash-thinking-exp:free` de OpenRouter
- La validación de teléfono permite números con formato internacional (+, espacios, guiones)
- Todos los datos se almacenan localmente en SQLite
- El código utiliza async/await para manejo de promesas
- Los mensajes de error y confirmación son generados dinámicamente por la IA

## 🐛 Solución de Problemas

### Error: "OPENROUTER_API_KEY no está configurada"
- Asegúrate de haber creado el archivo `.env` en la raíz del proyecto
- Verifica que la variable `OPENROUTER_API_KEY` esté correctamente escrita
- Confirma que tu API Key sea válida

### Error de conexión con OpenRouter
- Verifica tu conexión a internet
- Confirma que tu API Key tenga créditos disponibles
- Revisa que el modelo especificado esté disponible

### Error al crear la base de datos
- Verifica que tengas permisos de escritura en el directorio del proyecto
- Asegúrate de que no haya otro proceso usando el archivo `orders.db`

## 📄 Licencia

ISC

## 👨‍💻 Desarrollo

Este proyecto fue desarrollado siguiendo las mejores prácticas de Node.js:
- Código modular y reutilizable
- Manejo adecuado de errores
- Validación de datos
- Uso de async/await para operaciones asíncronas
- Variables de entorno para configuración sensible

---

¡Disfruta usando el chatbot! 🎉

