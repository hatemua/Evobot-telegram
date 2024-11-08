function handleHelp(bot, msg) {
  const chatId = msg.chat.id;
  const helpMessage = `
      Available commands:
      /link_wallet - Link your Massa wallet
      /check_evolution - Check evolution status
      /trigger_action - Trigger an evolution action
      /withdraw - Withdraw your Evobot NFT
    `;
  bot.sendMessage(chatId, helpMessage);
}

module.exports = { handleHelp };
