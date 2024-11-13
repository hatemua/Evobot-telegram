const {
  Account: KeyPair,
  Web3Provider,
  parseMas,
  SmartContract,
  Args,
  bytesToStr,
  MAX_GAS_CALL,
  ArrayTypes,
} = require("@massalabs/massa-web3");
const User = require("../models/User");
const EvolutionHistory = require("../models/Evolution");
const { showUserMenu } = require("./menu");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const privteKey = process.env.PRIVATE_KEY;

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
    const provider = Web3Provider.mainnet(keyPair);

    // Save wallet info to MongoDB
    const user = new User({
      telegramId: chatId,
      walletAddress: provider.account.address,
      privateKey: provider.account.privateKey,
    });
    await user.save();
    console.log("User saved to database:", user);

    const successMessage = `
    🎉 *Congratulations! Your wallet has been created!*
    
    🔑 *Wallet Address*: \`${provider.account.address}\`
    🗝️ *Private Key*: \`${provider.account.privateKey}\`
    
    *Important*: This wallet is internal ,Please make sure to save your private key securely! 🔒 It’s your access to your wallet, so keep it safe and never share it with anyone.
    You can withdraw any funds that you have in it after using it 
    
    Thank you for joining the Evobot family! 🤖
    `;

    // Send private key to the user
    bot.sendMessage(chatId, successMessage);

    // Placeholder function for minting an NFT
    console.log(
      `Minting NFT for user with wallet address: ${user.walletAddress}`
    );

    const keyPair1 = await KeyPair.fromPrivateKey(privteKey);
    const provider1 = Web3Provider.mainnet(keyPair1); // Assuming we are on mainnet
    const maxGas = MAX_GAS_CALL; // Set appropriate max gas limit
    const coins = BigInt(2 * 10 ** 8);
    const fee = BigInt(10 ** 7);

    try {
      // Prepare the function arguments
      const args = new Args().addString(user.walletAddress);

      const smartContract = new SmartContract(
        provider1,
        "AS1ntvH7FXYSfJjvptVM2t4X1Y9DJmRF29V34CxbJNtJkhQkPnAB"
      );

      // Call the transfer function on the smart contract
      const operation = await smartContract.call("mint", args, {
        coins,
        fee,
        maxGas,
      });
      console.log("id: ", operation.id);
      await new Promise((resolve) => setTimeout(resolve, 16000));
      user.nftMinted = true;
      user.mintDate = new Date();
      const lastIndexResult = await smartContract.read(
        "mintedTokens",
        new Args()
      );
     

      const lastIndex = Number(new Args(lastIndexResult.value).nextU64());
      console.log("minted tokens: ", lastIndex);
      let index = 0;
      for (let i = 1; i <= lastIndex; i++) {
        const tokenIdArgs = new Args().addU256(BigInt(i));

        // Check if the NFT is owned by the specified address
        const ownerResult = await smartContract.read("ownerOf", tokenIdArgs);
        const ownerAddress = bytesToStr(ownerResult.value);
        console.log("owner : ",ownerAddress)
        console.log("user : ",user.walletAddress.toString())
        if (ownerAddress.toString() === user.walletAddress.toString()) {
          console.log("This is the id of my NFT", i);

          user.tokenId = i;
          index = i;

          await user.save();
          console.log(operation.id);

          const evolutionId = uuidv4();

          const args1 = new Args()
            .addString(evolutionId)
            .addU256(BigInt(index))
            .addU64(BigInt(Date.now() + 30 * 60 * 1000))
            .addArray(
              [
                "image",
                `https://gold-hilarious-platypus-698.mypinata.cloud/ipfs/QmeVZ3otVuC4PnQDxMqU4BmdkEXmiQF7muBkEkj6uT6LPh/${index}.png`,
              ],
              ArrayTypes.STRING
            );

          const operation2 = await smartContract.call(
            "addTimeEvolution",
            args1,
            {
              coins: BigInt(4 * 10 ** 7),
              fee,
              maxGas,
            }
          );

          console.log(operation2.id);
          // Save evolution history
          const evo = await EvolutionHistory.findOne({
            userId: user._id,
            step: "1",
          });
          console.log(evo, "aaaaa");
          if (!evo) {
            const evolutionRecord = new EvolutionHistory({
              userId: user._id,
              evolutionId: evolutionId,
              step: "1",
            });
            await evolutionRecord.save();
          }
        }
      }
    } catch (error) {
      console.error("Failed to mint evobots:", error);
      throw new Error(`Failed to mint evobots: ${error.message}`);
    }

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
