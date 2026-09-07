const pool = require('../../config/database');

/**
 * Lấy thông tin hồ sơ cá nhân
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [[profile]] = await pool.query(
      `SELECT u.id AS user_id, u.username, u.email, u.phone, u.created_at,
              c.id AS customer_id, c.full_name, c.gender, c.date_of_birth, c.avatar_url
       FROM users u
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin người dùng' });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Cập nhật thông tin cá nhân
 */
exports.updateProfile = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const { full_name, gender, date_of_birth, avatar_url, phone } = req.body;

    // Cập nhật SĐT ở bảng users nếu có
    if (phone) {
      await connection.query(`UPDATE users SET phone = ? WHERE id = ?`, [phone, userId]);
    }

    // Kiểm tra xem đã có record ở bảng customers chưa
    const [[customer]] = await connection.query(`SELECT id FROM customers WHERE user_id = ?`, [userId]);

    if (customer) {
      await connection.query(
        `UPDATE customers 
         SET full_name = COALESCE(?, full_name),
             gender = COALESCE(?, gender),
             date_of_birth = COALESCE(?, date_of_birth),
             avatar_url = COALESCE(?, avatar_url)
         WHERE user_id = ?`,
        [full_name, gender, date_of_birth, avatar_url, userId]
      );
    } else {
      await connection.query(
        `INSERT INTO customers (user_id, full_name, gender, date_of_birth, avatar_url)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, full_name, gender, date_of_birth, avatar_url]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Cập nhật hồ sơ thành công' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

/**
 * Lấy danh sách sổ địa chỉ
 */
exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const [addresses] = await pool.query(
      `SELECT id, recipient_name, phone, address_line, specific_address, 
              ward_name, district_name, province_name, is_default
       FROM customer_addresses
       WHERE user_id = ?
       ORDER BY is_default DESC, id DESC`,
      [userId]
    );

    res.json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Thêm địa chỉ nhận hàng mới
 */
exports.addAddress = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const { recipient_name, phone, address_line, specific_address, ward_name, district_name, province_name, is_default = 0 } = req.body;

    // Nếu đặt địa chỉ mới làm mặc định, hủy mặc định của các địa chỉ cũ
    if (Number(is_default) === 1) {
      await connection.query(`UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?`, [userId]);
    }

    await connection.query(
      `INSERT INTO customer_addresses (user_id, recipient_name, phone, address_line, specific_address, ward_name, district_name, province_name, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, recipient_name, phone, address_line, specific_address, ward_name, district_name, province_name, is_default]
    );

    await connection.commit();
    res.json({ success: true, message: 'Thêm địa chỉ mới thành công' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};