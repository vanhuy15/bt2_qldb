const mongoose = require("mongoose");
const Contact = require("../models/Contact");
const Group = require("../models/Group");
const getGenericController = require("./genericController");
const xlsx = require("xlsx");

const baseCRUD = getGenericController(Contact);

const contactController = {
  ...baseCRUD,

  // lấy tất cả liên hệ của user A
  getContactsByUser: async (req, res) => {
    try {
      const userId = req.params.userId || req.user.id;
      const contacts = await Contact.find({ owner: userId, is_deleted: false });
      res.status(200).json(contacts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // lấy các liên hệ thuộc nhóm “Bạn bè”
  getContactsByGroupName: async (req, res) => {
    try {
      const groupName = req.query.groupName || "Bạn bè";
      const group = await Group.findOne({
        name: groupName,
        owner: req.user.id,
      });
      if (!group) return res.status(200).json([]);

      const contacts = await Contact.find({
        group: group._id,
        is_deleted: false,
      });
      res.status(200).json(contacts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // tìm liên hệ theo tên “Nguyễn Văn A”
  searchByName: async (req, res) => {
    try {
      const { name } = req.query;
      const contacts = await Contact.find({
        name: { $regex: name, $options: "i" },
        owner: req.user.id,
        is_deleted: false,
      });
      res.status(200).json(contacts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // lấy các liên hệ yêu thích
  getFavorites: async (req, res) => {
    try {
      const contacts = await Contact.find({
        is_favorite: true,
        owner: req.user.id,
        is_deleted: false,
      });
      res.status(200).json(contacts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // sắp xếp danh bạ theo tên tăng dần
  getSortedByName: async (req, res) => {
    try {
      const contacts = await Contact.find({
        owner: req.user.id,
        is_deleted: false,
      }).sort({ name: 1 });
      res.status(200).json(contacts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // lấy các liên hệ thuộc công ty “FPT”
  getByCompany: async (req, res) => {
    try {
      const companyName = req.query.company || "FPT";
      const contacts = await Contact.find({
        company: { $regex: companyName, $options: "i" },
        owner: req.user.id,
        is_deleted: false,
      });
      res.status(200).json(contacts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // lọc các liên hệ ở Hà Nội và thuộc nhóm “Công việc”
  getHanoiWorkContacts: async (req, res) => {
    try {
      const group = await Group.findOne({
        name: "Công việc",
        owner: req.user.id,
      });
      if (!group) return res.status(200).json([]);

      const contacts = await Contact.find({
        "address.city": "Hà Nội",
        group: group._id,
        owner: req.user.id,
        is_deleted: false,
      });
      res.status(200).json(contacts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // hiển thị liên hệ kèm tên group
  getContactsWithGroupInfo: async (req, res) => {
    try {
      const contacts = await Contact.find({
        owner: req.user.id,
        is_deleted: false,
      }).populate("group", "name");
      res.status(200).json(contacts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // thống kê số liên hệ theo thành phố
  getStatsByCity: async (req, res) => {
    try {
      const stats = await Contact.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(req.user.id),
            is_deleted: false,
          },
        },
        { $group: { _id: "$address.city", totalContacts: { $sum: 1 } } },
        { $sort: { totalContacts: -1 } },
      ]);
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // tìm top 3 group có nhiều liên hệ nhất
  getTop3Groups: async (req, res) => {
    try {
      const topGroups = await Contact.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(req.user.id),
            is_deleted: false,
            group: { $ne: null },
          },
        },
        { $group: { _id: "$group", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 },
        // lấy tên group ra
        {
          $lookup: {
            from: "groups",
            localField: "_id",
            foreignField: "_id",
            as: "groupInfo",
          },
        },
        { $unwind: "$groupInfo" },
        { $project: { _id: 1, count: 1, groupName: "$groupInfo.name" } },
      ]);
      res.status(200).json(topGroups);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // tìm các liên hệ có số điện thoại bị trùng
  getDuplicatePhones: async (req, res) => {
    try {
      const duplicates = await Contact.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(req.user.id),
            is_deleted: false,
          },
        },
        {
          $group: {
            _id: "$phone",
            count: { $sum: 1 },
            contacts: { $push: "$name" },
          },
        },
        { $match: { count: { $gt: 1 } } },
      ]);
      res.status(200).json(duplicates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // tìm các liên hệ chưa từng có tương tác
  getNoInteractions: async (req, res) => {
    try {
      const contacts = await Contact.find({
        interaction_count: 0,
        owner: req.user.id,
        is_deleted: false,
      });
      res.status(200).json(contacts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // tính số lần tương tác trung bình của mỗi liên hệ
  getAvgInteractions: async (req, res) => {
    try {
      const result = await Contact.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(req.user.id),
            is_deleted: false,
          },
        },
        {
          $group: {
            _id: null,
            avgInteractions: { $avg: "$interaction_count" },
          },
        },
        {
          $project: {
            _id: 0,
            avgInteractions: { $round: ["$avgInteractions", 2] },
          },
        },
      ]);
      res.status(200).json(result[0] || { avgInteractions: 0 });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // thống kê số liên hệ được tạo theo từng tháng
  getStatsByMonth: async (req, res) => {
    try {
      const stats = await Contact.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(req.user.id),
            is_deleted: false,
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            total: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // export danh bạ ra file Excel
  exportContacts: async (req, res) => {
    try {
      const contacts = await Contact.find({
        owner: req.user.id,
        is_deleted: false,
      }).populate("group", "name");

      const excelData = contacts.map((c, index) => ({
        STT: index + 1,
        "Họ Tên": c.name,
        "Số Điện Thoại": c.phone,
        Email: c.email || "",
        "Công Ty": c.company || "",
        "Thành Phố": c.address && c.address.city ? c.address.city : "",
        Nhóm: c.group ? c.group.name : "Chưa phân nhóm",
        "Yêu Thích": c.is_favorite ? "Có" : "Không",
        "Ngày Tạo": c.createdAt ? c.createdAt.toISOString().split("T")[0] : "",
      }));

      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(excelData);

      worksheet["!cols"] = [
        { wch: 5 },
        { wch: 20 },
        { wch: 15 },
        { wch: 25 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 10 },
        { wch: 15 },
      ];
      xlsx.utils.book_append_sheet(workbook, worksheet, "Danh_Ba");

      const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="DanhBa_Export.xlsx"',
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // import danh bạ từ file Excel-auto create groups
  importContacts: async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Vui lòng upload file Excel đính kèm" });
      }

      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      if (data.length === 0) {
        return res
          .status(400)
          .json({ message: "File Excel rỗng, không có dữ liệu" });
      }

      // lọc tên và sđt
      const validRows = data.filter((row) => {
        const name = row["Họ Tên"] || row["Name"] || row["name"];
        const phone = row["Số Điện Thoại"] || row["Phone"] || row["phone"];
        return name && phone && phone !== "undefined";
      });

      if (validRows.length === 0) {
        return res.status(400).json({
          message: "Không tìm thấy dữ liệu hợp lệ (thiếu Tên hoặc SĐT)",
        });
      }

      // auto xử lý Group
      const excelGroupNames = [
        ...new Set(
          validRows.map((row) => row["Nhóm"] || row["Group"]).filter(Boolean),
        ),
      ];

      // check xem DB có sẵn chưa
      let existingGroups = await Group.find({
        owner: req.user.id,
        name: { $in: excelGroupNames },
        is_deleted: false,
      });
      let existingGroupNames = existingGroups.map((g) => g.name);

      // lọc ra những Nhóm có trong Excel nhưng CHƯA có trong DB để chuẩn bị tạo mới
      const groupsToCreate = excelGroupNames
        .filter((name) => !existingGroupNames.includes(name))
        .map((name) => ({ name, owner: req.user.id }));

      // tạo các Nhóm mới (nếu có)
      if (groupsToCreate.length > 0) {
        const newGroups = await Group.insertMany(groupsToCreate);
        existingGroups = [...existingGroups, ...newGroups];
      }
      const groupMap = {};
      existingGroups.forEach((g) => {
        groupMap[g.name] = g._id;
      });

      // chuẩn bị dữ liệu Contact để Insert
      const contactsToInsert = validRows.map((row) => {
        let contact = {
          name: row["Họ Tên"] || row["Name"] || row["name"],
          phone: String(row["Số Điện Thoại"] || row["Phone"] || row["phone"]),
          email: row["Email"] || row["email"] || "",
          company: row["Công Ty"] || row["Company"] || row["company"] || "",
          address: { city: row["Thành Phố"] || row["City"] || "" },
          is_favorite: String(row["Yêu Thích"] || "").toLowerCase() === "có",
          owner: req.user.id,
        };

        // nếu file Excel có điền tên Nhóm, tự động móc nối ID Nhóm vào Contact
        const gName = row["Nhóm"] || row["Group"];
        if (gName && groupMap[gName]) {
          contact.group = groupMap[gName];
        }

        return contact;
      });

      // lưu toàn bộ Contact vào DB
      await Contact.insertMany(contactsToInsert);

      res.status(200).json({
        message: `Đã Import thành công ${contactsToInsert.length} liên hệ và đồng bộ xong các Nhóm!`,
        ignored: data.length - contactsToInsert.length,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = contactController;
