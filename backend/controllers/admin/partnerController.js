const pool = require('../../config/database');

exports.getPartners = async (req, res) => {
  try {
    const { search = '' } = req.query;
    let query = 'SELECT * FROM partners';
    const params = [];

    if (search.trim()) {
      query += ' WHERE name LIKE ? OR supply_type LIKE ?';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    query += ' ORDER BY id DESC';
    const [rows] = await pool.query(query, params);

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPartner = async (req, res) => {
  try {
    const { name, supply_type, details, quality_info } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Tên đối tác là bắt buộc' });
    }

    const [result] = await pool.query(
      `INSERT INTO partners (name, supply_type, details, quality_info) VALUES (?, ?, ?, ?)`,
      [name, supply_type || null, details || null, quality_info || null]
    );

    res.status(201).json({
      success: true,
      message: 'Thêm đối tác thành công',
      partnerId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, supply_type, details, quality_info } = req.body;

    const [result] = await pool.query(
      `UPDATE partners SET name = ?, supply_type = ?, details = ?, quality_info = ? WHERE id = ?`,
      [name, supply_type, details, quality_info, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Đối tác không tồn tại' });
    }

    res.json({ success: true, message: 'Cập nhật đối tác thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM partners WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Đối tác không tồn tại' });
    }

    res.json({ success: true, message: 'Xóa đối tác thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};