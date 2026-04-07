const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const contactRoutes = require("./contactRoutes");
const groupRoutes = require("./groupRoutes");
const userRoutes = require("./userRoutes");

// Khai báo các endpoint
router.use("/auth", authRoutes);
router.use("/contacts", contactRoutes);
router.use("/groups", groupRoutes);
router.use("/users", userRoutes);

module.exports = router;
