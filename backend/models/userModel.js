const pool = require('../config/database');

const User = {
  async findByLoginIdentifier(identifier) {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1',
      [identifier, identifier]
    );
    return users[0] || null;
  },

  async checkExisting(username, email, phone) {
    const [existing] = await pool.query(
      `SELECT username, email, phone FROM users 
       WHERE username = ? 
          OR (email IS NOT NULL AND email = ?) 
          OR (phone IS NOT NULL AND phone = ?)`,
      [username, email, phone]
    );
    return existing;
  },

  async createCustomer(connection, userData) {
    const { username, passwordHash, cleanEmail, cleanPhone, full_name, cleanGender, cleanDob } = userData;
    
    // 1. Thêm vào bảng `users`
    const [userResult] = await connection.query(
      `INSERT INTO users (username, password, email, phone, role, is_active) 
       VALUES (?, ?, ?, ?, 'customer', 1)`,
      [username, passwordHash, cleanEmail, cleanPhone]
    );

    const userId = userResult.insertId;

    // 2. Thêm vào bảng `customers`
    await connection.query(
      `INSERT INTO customers (user_id, full_name, gender, date_of_birth) 
       VALUES (?, ?, ?, ?)`,
      [userId, full_name.trim(), cleanGender, cleanDob]
    );

    return userId;
  },

  async findCustomerEmail(email) {
    const [users] = await pool.query(
      "SELECT id FROM users WHERE email = ? AND is_active = 1 AND role = 'customer'",
      [email]
    );
    return users[0] || null;
  },

  async expireExistingResets(connection, userId) {
    await connection.query(
      'UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
      [userId]
    );
  },

  async createPasswordReset(connection, userId, tokenHash) {
    await connection.query(
      'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))',
      [userId, tokenHash]
    );
  },

  async findValidResetToken(connection, tokenHash) {
    const [resets] = await connection.query(
      `SELECT id, user_id FROM password_resets
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()
       FOR UPDATE`,
      [tokenHash]
    );
    return resets[0] || null;
  },

  async updatePassword(connection, userId, passwordHash) {
    await connection.query('UPDATE users SET password = ? WHERE id = ?', [passwordHash, userId]);
  },

  async markResetTokenAsUsed(connection, resetId) {
    await connection.query('UPDATE password_resets SET used_at = NOW() WHERE id = ?', [resetId]);
  }
};

module.exports = User;