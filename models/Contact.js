const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: {
      street: String,
      city: String,
    },
    company: { type: String },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Các trường phục vụ điểm cộng và filter
    is_favorite: { type: Boolean, default: false },
    interactions: [
      {
        date: { type: Date, default: Date.now },
        note: String,
      },
    ],
    interaction_count: { type: Number, default: 0 },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Contact", contactSchema);
