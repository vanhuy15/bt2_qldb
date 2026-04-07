const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const authController = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // check email
      const userExists = await User.findOne({ email });
      if (userExists)
        return res.status(400).json({ message: "Email đã tồn tại" });

      await User.create({ username, email, password });

      res.status(201).json({
        message: "Đăng ký thành công, vui lòng đăng nhập để lấy token",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      // check account
      if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
          message: "Đăng nhập thành công",
          token: generateToken(user._id),
        });
      } else {
        res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = authController;
