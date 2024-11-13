// models/EvolutionHistory.js
const mongoose = require("mongoose");

const evolutionHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  evolutionId: { type: String, required: true },
  evolutionDate: { type: Date, default: Date.now },
  step: { type: String },
  executed: { type: Boolean },
  transaction : { type: Boolean }
});

module.exports = mongoose.model("EvolutionHistory", evolutionHistorySchema);
