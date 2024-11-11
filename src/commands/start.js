function handleStart(bot, msg) {
  const chatId = msg.chat.id;

  const options = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "🚀 Create Wallet", callback_data: "create_wallet" }],
        [{ text: "👛 Already have a wallet ?", callback_data: "view_wallet" }],
        [{ text: "📚 Help", callback_data: "help" }],
      ],
    }),
  };

  const welcomeMessage = `
👋 *Hello, welcome to Evobots!*

We're excited to have you join us on this adventure. 🤖 With Evobots, you can create your own *Massa blockchain wallet* and manage it directly here.

🛠️ To get started, click on the *"Create Wallet"* button below. Once your wallet is created, you’ll receive a private key — *make sure to keep it safe!* 🔒

If you need any help, feel free to reach out at any time. We're here to make your journey smooth and enjoyable!

👉 *Click on "Create Wallet" to begin your journey!*
`;

  bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: "Markdown",
    ...options,
  });
}

module.exports = { handleStart };
