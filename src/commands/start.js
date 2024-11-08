// src/commands/start.js

function handleStart(bot, msg) {
  const chatId = msg.chat.id;

  const options = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "Create Wallet", callback_data: "create_wallet" }],
      ],
    }),
  };

  bot.sendMessage(
    chatId,
    "Welcome to Evobots! Click 'Create Wallet' to generate a new wallet.",
    options
  );
}

module.exports = { handleStart };
