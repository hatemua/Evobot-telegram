const { Account: KeyPair, Web3Provider } = require("@massalabs/massa-web3");
const User = require("../models/User");
const { showUserMenu } = require("./menu");

async function handleCreateWallet(bot, chatId) {
  try {
    // Log the start of the wallet creation process
    console.log("Creating wallet for user:", chatId);

    // Check if user already has a wallet
    const existingUser = await User.findOne({ telegramId: chatId });
    if (existingUser) {
      console.log(
        `Wallet already exists for user ${chatId}: ${existingUser.walletAddress}`
      );
      bot.sendMessage(
        chatId,
        "You already have a wallet associated with your account. Redirecting to menu..."
      );
      showUserMenu(bot, chatId); // Redirect to the menu
      return;
    }

    // Will create a new KeyPair
    const keyPair = await KeyPair.generate();
    // Will use the KeyPair to create a Provider
    const provider = Web3Provider.buildnet(keyPair);


    // Save wallet info to MongoDB
    const user = new User({
      telegramId: chatId,
      walletAddress: provider.account.address,
      privateKey: provider.account.privateKey,
    });
    await user.save();
    console.log("User saved to database:", user);

    // Send private key to the user
    bot.sendMessage(
      chatId,
      `Wallet created!\n\nAddress: ${provider.account.address}\n\nPrivate Key: ${provider.account.privateKey}\n\nPlease save your private key securely.`
    );

    // Display menu options with an inline keyboard
    showUserMenu(bot, chatId);
  } catch (error) {
    console.error("Error in handleCreateWallet:", error);
    bot.sendMessage(
      chatId,
      "An error occurred while creating your wallet. Please try again later."
    );
  }
}

module.exports = { handleCreateWallet };
