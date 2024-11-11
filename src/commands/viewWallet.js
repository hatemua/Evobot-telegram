const User = require("../models/User");
const { showUserMenu } = require("./menu");

async function handleViewWallet(bot, chatId) {
  try {
    // Check if the user already has a wallet
    const existingUser = await User.findOne({ telegramId: chatId });

    if (existingUser) {
      // If the user has a wallet, display their wallet address
      const walletMessage = `
👛 *Your Wallet Information*

- *Wallet Address*: \`${existingUser.walletAddress}\`

Remember to keep your private key safe! If you need any further assistance, use the *Help* button below. 📚
      `;
      bot.sendMessage(chatId, walletMessage, { parse_mode: "Markdown" });
      showUserMenu(bot, chatId); // Redirect to main menu
    } else {
      // If no wallet exists, prompt the user to create one
      bot.sendMessage(
        chatId,
        "It seems you don't have a wallet yet. Use the *Create Wallet* option to generate one!",
        { parse_mode: "Markdown" }
      );
    }
  } catch (error) {
    console.error("Error in handleViewWallet:", error);
    bot.sendMessage(
      chatId,
      "An error occurred while retrieving your wallet information. Please try again later."
    );
  }
}

module.exports = { handleViewWallet };
