const multer = require("multer");

// lưu file vào ram
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // kimt 5MB
});

module.exports = upload;
