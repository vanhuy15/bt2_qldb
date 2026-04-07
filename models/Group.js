const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Group", groupSchema);
