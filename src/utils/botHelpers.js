// File: src/utils/sendMessageWithBackButton.js

function sendMessageWithBackButton(bot, chatId, text) {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Back to Menu", callback_data: "back_to_menu" }],
      ],
    },
  };

  bot.sendMessage(chatId, text, options);
}

module.exports = { sendMessageWithBackButton };
