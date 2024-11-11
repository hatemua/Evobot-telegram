function showUserMenu(bot, chatId) {
  const menuOptions = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "🖼️ Visualize NFT", callback_data: "visualize_nft" }],
        [{ text: "💸 Send Massa", callback_data: "send_massa" }],
        [{ text: "📥 Receive Massa", callback_data: "receive_massa" }],
        [{ text: "🏦 Withdraw", callback_data: "withdraw" }],
        [{ text: "💰 Check Balance", callback_data: "check_balance" }],
      ],
    }),
  };

  bot.sendMessage(chatId, "📋 Choose an option from the menu:", menuOptions);
}

module.exports = { showUserMenu };
