const mongoose = require("mongoose");
const config = require("./config");


async function connectToDatabase() {
  try {
    // Ensure config.MONGODB_URI is passed as a string
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

module.exports = { connectToDatabase };
