const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const protect = require("../middleware/authMiddleware");

// Bắt buộc đăng nhập
router.use(protect);

router.get("/", groupController.getAll);
router.post("/", groupController.create);
router.get("/:id", groupController.getById);
router.put("/:id", groupController.update);
router.delete("/:id", groupController.delete);

module.exports = router;
