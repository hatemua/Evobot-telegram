const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true },
  privateKey: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
