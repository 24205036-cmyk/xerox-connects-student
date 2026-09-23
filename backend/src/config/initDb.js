const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const initDatabase = async () => {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'xeroxpress_db';

  console.log(`⏳ Initializing MySQL Database: ${dbName} on ${host}:${port}...`);

  // Step 1: Connect to server and create database if not exists
  const rootConn = await mysql.createConnection({ host, port, user, password });
  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await rootConn.end();

  // Step 2: Connect to the specific database to create tables
  const db = await mysql.createConnection({ host, port, user, password, database: dbName });

  try {
    // 1. users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        register_number VARCHAR(50) UNIQUE DEFAULT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        department VARCHAR(100) DEFAULT NULL,
        year VARCHAR(10) DEFAULT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('STUDENT', 'XEROX_STAFF', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_role (role),
        INDEX idx_users_reg (register_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. orders table
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        user_id INT NOT NULL,
        batch_date DATE NOT NULL,
        status ENUM('PENDING', 'ACCEPTED', 'PRINTING', 'READY', 'COLLECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
        printing_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        stationery_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        additional_instructions TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_orders_user (user_id),
        INDEX idx_orders_status (status),
        INDEX idx_orders_batch (batch_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. order_files table
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        stored_filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        copies INT NOT NULL DEFAULT 1,
        print_type ENUM('BLACK_WHITE', 'COLOR') NOT NULL DEFAULT 'BLACK_WHITE',
        side_type ENUM('SINGLE_SIDE', 'DOUBLE_SIDE') NOT NULL DEFAULT 'SINGLE_SIDE',
        page_range VARCHAR(100) DEFAULT 'ALL',
        instructions TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_order_files_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. stationery table
    await db.query(`
      CREATE TABLE IF NOT EXISTS stationery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255) DEFAULT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_stationery_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. order_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        stationery_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (stationery_id) REFERENCES stationery(id) ON DELETE RESTRICT,
        INDEX idx_order_items_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. payments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'UPI_GPAY',
        transaction_reference VARCHAR(100) DEFAULT NULL,
        payment_status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'EXTRA_PAYMENT') NOT NULL DEFAULT 'PENDING',
        paid_at DATETIME DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_payments_order (order_id),
        INDEX idx_payments_status (payment_status),
        UNIQUE KEY uq_payments_txn_ref (transaction_reference)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6b. payment_transactions table for Razorpay real payments
    await db.query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        order_id INT DEFAULT NULL,
        razorpay_order_id VARCHAR(100) NOT NULL UNIQUE,
        razorpay_payment_id VARCHAR(100) DEFAULT NULL,
        razorpay_signature VARCHAR(255) DEFAULT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        status ENUM('CREATED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED', 'DUPLICATE', 'EXTRA_PAYMENT') NOT NULL DEFAULT 'CREATED',
        payment_method VARCHAR(50) DEFAULT 'RAZORPAY',
        receipt VARCHAR(100) DEFAULT NULL,
        admin_notes TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_pt_user (user_id),
        INDEX idx_pt_order (order_id),
        INDEX idx_pt_rzp_order (razorpay_order_id),
        UNIQUE KEY uq_pt_rzp_payment (razorpay_payment_id),
        INDEX idx_pt_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6c. webhook_events table for webhook idempotency
    await db.query(`
      CREATE TABLE IF NOT EXISTS webhook_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id VARCHAR(100) UNIQUE NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        payload JSON DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_we_event_id (event_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Apply incremental schema alterations for existing databases
    await applyPaymentMigrations(db);

    // 7. order_status_history table
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        previous_status ENUM('PENDING', 'ACCEPTED', 'PRINTING', 'READY', 'COLLECTED', 'CANCELLED') DEFAULT NULL,
        new_status ENUM('PENDING', 'ACCEPTED', 'PRINTING', 'READY', 'COLLECTED', 'CANCELLED') NOT NULL,
        changed_by INT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_status_history_order (order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8. system_settings table
    await db.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        description VARCHAR(255) DEFAULT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 9. print_prices table
    await db.query(`
      CREATE TABLE IF NOT EXISTS print_prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        print_type ENUM('BLACK_WHITE', 'COLOR') NOT NULL,
        side_type ENUM('SINGLE_SIDE', 'DOUBLE_SIDE') NOT NULL,
        price_per_page DECIMAL(10,2) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_print_pricing (print_type, side_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 10. notifications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        order_id INT DEFAULT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('ORDER_STATUS', 'PAYMENT', 'DEADLINE', 'SYSTEM') DEFAULT 'ORDER_STATUS',
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
        INDEX idx_notifications_user (user_id),
        INDEX idx_notifications_read (is_read)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Step 3: Seed Default Initial Data
    await seedInitialData(db);

    console.log('✅ Database tables and seed data initialized successfully.');
  } finally {
    await db.end();
  }
};

const applyPaymentMigrations = async (db) => {
  try {
    // 1. Check and add admin_notes to payment_transactions if not exists
    const [ptCols] = await db.query("SHOW COLUMNS FROM payment_transactions LIKE 'admin_notes'");
    if (ptCols.length === 0) {
      await db.query("ALTER TABLE payment_transactions ADD COLUMN admin_notes TEXT DEFAULT NULL AFTER receipt");
    }

    // 2. Safely expand status ENUM for payment_transactions
    await db.query(`
      ALTER TABLE payment_transactions 
      MODIFY COLUMN status ENUM('CREATED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED', 'DUPLICATE', 'EXTRA_PAYMENT') NOT NULL DEFAULT 'CREATED'
    `);

    // 3. Safely expand payment_status ENUM for payments
    await db.query(`
      ALTER TABLE payments 
      MODIFY COLUMN payment_status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'EXTRA_PAYMENT') NOT NULL DEFAULT 'PENDING'
    `);

    // 4. Ensure UNIQUE constraint on razorpay_payment_id in payment_transactions
    const [ptIndexes] = await db.query("SHOW INDEX FROM payment_transactions WHERE Key_name = 'uq_pt_rzp_payment'");
    if (ptIndexes.length === 0) {
      try {
        await db.query("ALTER TABLE payment_transactions ADD UNIQUE KEY uq_pt_rzp_payment (razorpay_payment_id)");
      } catch (_) { /* ignore if already unique or duplicate keys */ }
    }
  } catch (err) {
    console.warn('⚠️ Payment migration check notice:', err.message);
  }
};

const seedInitialData = async (db) => {
  // 1. System Settings
  const defaultSettings = [
    ['order_open_time', '06:00', 'Daily order window opening time (HH:mm)'],
    ['order_close_time', '20:30', 'Daily order window closing deadline (HH:mm)'],
    ['ordering_enabled', 'true', 'Global ordering master switch (true/false)'],
    ['upi_id', 'xeroxpress@okaxis', 'College Xerox Counter GPay / UPI ID'],
    ['upi_merchant_name', 'Campus Xerox Central', 'Display merchant name for UPI payments']
  ];

  for (const [key, value, desc] of defaultSettings) {
    await db.query(
      `INSERT INTO system_settings (setting_key, setting_value, description) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE description = VALUES(description)`,
      [key, value, desc]
    );
  }

  // 2. Print Prices
  const defaultPrices = [
    ['BLACK_WHITE', 'SINGLE_SIDE', 1.50],
    ['BLACK_WHITE', 'DOUBLE_SIDE', 2.00],
    ['COLOR', 'SINGLE_SIDE', 5.00],
    ['COLOR', 'DOUBLE_SIDE', 8.00]
  ];

  for (const [pType, sType, price] of defaultPrices) {
    await db.query(
      `INSERT INTO print_prices (print_type, side_type, price_per_page, is_active) 
       VALUES (?, ?, ?, TRUE) 
       ON DUPLICATE KEY UPDATE price_per_page = VALUES(price_per_page)`,
      [pType, sType, price]
    );
  }

  // 3. Stationery Catalog
  const defaultStationery = [
    ['A4 Copier Paper (Pack of 10)', '75 GSM bright white paper sheets', 15.00, 500],
    ['College Record Sheets (Pack of 20)', 'Ruled & unruled record submission sheets', 30.00, 300],
    ['Blue Gel Pen (Cello / Reynolds)', '0.5mm smooth flow pen for record writing', 10.00, 150],
    ['Black Gel Pen', '0.5mm black gel pen for titles & diagrams', 10.00, 150],
    ['Lead Pencil & Eraser Kit', 'HB pencil, sharpener and non-dust eraser', 12.00, 100],
    ['Clear Document Button Folder', 'Transparent protective folder for assignment submission', 15.00, 200],
    ['Spiral Binding Kit (Per Document)', 'Protective PVC transparent cover with spiral coil', 25.00, 80],
    ['Stick File / Strip Folder', 'A4 sliding strip report file', 10.00, 250]
  ];

  for (const [name, desc, price, stock] of defaultStationery) {
    const [existing] = await db.query('SELECT id FROM stationery WHERE name = ?', [name]);
    if (existing.length === 0) {
      await db.query(
        'INSERT INTO stationery (name, description, price, stock, is_active) VALUES (?, ?, ?, ?, TRUE)',
        [name, desc, price, stock]
      );
    }
  }

  // 4. Default Seed Users (Admin, Staff, Student)
  const passwordSalt = 10;
  
  // Admin
  const adminPassHash = await bcrypt.hash('Admin@123', passwordSalt);
  await db.query(`
    INSERT INTO users (name, email, phone, role, password_hash, is_active)
    VALUES ('Campus Administrator', 'admin@xeroxpress.edu', '9876500001', 'ADMIN', ?, TRUE)
    ON DUPLICATE KEY UPDATE role = 'ADMIN'
  `, [adminPassHash]);

  // Xerox Staff
  const staffPassHash = await bcrypt.hash('Staff@123', passwordSalt);
  await db.query(`
    INSERT INTO users (name, email, phone, role, password_hash, is_active)
    VALUES ('Central Xerox Counter Staff', 'staff@xeroxpress.edu', '9876500002', 'XEROX_STAFF', ?, TRUE)
    ON DUPLICATE KEY UPDATE role = 'XEROX_STAFF'
  `, [staffPassHash]);

  // Student
  const studentPassHash = await bcrypt.hash('Student@123', passwordSalt);
  await db.query(`
    INSERT INTO users (name, register_number, email, phone, department, year, role, password_hash, is_active)
    VALUES ('Rahul Sharma', '717822P101', 'student@xeroxpress.edu', '9876500003', 'CSE', '3', 'STUDENT', ?, TRUE)
    ON DUPLICATE KEY UPDATE register_number = '717822P101'
  `, [studentPassHash]);
};

// Execute if run directly
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Database initialization error:', err);
      process.exit(1);
    });
}

module.exports = initDatabase;
