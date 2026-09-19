const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { generateToken } = require('../utils/jwt');

/**
 * Register a new Student account
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const {
      name,
      registerNumber,
      email,
      phone,
      department,
      year,
      password,
      confirmPassword
    } = req.body;

    // 1. Validation
    if (!name || !registerNumber || !email || !phone || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required registration fields.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Password and confirmation password do not match.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters in length.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRegNo = registerNumber.trim().toUpperCase();

    // 2. Check if student already exists by email or register number
    const [existing] = await pool.query(
      'SELECT id, email, register_number FROM users WHERE email = ? OR register_number = ?',
      [cleanEmail, cleanRegNo]
    );

    if (existing.length > 0) {
      const match = existing[0];
      if (match.email.toLowerCase() === cleanEmail) {
        return res.status(409).json({
          status: 'error',
          message: 'An account with this email address already exists.'
        });
      }
      if (match.register_number && match.register_number.toUpperCase() === cleanRegNo) {
        return res.status(409).json({
          status: 'error',
          message: 'An account with this register number already exists.'
        });
      }
    }

    // 3. Hash password
    const passwordSalt = 10;
    const passwordHash = await bcrypt.hash(password, passwordSalt);

    // 4. Insert into database
    const [result] = await pool.query(
      `INSERT INTO users (name, register_number, email, phone, department, year, password_hash, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'STUDENT', TRUE)`,
      [name.trim(), cleanRegNo, cleanEmail, phone.trim(), department || 'CSE', year || '1', passwordHash]
    );

    const newUserId = result.insertId;

    // 5. Generate token & response payload
    const token = generateToken({ id: newUserId, role: 'STUDENT', email: cleanEmail });

    return res.status(201).json({
      status: 'success',
      message: 'Student account created successfully.',
      token,
      user: {
        id: newUserId,
        name: name.trim(),
        register_number: cleanRegNo,
        email: cleanEmail,
        phone: phone.trim(),
        department: department || 'CSE',
        year: year || '1',
        role: 'STUDENT',
        is_active: true
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sign in (Student / Xerox Staff / Admin)
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide your email/register number and password.'
      });
    }

    const cleanIdentifier = identifier.trim();

    // Query user by email OR register_number
    const [users] = await pool.query(
      `SELECT id, name, register_number, email, phone, department, year, password_hash, role, is_active
       FROM users
       WHERE email = ? OR register_number = ?`,
      [cleanIdentifier.toLowerCase(), cleanIdentifier.toUpperCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials. Please check your username/email and password.'
      });
    }

    const user = users[0];

    // Check account active state
    if (!user.is_active) {
      return res.status(403).json({
        status: 'error',
        message: 'Your account has been deactivated. Please contact campus admin.'
      });
    }

    // Role check if explicitly requested
    if (role && user.role !== role) {
      return res.status(403).json({
        status: 'error',
        message: `Unauthorized for portal role: ${role}. Your role is ${user.role}.`
      });
    }

    // Verify bcrypt password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials. Please check your username/email and password.'
      });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      role: user.role,
      email: user.email
    });

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      register_number: user.register_number,
      email: user.email,
      phone: user.phone,
      department: user.department,
      year: user.year,
      role: user.role,
      is_active: Boolean(user.is_active)
    };

    return res.status(200).json({
      status: 'success',
      message: `Welcome back, ${user.name}!`,
      token,
      user: sanitizedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  return res.status(200).json({
    status: 'success',
    user: req.user
  });
};

module.exports = {
  register,
  login,
  getMe
};
