const fs = require('fs');
const path = require('path');
const multer = require('multer');

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const uploadDirectory = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    callback(null, filename);
  }
});

const imageFileFilter = (_req, file, callback) => {
  if (file.mimetype.startsWith('image/')) {
    callback(null, true);
    return;
  }

  callback(new Error('Chỉ được tải lên tệp hình ảnh.'));
};

const uploadProductImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    files: 5,
    fileSize: MAX_IMAGE_SIZE_BYTES
  }
});

const uploadProductImagesMiddleware = (req, res, next) => {
  uploadProductImages.array('images', 5)(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ success: false, message: 'Mỗi ảnh không được vượt quá 5 MB.' });
      return;
    }

    res.status(400).json({ success: false, message: error.message || 'Tệp tải lên không hợp lệ.' });
  });
};

module.exports = { uploadProductImages, uploadProductImagesMiddleware, uploadDirectory };