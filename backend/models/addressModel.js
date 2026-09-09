// models/addressModel.js
const pool = require('../config/database');

const Address = {
  // 1. Lấy danh sách tất cả địa chỉ của User
  async getByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT 
        id, user_id, recipient_name, phone,
        province_code, province_name,
        district_code, district_name,
        ward_code, ward_name,
        specific_address, address_line, is_default, created_at
       FROM customer_addresses
       WHERE user_id = ?
       ORDER BY is_default DESC, id DESC`,
      [userId]
    );
    return rows;
  },

  // 2. Lấy chi tiết 1 địa chỉ theo ID (thuộc về User)
  async getById(addressId, userId) {
    const [rows] = await pool.query(
      `SELECT * FROM customer_addresses 
       WHERE id = ? AND user_id = ?`,
      [addressId, userId]
    );
    return rows[0] || null;
  },

  // 3. Tạo địa chỉ mới
  async create(userId, addressData) {
    const {
      recipient_name,
      phone,
      province_code,
      province_name,
      district_code,
      district_name,
      ward_code,
      ward_name,
      specific_address,
      address_line,
      is_default = 0
    } = addressData;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Nếu địa chỉ mới là mặc định (is_default = 1), bỏ mặc định của các địa chỉ cũ
      if (Number(is_default) === 1) {
        await connection.query(
          `UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?`,
          [userId]
        );
      }

      const [result] = await connection.query(
        `INSERT INTO customer_addresses (
          user_id, recipient_name, phone,
          province_code, province_name,
          district_code, district_name,
          ward_code, ward_name,
          specific_address, address_line, is_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          recipient_name,
          phone,
          province_code || null,
          province_name || null,
          district_code || null,
          district_name || null,
          ward_code || null,
          ward_name || null,
          specific_address || null,
          address_line,
          is_default ? 1 : 0
        ]
      );

      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // 4. Cập nhật địa chỉ
  async update(addressId, userId, addressData) {
    const {
      recipient_name,
      phone,
      province_code,
      province_name,
      district_code,
      district_name,
      ward_code,
      ward_name,
      specific_address,
      address_line,
      is_default
    } = addressData;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Nếu cập nhật thành mặc định (is_default = 1), bỏ mặc định của các địa chỉ khác
      if (Number(is_default) === 1) {
        await connection.query(
          `UPDATE customer_addresses SET is_default = 0 WHERE user_id = ? AND id != ?`,
          [userId, addressId]
        );
      }

      const [result] = await connection.query(
        `UPDATE customer_addresses SET
          recipient_name = ?,
          phone = ?,
          province_code = ?,
          province_name = ?,
          district_code = ?,
          district_name = ?,
          ward_code = ?,
          ward_name = ?,
          specific_address = ?,
          address_line = ?,
          is_default = ?
        WHERE id = ? AND user_id = ?`,
        [
          recipient_name,
          phone,
          province_code || null,
          province_name || null,
          district_code || null,
          district_name || null,
          ward_code || null,
          ward_name || null,
          specific_address || null,
          address_line,
          is_default ? 1 : 0,
          addressId,
          userId
        ]
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // 5. Đặt địa chỉ làm mặc định
  async setDefault(addressId, userId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Đưa tất cả địa chỉ của user về 0
      await connection.query(
        `UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?`,
        [userId]
      );

      // Đặt địa chỉ được chọn thành 1
      const [result] = await connection.query(
        `UPDATE customer_addresses SET is_default = 1 WHERE id = ? AND user_id = ?`,
        [addressId, userId]
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // 6. Xóa địa chỉ
  async delete(addressId, userId) {
    const [result] = await pool.query(
      `DELETE FROM customer_addresses WHERE id = ? AND user_id = ?`,
      [addressId, userId]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Address;