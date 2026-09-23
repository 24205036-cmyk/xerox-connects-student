const mysql = require('mysql2/promise');
require('dotenv').config();

const useSsl = process.env.DB_SSL === 'true' || process.env.DB_SSL === 'require';

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
  keepAliveInitialDelay: 0,
  ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {})
};

// Create the connection pool (supports direct URI string or config object)
const connectionUri = process.env.DATABASE_URL || process.env.MYSQL_URL;
const pool = connectionUri
  ? mysql.createPool(connectionUri)
  : mysql.createPool(dbConfig);

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
