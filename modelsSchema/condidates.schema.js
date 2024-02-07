const mongoose = require("mongoose");

const CondidatesSchema = mongoose.Schema(
  {
    fullName: { type: String },
    admin: { type: Boolean },
    step: { type: String },
    chatId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Condidates", CondidatesSchema);
