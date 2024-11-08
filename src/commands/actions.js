// File: src/commands/actions.js

const User = require("../models/User");
const QRCode = require("qrcode");
const Jimp = require("jimp");
const QrCodeReader = require("qrcode-reader");
const { sendTransaction, getBalance } = require("../services/walletService");

async function handleVisualizeNFT(bot, chatId) {
  bot.sendMessage(chatId, "Visualizing your NFTs...");
  // Add functionality to retrieve and display user's NFTs
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
    "Please send me the QR code of the address you want to send Massa to."
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
  bot.sendMessage(chatId, "Buying Cameleon...");
  // Add functionality to buy Cameleon
}

async function handleWithdraw(bot, chatId) {
  bot.sendMessage(chatId, "Please enter the amount to withdraw:");
  // Add functionality to handle withdrawals
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
};
