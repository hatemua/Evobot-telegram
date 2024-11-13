// File: src/commands/actions.js

const User = require("../models/User");
const EvolutionHistory = require("../models/Evolution");

const QRCode = require("qrcode");
const Jimp = require("jimp");
const QrCodeReader = require("qrcode-reader");
const {
  sendTransaction,
  getBalance,
  getMyNfts,
  getNfts,
  mintCameleon,
  transfer,
} = require("../services/walletService");

async function handleVisualizeNFT(bot, chatId) {
  const options = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "🤖 Evobots", callback_data: "visualize_evobots" }],
        [{ text: "🦎 Cameleonz", callback_data: "visualize_cameleonz" }],
        [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
      ],
    }),
  };

  bot.sendMessage(
    chatId,
    "👀 Choose a collection to visualize and explore its NFTs:",
    options
  );
}

async function handleVisualizeEvobots(bot, chatId) {
  try {
    const user = await User.findOne({ telegramId: chatId });

    if (!user) {
      bot.sendMessage(
        chatId,
        "No account found. Please set up your account first.",
        {
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
            ],
          }),
        }
      );
      return;
    }

    const nftAddress = "AS1ntvH7FXYSfJjvptVM2t4X1Y9DJmRF29V34CxbJNtJkhQkPnAB"; // Smart contract address

    const metadata = await getMyNfts(
      nftAddress,
      user.privateKey,
      user.walletAddress
    );

    // Create the message to send to the user
    const message = `Here is the NFT visualization feature:\n\n${metadata}\n\nSelect an option or go back to the menu.`;

    // Options with "Back to Menu" button
    const options = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      }),
    };

    // Send the message to the user
    bot.sendMessage(chatId, message, options);
  } catch (error) {
    console.error("Error retrieving NFT information:", error);
    bot.sendMessage(
      chatId,
      "An error occurred while retrieving the NFT information. Please try again later.",
      {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
          ],
        }),
      }
    );
  }
}

// Function to handle Cameleonz visualization (for now, just a placeholder message)
async function handleVisualizeCameleonz(bot, chatId) {
  try {
    const user = await User.findOne({ telegramId: chatId });

    if (!user) {
      bot.sendMessage(
        chatId,
        "No account found. Please set up your account first.",
        {
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
            ],
          }),
        }
      );
      return;
    }

    // const cameleonzAddress =
    //   "AS12wiYn88sQZ2ugC5YRQT9QAvAzYVfBuTtZqmkb6F4Y5qh7ZNeyM"; // Smart contract address for Cameleonz

    // const metadata = await getNfts(
    //   bot,
    //   chatId,
    //   cameleonzAddress,
    //   user.privateKey,
    //   user.walletAddress
    // );

    // const message = `Here is the NFT visualization feature for Cameleonz:\n\n${metadata}\n\nSelect an option or go back to the menu.`;
    const message = `This wallet doesn’t hold any Cameleon to mint your Cameleon. 🦎 \n\n
Visit https://www.cameleon.art/ to explore more!\n\nSelect an option or go back to the menu.`;

    const options = {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      }),
    };

    bot.sendMessage(chatId, message, options);
  } catch (error) {
    console.error("Error retrieving NFT information:", error);
    bot.sendMessage(
      chatId,
      "An error occurred while retrieving the NFT information. Please try again later.",
      {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
          ],
        }),
      }
    );
  }
}

// Function to handle sending Massa
async function handleSendMassa(bot, chatId) {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Scan QR Code", callback_data: "send_massa_qr" }],
        [
          {
            text: "Enter Address Manually",
            callback_data: "send_massa_manual",
          },
        ],
        [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
      ],
    },
  };

  bot.sendMessage(
    chatId,
    "How would you like to enter the recipient's address?",
    options
  );
}

// Function to handle scanning a QR code for sending Massa
async function handleSendMassaQr(bot, chatId) {
  bot.sendMessage(
    chatId,
    "Please send me the QR code of the address you want to send Massa to.",
    {
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [{ text: "🔙 Back to Menu", callback_data: "back_to_menu" }],
        ],
      }),
    }
  );

  // Listen for a photo (QR code) sent by the user
  bot.on("photo", async (msg) => {
    if (msg.chat.id !== chatId) return;

    const fileId = msg.photo[msg.photo.length - 1].file_id; // Get the highest resolution photo
    const filePath = await bot.getFileLink(fileId);

    // Download and decode the QR code image
    const image = await Jimp.read(filePath);
    const qr = new QrCodeReader();
    qr.callback = async (err, value) => {
      if (err || !value) {
        bot.sendMessage(
          chatId,
          "Failed to decode the QR code. Please try again."
        );
      } else {
        const recipientAddress = value.result;
        await promptAmountAndSend(bot, chatId, recipientAddress); // Prompt for the amount and send
      }
    };
    qr.decode(image.bitmap);
  });
}

// Function to handle manual address entry for sending Massa
async function handleSendMassaManual(bot, chatId) {
  bot.sendMessage(chatId, "Please enter the recipient's Massa address:");

  bot.onText(/.+/, async (msg) => {
    if (msg.chat.id === chatId) {
      const recipientAddress = msg.text;
      await promptAmountAndSend(bot, chatId, recipientAddress); // Prompt for the amount and send
    }
  });
}

// Helper function to prompt for the amount and send the transaction
async function promptAmountAndSend(bot, chatId, recipientAddress) {
  bot.sendMessage(chatId, "Please enter the amount of Massa to send:");

  bot.onText(/^[0-9]+(\.[0-9]+)?$/, async (msg) => {
    if (msg.chat.id === chatId) {
      const amount = parseFloat(msg.text);

      // Retrieve the user's private key from the database
      const user = await User.findOne({ telegramId: chatId });
      if (!user) {
        bot.sendMessage(
          chatId,
          "No wallet found. Please create a wallet first."
        );
        return;
      }

      // Send the transaction using the user's private key
      try {
        await sendTransaction(user.privateKey, recipientAddress, amount);
        const evo = await EvolutionHistory.findOne({
          userId: user._id,
          step: "4",
        });
        evo.transaction = true;
        await evo.save();
        bot.sendMessage(
          chatId,
          `Successfully sent ${amount} Massa to ${recipientAddress}.`
        );
        bot.sendMessage(
          chatId,
          `Successfully sent ${amount} Massa to ${recipientAddress}.`
        );
      } catch (error) {
        console.error("Error sending Massa:", error);
        bot.sendMessage(chatId, "Failed to send Massa. Please try again.");
      }
    }
  });
}

// Function to handle receiving Massa
async function handleReceiveMassa(bot, chatId) {
  // Retrieve the user's wallet address from the database
  const user = await User.findOne({ telegramId: chatId });
  if (!user) {
    bot.sendMessage(chatId, "No wallet found. Please create a wallet first.");
    return;
  }

  // Send the address and QR code to the user
  bot.sendMessage(chatId, `Your Massa address: ${user.walletAddress}`);

  // Generate QR code for the address
  QRCode.toDataURL(user.walletAddress, (err, url) => {
    if (err) {
      console.error("Error generating QR code:", err);
      bot.sendMessage(
        chatId,
        "An error occurred while generating the QR code."
      );
      return;
    }

    // Convert the base64 image to a buffer and send it to the user
    const qrImage = Buffer.from(url.split(",")[1], "base64");
    bot.sendPhoto(chatId, qrImage, {
      caption: "Scan this QR code to receive Massa at your address.",
    });
  });
}

async function handleBuyCameleon(bot, chatId) {
  // Fetch the user's wallet information from the database
  const user = await User.findOne({ telegramId: chatId });
  if (!user) {
    bot.sendMessage(
      chatId,
      "⚠️ No wallet found. Please create a wallet first."
    );
    return;
  }

  const smartContractAddress =
    "AS12wiYn88sQZ2ugC5YRQT9QAvAzYVfBuTtZqmkb6F4Y5qh7ZNeyM";

  try {
    // Call the mintCameleon function in the service layer
    const operationId = await mintCameleon(
      smartContractAddress,
      user.privateKey,
      user.walletAddress
    );

    // Construct a message with a link to the transaction explorer
    const transactionLink = `https://www.massexplo.io/tx/${operationId}`;
    const message = `🎉 Your mint transaction is pending! Track it [here](${transactionLink}).`;

    // Send a message back to the user
    bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Failed to mint Cameleon:", error);
    bot.sendMessage(
      chatId,
      `❌ Failed to mint Cameleon. Error: ${error.message}`
    );
  }
}

async function handleWithdraw(bot, chatId) {
  try {
    // Step 1: Retrieve user's wallet details from the database
    const user = await User.findOne({ telegramId: chatId });
    if (!user) {
      bot.sendMessage(chatId, "No wallet found. Please create a wallet first.");
      return;
    }

    // Step 2: Prompt user for recipient address and token ID
    bot.sendMessage(chatId, "Please enter the recipient's wallet address:");

    // Wait for recipient address input
    bot.once("message", async (msg) => {
      const recipientAddress = msg.text;

      // Prompt for token ID
      bot.sendMessage(
        chatId,
        "Please enter the token ID you wish to transfer:"
      );

      // Wait for token ID input
      bot.once("message", async (msg) => {
        const tokenId = BigInt(msg.text); // Make sure to parse token ID as BigInt

        try {
          // Step 3: Call the transfer function
          const transactionId = await transfer(
            "AS1ntvH7FXYSfJjvptVM2t4X1Y9DJmRF29V34CxbJNtJkhQkPnAB", // Replace with actual smart contract address
            user.privateKey,
            user.walletAddress,
            recipientAddress,
            tokenId
          );

          // Step 4: Notify the user of successful transfer initiation
          bot.sendMessage(
            chatId,
            `🎉 Transfer initiated! Transaction ID: ${transactionId}\nTrack your transaction on [Massa Explorer](https://www.massexplo.io/tx/${transactionId})`,
            { parse_mode: "Markdown" }
          );
        } catch (error) {
          console.error("Error in handleWithdraw:", error);
          bot.sendMessage(
            chatId,
            "❌ Failed to initiate transfer. Please try again later."
          );
        }
      });
    });
  } catch (error) {
    console.error("Error in handleWithdraw:", error);
    bot.sendMessage(
      chatId,
      "❌ An error occurred while processing your withdrawal request. Please try again later."
    );
  }
}

// Function to handle checking wallet balance
async function handleCheckBalance(bot, chatId) {
  // Retrieve the user's wallet address from the database
  const user = await User.findOne({ telegramId: chatId });
  if (!user) {
    bot.sendMessage(chatId, "No wallet found. Please create a wallet first.");
    return;
  }

  try {
    const balance = await getBalance(user.privateKey, user.walletAddress); // Fetch the balance
    bot.sendMessage(chatId, `Your current wallet balance is: ${balance} Massa`);
  } catch (error) {
    console.error("Error fetching balance:", error);
    bot.sendMessage(
      chatId,
      "An error occurred while retrieving your balance. Please try again later."
    );
  }
}

module.exports = {
  handleVisualizeNFT,
  handleSendMassa,
  handleReceiveMassa,
  handleBuyCameleon,
  handleWithdraw,
  handleSendMassaQr,
  handleSendMassaManual,
  handleCheckBalance,
  handleVisualizeEvobots,
  handleVisualizeCameleonz,
};
