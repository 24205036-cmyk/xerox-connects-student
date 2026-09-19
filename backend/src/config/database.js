const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'xeroxpress_db',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create the connection pool
const pool = mysql.createPool(dbConfig);

// Helper for test queries
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 as connected');
    connection.release();
    return { success: true, rows };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  pool,
  testConnection
};
