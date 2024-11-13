// index.js
const mongoose = require("mongoose");
const User = require("./models/User");
const { v4: uuidv4 } = require("uuid");

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
const { connectToDatabase } = require("./config/database");
const config = require("./config/config");
const EvolutionHistory = require("./models/Evolution");
require("dotenv").config();

const privteKey = process.env.PRIVATE_KEY;
const TelegramBot = process.env.TELEGRAM_BOT_TOKEN;

// async function mintNFT(user) {
//   // Placeholder function for minting an NFT
//   console.log(
//     `Minting NFT for user with wallet address: ${user.walletAddress}`
//   );

// const keyPair = await KeyPair.fromPrivateKey(privteKey);
//   const provider = Web3Provider.mainnet(keyPair); // Assuming we are on mainnet
//   const maxGas = MAX_GAS_CALL; // Set appropriate max gas limit
//   const coins = BigInt(2 * 10 ** 8);
//   const fee = BigInt(10 ** 7); // 0.01 MAS in nanoMAS
//   try {
//     // Prepare the function arguments
//     const args = new Args().addString(user.walletAddress);

//     console.log("step  1 ");
//     const smartContract = new SmartContract(
//       provider,
//       "AS1ntvH7FXYSfJjvptVM2t4X1Y9DJmRF29V34CxbJNtJkhQkPnAB"
//     );

//     // Call the transfer function on the smart contract
//     const operation = await smartContract.call("mint", args, {
//       coins,
//       fee,
//       maxGas,
//     });
//     console.log("id: ", operation.id);
//     await new Promise((resolve) => setTimeout(resolve, 16000));
//     user.nftMinted = true;
//     user.mintDate = new Date();
//     const lastIndexResult = await smartContract.read(
//       "mintedTokens",
//       new Args()
//     );
//     console.log("step  2 ");

//     const lastIndex = Number(new Args(lastIndexResult.value).nextU64());
//     console.log("minted tokens: ", lastIndex);
//     let index = 0;
//     for (let i = 1; i <= lastIndex; i++) {
//       const tokenIdArgs = new Args().addU256(BigInt(i));
//       console.log("step  3 ");

//       // Check if the NFT is owned by the specified address
//       const ownerResult = await smartContract.read("ownerOf", tokenIdArgs);
//       const ownerAddress = bytesToStr(ownerResult.value);

//       if (ownerAddress.toString() === user.walletAddress.toString()) {
//         console.log("This is the id of my NFT", i);

//         user.tokenId = i;
//         index = i;

//         await user.save();
//         console.log(operation.id);
//         console.log("step  4 ");

//         const evolveFunctionName = "addTimeEvolution";
//         const evolutionId = uuidv4();

//         const args1 = new Args()
//           .addString(evolutionId)
//           .addU256(BigInt(index))
//           .addU64(BigInt(Date.now() + 30 * 60 * 1000))
//           .addArray(
//             [
//               "image",
//               `https://gold-hilarious-platypus-698.mypinata.cloud/ipfs/QmeVZ3otVuC4PnQDxMqU4BmdkEXmiQF7muBkEkj6uT6LPh/${index}.png`,
//             ],
//             ArrayTypes.STRING
//           );
//         console.log("step  5 ");

//         const operation2 = await smartContract.call(evolveFunctionName, args1, {
//           coins: BigInt(4 * 10 ** 7),
//           fee,
//           maxGas,
//         });
//         console.log("step  6 ");

//         console.log(operation2.id);
//         // Save evolution history
//         const evolutionRecord = new EvolutionHistory({
//           userId: user._id,
//           evolutionId: evolutionId,
//         });
//         await evolutionRecord.save();
//         console.log("finish");

//         return { tx1: operation.id, tx2: operation2.id };
//       }
//     }
//   } catch (error) {
//     console.error("Failed to mint evobots:", error);
//     throw new Error(`Failed to mint evobots: ${error.message}`);
//   }
// }

async function evolveNFT(user, evolution, step, baseURI) {
  // Placeholder function for evolving an NFT
  const ev = await EvolutionHistory.findOne({
    evolutionId: evolution.evolutionId,
    executed: true,
  });
  if (ev) {
    return ev;
  }

  console.log(
    `Evolving NFT for user with wallet address: ${user.walletAddress}`
  );
  // Placeholder function for minting an NFT

  const keyPair = await KeyPair.fromPrivateKey(privteKey);

  const provider = Web3Provider.mainnet(keyPair); // Assuming we are on mainnet
  const maxGas = MAX_GAS_CALL; // Set appropriate max gas limit
  const coins = BigInt(0);
  const fee = BigInt(10 ** 7); // 0.01 MAS in nanoMAS
  console;
  try {
    // Prepare the function arguments

    const smartContract = new SmartContract(
      provider,
      "AS1hJWuchcrCHAen4LQRD8XFTukPVT8BWXxsd8Srbsbs3bK7AH9T"
    );
    console.log("evolutionID ", evolution.evolutionId);
    console.log("step ", step);

    // const args = new Args()
    //   .addString(evolution.evolutionId)
    //   .addU256(BigInt(user.tokenId));

    // Call the transfer function on the smart contract
    let imageArgs = new Args()
      .addU256(BigInt(user.tokenId))
      .addString(`${baseURI}/${user.tokenId}.png`);
    console.log(imageArgs);

    const operation = await smartContract.call("setImage", imageArgs, {
      coins,
      fee,
      maxGas,
    });

    console.log(operation, "operation");
    await new Promise((resolve) => setTimeout(resolve, 16000));
    const lastEvo = await EvolutionHistory.findOne({
      evolutionId: evolution.evolutionId,
    });
    lastEvo.executed = true;
    await lastEvo.save();
    let MESSAGE = "Evolution "+ step.toString() +" executed successfully"
    const payload = {
      chat_id: user.telegramId,
      text: MESSAGE,
      reply_markup: {
          inline_keyboard: [
              [
                  {
                    text: "Visualize 🤖 Evobots", callback_data: "visualize_evobots" 
                  }
              ],
          ],
      },
  };
    await sendMessage(payload) ;
    if (step == 4) {
      return;
    }
    const evolutionId = uuidv4();

    const args1 = new Args()
      .addString(evolutionId)
      .addU256(BigInt(user.tokenId))
      .addU64(BigInt(Date.now() + 30 * 60 * 1000))
      .addArray(
        [
          "image",
          `${baseURI}/${user.tokenId}.png`,
        ],
        ArrayTypes.STRING
      );

    const operation2 = await smartContract.call("addTimeEvolution", args1, {
      coins: BigInt(4 * 10 ** 7),
      fee,
      maxGas,
    });

    // console.log(operation2.id,"add TimesEvolution");
    // console.log(baseURI,"baseURI");
    // Save evolution history

    const evolutionRecord = new EvolutionHistory({
      userId: user._id,
      evolutionId: evolutionId,
      step: (step + 1).toString(),
    });
    await evolutionRecord.save();

    return { tx1: operation.id, tx2: operation2.id };
  } catch (error) {
    console.error("Failed to mint Evobots:", error);
    throw new Error(`Failed to mint Evobots: ${error.message}`);
  }
}
async function evolveNFT2(user, evolution) {
  // Placeholder function for evolving an NFT
  console.log(
    `Evolving NFT for user with wallet address: ${user.walletAddress}`
  );
  // Placeholder function for minting an NFT

  const keyPair = await KeyPair.fromPrivateKey(privteKey);

  const provider = Web3Provider.mainnet(keyPair); // Assuming we are on mainnet
  const evolveFunctionName = "timeUpgrade";
  const maxGas = MAX_GAS_CALL; // Set appropriate max gas limit
  const coins = BigInt(0);
  const fee = BigInt(10 ** 7); // 0.01 MAS in nanoMAS

  try {
    // Prepare the function arguments

    const smartContract = new SmartContract(
      provider,
      "AS1ntvH7FXYSfJjvptVM2t4X1Y9DJmRF29V34CxbJNtJkhQkPnAB"
    );

    const args = new Args()
      .addString(evolution.evolutionId)
      .addU256(BigInt(user.tokenId));

    // Call the transfer function on the smart contract
    const operation = await smartContract.call(evolveFunctionName, args, {
      coins,
      fee,
      maxGas,
    });

    return operation.id;
  } catch (error) {
    console.error("Failed to mint Evobots:", error);
    throw new Error(`Failed to mint Evobots: ${error.message}`);
  }
}

// async function checkNewUsers() {
//   const newUsers = await User.find({ nftMinted: false });
//   for (const user of newUsers) {
//     await mintNFT(user);
//   }
// }

async function checkEvolutions() {
  const usersWithNFT = await User.find({ nftMinted: true }).exec();
  const now = new Date();
  for (const user of usersWithNFT) {
    console.log("this is the evolution : ");
    const timeSinceMint = (now - user.mintDate) / 60000; // time in minutes
    if (timeSinceMint >= 1 && timeSinceMint < 2) {
      const evolution = await EvolutionHistory.findOne({
        userId: user.id,
        step: "1",
      });
      await evolveNFT(
        user,
        evolution,
        1,
        "https://gold-hilarious-platypus-698.mypinata.cloud/ipfs/QmeVZ3otVuC4PnQDxMqU4BmdkEXmiQF7muBkEkj6uT6LPh"
      ); // First evolution after 6 minutes
      console.log("First evolution after 6 minutes");
    } else if (timeSinceMint >= 2 && timeSinceMint < 4) {
      const evolution = await EvolutionHistory.findOne({
        userId: user.id,
        step: "2",
      });
      await evolveNFT(
        user,
        evolution,
        2,
        "https://gold-hilarious-platypus-698.mypinata.cloud/ipfs/QmWK6TaM2ELXEGScKRZVxvzAWjj2khR1MXdEBwcjFdPPRE"
      ); // Second evolution after 12 minutes
      console.log("Second evolution after 12 minutes");
    } else if (timeSinceMint >= 4 && timeSinceMint < 6) {
      const evolution = await EvolutionHistory.findOne({
        userId: user.id,
        step: "3",
      });
      await evolveNFT(
        user,
        evolution,
        3,
        "https://gold-hilarious-platypus-698.mypinata.cloud/ipfs/QmYgfBWLpvDsqRRfwxYtNEsWtzpE6V2f6VfsZo1i6334UK"
      ); // Second evolution after 12 minutes
      console.log("Second evolution after 16 minutes");
    } else if (timeSinceMint >= 6 && timeSinceMint < 8) {
      if (user.transactionSended == true) {
        const evolution = await EvolutionHistory.findOne({
          userId: user.id,
          step: "4",
        });
        await evolveNFT(
          user,
          evolution,
          4,
          "https://gold-hilarious-platypus-698.mypinata.cloud/ipfs/QmZYSVuevQCfXmgLDC3pUVCpnYnKHeKCmRZZmURkuXbcAr"
        ); // Second evolution after 12 minutes
        console.log("Second evolution after 18 minutes");
      }
     
    }
  }
}
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TelegramBot}/sendMessage`;

// Send the message
async function sendMessage(body) {
    try {
        const response = await fetch(TELEGRAM_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

    } catch (error) {
        console.error("Error sending message:", error);
    }
}
async function startWatchdog() {
  await connectToDatabase();

  setInterval(async () => {
    // console.log("Checking for new users to mint NFTs...");
    // await checkNewUsers();

    console.log("Checking for NFT evolutions...");
    await checkEvolutions();
  }, 1 * 60 * 1000); // Run every 5 minutes
}

startWatchdog().catch((error) => console.error("Watchdog failed:", error));
