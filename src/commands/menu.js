// src/commands/menu.js

// Function to display the user menu
function showUserMenu(bot, chatId) {
  const menuOptions = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Visualize NFT", callback_data: "visualize_nft" }],
        [{ text: "Send Massa", callback_data: "send_massa" }],
        [{ text: "Receive Massa", callback_data: "receive_massa" }],
        [{ text: "Buy Cameleon", callback_data: "buy_cameleon" }],
        [{ text: "Withdraw", callback_data: "withdraw" }],
        [{ text: "Check Balance", callback_data: "check_balance" }],
      ],
    },
  };

  bot.sendMessage(chatId, "Choose an option:", menuOptions);
}
module.exports = { showUserMenu };
