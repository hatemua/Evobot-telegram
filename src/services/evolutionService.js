const userData = {};

function checkEvolutionStatus(chatId) {
  return userData[chatId]?.evolutionStage || "Stage 1/5";
}

function updateEvolutionStage(chatId, stage) {
  userData[chatId] = userData[chatId] || {};
  userData[chatId].evolutionStage = stage;
}

module.exports = { checkEvolutionStatus, updateEvolutionStage };
