const { checkEvolutionStatus } = require("../services/evolutionService");

function handleCheckEvolution(bot, msg) {
  const chatId = msg.chat.id;

  // Get evolution status from the service
  const evolutionStage = checkEvolutionStatus(chatId);
  bot.sendMessage(chatId, `Your Evobot is currently at ${evolutionStage}.`);
}

module.exports = { handleCheckEvolution };
