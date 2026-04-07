const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Không dùng middleware protect ở đây vì chưa đăng nhập lấy gì có token
router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;
