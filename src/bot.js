const TelegramBot = require("node-telegram-bot-api");
const config = require("./config/config");
const { handleStart } = require("./commands/start");
const { handleMenu, showUserMenu } = require("./commands/menu");
const { connectToDatabase } = require("./config/database");
const { handleCreateWallet } = require("./commands/createWallet");
const {
  handleVisualizeNFT,
  handleSendMassa,
  handleReceiveMassa,
  handleSendMassaManual,
  handleSendMassaQr,
  handleCheckBalance,
  handleVisualizeEvobots,
  handleVisualizeCameleonz,
  handleWithdraw,
} = require("./commands/actions");
const { handleHelp } = require("./commands/help");
const { handleViewWallet } = require("./commands/viewWallet");
const { setBotProfilePicture } = require("./services/botService");

// Connect to the database
connectToDatabase();

// Initialize bot
const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true });

setBotProfilePicture(bot);

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
  } else if (action === "visualize_evobots") {
    handleVisualizeEvobots(bot, chatId);
  } else if (action === "visualize_cameleonz") {
    handleVisualizeCameleonz(bot, chatId);
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
  } else if (action === "view_wallet") {
    handleViewWallet(bot, chatId);
  } else if (action === "help") {
    handleHelp(bot, query.message);
  } else if (action === "withdraw") {
    handleWithdraw(bot, chatId);
  } else if (action === "back_to_menu") {
    showUserMenu(bot, chatId); // Display the main menu
  }

  // Acknowledge the callback query
  bot.answerCallbackQuery(query.id);
});

module.exports = bot;
