const {
  checkEvolutionStatus,
  updateEvolutionStage,
} = require("../services/evolutionService");

function handleWithdraw(bot, msg) {
  const chatId = msg.chat.id;

  // Verify if the user has completed all evolutions
  const evolutionStage = checkEvolutionStatus(chatId);

  if (evolutionStage !== "Stage 4/5") {
    bot.sendMessage(
      chatId,
      "Complete all evolutions before you can withdraw your NFT."
    );
    return;
  }

  // Update evolution stage to completed
  updateEvolutionStage(chatId, "Stage 5/5 (Complete)");
  bot.sendMessage(
    chatId,
    "Your Evobot NFT has been successfully withdrawn to your wallet!"
  );
}

module.exports = { handleWithdraw };
