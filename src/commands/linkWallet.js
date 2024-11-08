const { linkWallet } = require('../services/walletService');

function handleLinkWallet(bot, msg) {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Please enter your Massa wallet address:");
  
  bot.on('message', (msg) => {
    const walletAddress = msg.text;
    linkWallet(chatId, walletAddress);
    bot.sendMessage(chatId, `Wallet linked successfully: ${walletAddress}`);
  });
}

module.exports = { handleLinkWallet };
