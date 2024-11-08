const TelegramBot = require("node-telegram-bot-api");
const config = require("./config/config");
const { handleStart } = require("./commands/start");
const { handleMenu } = require("./commands/menu");
const { handleLinkWallet } = require("./commands/linkWallet");
const { handleCheckEvolution } = require("./commands/checkEvolution");
const { handleTriggerAction } = require("./commands/triggerAction");
const { handleWithdraw } = require("./commands/withdraw");
const { connectToDatabase } = require("./config/database");
const { handleCreateWallet } = require("./commands/createWallet");
const {
  handleVisualizeNFT,
  handleSendMassa,
  handleReceiveMassa,
  handleBuyCameleon,
  handleSendMassaManual,
  handleSendMassaQr,
  handleCheckBalance,
} = require("./commands/actions");

// Connect to the database
connectToDatabase();

// Initialize bot
const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true });

// Register the /start command to show welcome message and "Start" button
bot.onText(/\/start/, (msg) => handleStart(bot, msg));

// Handle callback queries for inline buttons
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const action = query.data;

  console.log("Received callback query with action:", action);

  if (action === "start_menu") {
    handleMenu(bot, chatId);
  } else if (action === "create_wallet") {
    handleCreateWallet(bot, chatId);
  } else if (action === "visualize_nft") {
    handleVisualizeNFT(bot, chatId);
  } else if (action === "send_massa") {
    handleSendMassa(bot, chatId);
  } else if (action === "receive_massa") {
    handleReceiveMassa(bot, chatId);
  } else if (action === "send_massa_qr") {
    handleSendMassaQr(bot, chatId);
  } else if (action === "send_massa_manual") {
    handleSendMassaManual(bot, chatId);
  } else if (action === "check_balance") {
    handleCheckBalance(bot, chatId);
  } else if (action === "buy_cameleon") {
    handleBuyCameleon(bot, chatId);
  } else if (action === "withdraw") {
    handleWithdraw(bot, chatId);
  }

  // Acknowledge the callback query
  bot.answerCallbackQuery(query.id);
});

module.exports = bot;
