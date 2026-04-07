const User = require("../models/User");

const userController = {
  // get all user (điều kiện là delete: false)
  getAll: async (req, res) => {
    try {
      const users = await User.find({ is_deleted: false }).select("-password");
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // get user by id
  getById: async (req, res) => {
    try {
      const user = await User.findOne({
        _id: req.params.id,
        is_deleted: false,
      }).select("-password");
      if (!user)
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // update information user
  update: async (req, res) => {
    try {
      if (req.body.password) {
        delete req.body.password;
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: req.params.id, is_deleted: false },
        req.body,
        { new: true },
      ).select("-password");

      if (!updatedUser)
        return res
          .status(404)
          .json({ message: "Không tìm thấy người dùng để cập nhật" });

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // bai bai bé bi
  delete: async (req, res) => {
    try {
      const deletedUser = await User.findOneAndUpdate(
        { _id: req.params.id, is_deleted: false },
        { is_deleted: true },
        { new: true },
      );

      if (!deletedUser)
        return res.status(404).json({
          message: "Người dùng không tồn tại hoặc đã bị xóa trước đó",
        });

      res.status(200).json({ message: "Đã xóa người dùng thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = userController;
