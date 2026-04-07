const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const routes = require("./routes/index");

dotenv.config();

connectDB();

const app = express();

// Sử dụng các Middleware cơ bản
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Định tuyến API (Base Route)
app.use("/api", routes);

// Route mặc định để kiểm tra server sống hay chết
app.get("/", (req, res) => {
  res.send("Hí nhô, thi lệ mà đá banhhhh");
});

// Xử lý lỗi 404 cho những route không tồn tại
app.use((req, res, next) => {
  res.status(404).json({ message: "Route không tồn tại" });
});

// Khởi động Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Máy chủ đang chạy trên cổng ${PORT}`);
});
