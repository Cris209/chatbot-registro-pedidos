import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'orders.db');

/**
 * Inicializa la base de datos y crea la tabla orders si no existe
 */
export async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('✓ Conectado a la base de datos SQLite');
    });

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        dish_name VARCHAR(255) NOT NULL,
        comments TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.run(createTableQuery, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('✓ Tabla orders verificada/creada');
      resolve(db);
    });
  });
}

/**
 * Guarda un pedido en la base de datos
 * @param {Object} orderData - Datos del pedido
 * @param {string} orderData.customer_name - Nombre del cliente
 * @param {string} orderData.phone - Teléfono del cliente
 * @param {string} orderData.dish_name - Nombre del plato
 * @param {string} orderData.comments - Comentarios adicionales
 * @returns {Promise<number>} ID del pedido insertado
 */
export async function saveOrder(orderData) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    
    const insertQuery = `
      INSERT INTO orders (customer_name, phone, dish_name, comments)
      VALUES (?, ?, ?, ?)
    `;

    db.run(
      insertQuery,
      [orderData.customer_name, orderData.phone, orderData.dish_name, orderData.comments || ''],
      function(err) {
        db.close();
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      }
    );
  });
}

/**
 * Cierra la conexión a la base de datos
 * @param {sqlite3.Database} db - Instancia de la base de datos
 */
export function closeDatabase(db) {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
}

