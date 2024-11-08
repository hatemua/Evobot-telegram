const { updateEvolutionStage } = require('../services/evolutionService');

function handleTriggerAction(bot, msg) {
  const chatId = msg.chat.id;

  const options = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "Send Massa", callback_data: "send_massa" }],
        [{ text: "Receive Massa", callback_data: "receive_massa" }],
        [{ text: "Buy CameleonZ NFT", callback_data: "buy_cameleonz" }]
      ]
    })
  };

  bot.sendMessage(chatId, "Choose an action to evolve your Evobot:", options);

  // Handle the selected actions
  bot.on('callback_query', (query) => {
    const action = query.data;
    const chatId = query.message.chat.id;

    if (action === "send_massa") {
      updateEvolutionStage(chatId, "Stage 2/5");
      bot.sendMessage(chatId, "Evolution triggered by sending Massa! You are now at Stage 2/5.");
    } else if (action === "receive_massa") {
      updateEvolutionStage(chatId, "Stage 3/5");
      bot.sendMessage(chatId, "Evolution triggered by receiving Massa! You are now at Stage 3/5.");
    } else if (action === "buy_cameleonz") {
      updateEvolutionStage(chatId, "Stage 4/5");
      bot.sendMessage(chatId, "Evolution triggered by buying a CameleonZ NFT! You are now at Stage 4/5.");
    }
  });
}

module.exports = { handleTriggerAction };
