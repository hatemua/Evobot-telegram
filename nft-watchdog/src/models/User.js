// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true },
  privateKey: { type: String, required: true },
  nftMinted: { type: Boolean, default: false },
  mintDate: { type: Date },
  tokenId: { type: Number },
  transactionSended : { type: Boolean, default: false }

});

module.exports = mongoose.model("User", userSchema);
