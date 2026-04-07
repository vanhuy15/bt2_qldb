const getGenericController = (Model) => {
  return {
    getAll: async (req, res) => {
      try {
        const data = await Model.find({
          owner: req.user.id,
          is_deleted: false,
        });
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    getById: async (req, res) => {
      try {
        const data = await Model.findOne({
          _id: req.params.id,
          owner: req.user.id,
          is_deleted: false,
        });
        if (!data)
          return res.status(404).json({ message: "Không tìm thấy dữ liệu" });
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    create: async (req, res) => {
      try {
        const newData = new Model({ ...req.body, owner: req.user.id });
        const savedData = await newData.save();
        res.status(201).json(savedData);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    },

    update: async (req, res) => {
      try {
        const updatedData = await Model.findOneAndUpdate(
          { _id: req.params.id, owner: req.user.id, is_deleted: false },
          req.body,
          { new: true },
        );

        if (!updatedData) {
          return res
            .status(404)
            .json({ message: "Dữ liệu không tồn tại hoặc đã bị xóa trước đó" });
        }

        res.status(200).json(updatedData);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    },

    // xóa mềm
    delete: async (req, res) => {
      try {
        const deletedData = await Model.findOneAndUpdate(
          { _id: req.params.id, owner: req.user.id, is_deleted: false },
          { is_deleted: true },
          { new: true },
        );

        if (!deletedData) {
          return res.status(404).json({
            message: "Dữ liệu không tồn tại hoặc đã được let him cook hehehe",
          });
        }

        // Xóa thành công
        res.status(200).json({ message: "Đã let him cook :)))" });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },
  };
};

module.exports = getGenericController;
