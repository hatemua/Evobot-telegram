// File: src/services/botService.js
const fs = require("fs");
const path = require("path");

async function setBotProfilePicture(bot) {
  const imagePath = path.join(__dirname, "..", "images", "avatar.jpg"); // Adjust path to your image location

  try {
    // Set the bot's profile picture using the local image file
    await bot.setMyProfilePhoto(fs.createReadStream(imagePath));
    console.log("Bot profile picture updated successfully!");
  } catch (error) {
    console.error("Failed to update bot profile picture:", error);
  }
}

module.exports = { setBotProfilePicture };
