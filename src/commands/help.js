function handleHelp(bot, msg) {
  const chatId = msg.chat.id;
  const helpMessage = `
📚 Evobots Help Center

Here are some commands to help you get started:

- 🚀 /start - Begin your journey with Evobots
- 🔐 /create_wallet - Generate your own Massa wallet
- 📈 /check_evolution - Check the current evolution status of your Evobot
- ⚙️ /trigger_action - Trigger actions to evolve your Evobot
- 💸 /withdraw - Withdraw your Evobot NFT to your personal wallet

If you have any questions, feel free to ask. We're here to help! 🤖
`;

  bot.sendMessage(chatId, helpMessage);
}

module.exports = { handleHelp };
