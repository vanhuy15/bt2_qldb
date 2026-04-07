const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // THÊM DÒNG NÀY

router.use(protect);

// api import / export excel
router.get("/export", contactController.exportContacts);
router.post("/import", upload.single("file"), contactController.importContacts);

// api thống kê
router.get("/stats/city", contactController.getStatsByCity);
router.get("/stats/top-groups", contactController.getTop3Groups);
router.get("/stats/avg-interactions", contactController.getAvgInteractions);
router.get("/stats/month", contactController.getStatsByMonth);

// api lọc và tìm kiếm
router.get("/search", contactController.searchByName);
router.get("/favorites", contactController.getFavorites);
router.get("/sorted", contactController.getSortedByName);
router.get("/company", contactController.getByCompany);
router.get("/hanoi-work", contactController.getHanoiWorkContacts);
router.get("/with-group", contactController.getContactsWithGroupInfo);
router.get("/group-name", contactController.getContactsByGroupName);
router.get("/duplicates", contactController.getDuplicatePhones);
router.get("/no-interactions", contactController.getNoInteractions);

router.get("/user/:userId", contactController.getContactsByUser);

router.get("/", contactController.getAll);
router.post("/", contactController.create);

router.get("/:id", contactController.getById);
router.put("/:id", contactController.update);
router.delete("/:id", contactController.delete);

module.exports = router;
