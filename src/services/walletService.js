// File: src/services/walletService.js

const {
  Account: KeyPair,
  Web3Provider,
  parseMas,
  SmartContract,
  Args,
  bytesToStr,
  MAX_GAS_CALL,
} = require("@massalabs/massa-web3");

async function sendTransaction(privateKey, recipientAddress, amount) {
  const keyPair = await KeyPair.fromPrivateKey(privateKey);
  const provider = Web3Provider.buildnet(keyPair);
  try {
    const tx = await provider.transfer(
      recipientAddress,
      parseMas("5"),
      parseMas("0.01")
    );

    const status = await tx.getStatus();
    console.log(`Transaction successful: ${tx.id}`);
    return tx.hash;
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw new Error("Transaction failed");
  }
}

// New function to get the balance of a given address
async function getBalance(privateKey, address) {
  const keyPair = await KeyPair.fromPrivateKey(privateKey);

  const provider = Web3Provider.buildnet(keyPair);

  try {
    const balance = await provider.balance(true);
    console.log(`Balance for ${address}: ${balance}`);
    return Number(balance) / 10 ** 9;
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw new Error("Failed to retrieve balance");
  }
}

async function getMyNfts(smartContractAddress, privateKey, address) {
  // Initialize the key pair and provider
  const keyPair = await KeyPair.fromPrivateKey(privateKey);
  const provider = Web3Provider.buildnet(keyPair);

  // Initialize the smart contract with the specified address
  const smartContract = new SmartContract(provider, smartContractAddress);

  const ownedNFTs = [];

  try {
    const lastIndexResult = await smartContract.read(
      "mintedTokens",
      new Args()
    );
    const lastIndex = Number(new Args(lastIndexResult.value).nextU64());

    for (let i = 1; i <= lastIndex; i++) {
      const tokenIdArgs = new Args().addU256(BigInt(i));

      // Check if the NFT is owned by the specified address
      const ownerResult = await smartContract.read("ownerOf", tokenIdArgs);
      const ownerAddress = bytesToStr(ownerResult.value);

      if (ownerAddress.toString() === address.toString()) {
        // Fetch the tokenURI if owned
        const tokenURIResult = await smartContract.read(
          "tokenURI",
          tokenIdArgs
        );
        const tokenURI = new Args(tokenURIResult.value);

        // Extract metadata
        const collectionAddress = tokenURI.nextString();
        const tokenName = tokenURI.nextString();
        const description = tokenURI.nextString();
        const imageURL = tokenURI.nextString();
        const attributes = tokenURI.nextString();

        // Add this NFT's metadata to the list
        ownedNFTs.push({
          collectionAddress,
          tokenName,
          description,
          imageURL,
          attributes,
        });
      }
    }

    // Format the owned NFTs for display
    if (ownedNFTs.length === 0) {
      return "🚫 No NFTs owned by this address.";
    }

    return ownedNFTs
      .map(
        (nft) =>
          `🌐 Collection Address: ${nft.collectionAddress}\n` +
          `🏷️ Token Name: ${nft.tokenName}\n` +
          `📝 Description: ${nft.description}\n` +
          `🖼️ Token Image: ${nft.imageURL}\n` +
          `🔍 Attributes:\n${nft.attributes}\n`
      )
      .join("\n------------------\n");
  } catch (error) {
    console.error("Error fetching NFT data:", error);
    throw error; // Rethrow error to be handled in calling function
  }
}

async function getNfts(bot, chatId, smartContractAddress, privateKey, address) {
  // Initialize the key pair and provider
  const keyPair = await KeyPair.fromPrivateKey(privateKey);
  const provider = Web3Provider.mainnet(keyPair);

  // Initialize the smart contract with the specified address
  const smartContract = new SmartContract(provider, smartContractAddress);

  const ownedNFTs = [];
  let messageId;
  let currentProgress = 0;

  try {
    // Get the last minted token index
    const lastIndexResult = await smartContract.read(
      "mintedTokens",
      new Args()
    );
    const lastIndex = Number(new Args(lastIndexResult.value).nextU64());

    // Send an initial message to the user with the total progress
    const initialMessage = `🔍 Fetching your NFTs... 0/${lastIndex} processed.`;
    const sentMessage = await bot.sendMessage(chatId, initialMessage);
    messageId = sentMessage.message_id;

    for (let i = 1; i <= lastIndex; i++) {
      const tokenIdArgs = new Args().addU256(BigInt(i));

      // Check if the NFT is owned by the specified address
      const ownerResult = await smartContract.read("ownerOf", tokenIdArgs);
      const ownerAddress = bytesToStr(ownerResult.value);

      if (ownerAddress.toString() === address.toString()) {
        // Fetch the tokenURI if owned
        const tokenURIResult = await smartContract.read(
          "tokenURI",
          tokenIdArgs
        );
        const tokenURI = new Args(tokenURIResult.value);

        // Extract metadata
        const collectionAddress = tokenURI.nextString();
        const tokenName = tokenURI.nextString();
        const description = tokenURI.nextString();
        const imageURL = tokenURI.nextString();
        const attributes = tokenURI.nextString();

        // Add this NFT's metadata to the list
        ownedNFTs.push({
          collectionAddress,
          tokenName,
          description,
          imageURL,
          attributes,
        });
      }

      // Update progress every 10 NFTs or when reaching the last index
      if (i % 10 === 0 || i === lastIndex) {
        currentProgress = i;
        await bot.editMessageText(
          `⏳ Fetching NFTs... ${currentProgress}/${lastIndex} processed.`,
          { chat_id: chatId, message_id: messageId }
        );
      }
    }

    // Format the owned NFTs for display
    if (ownedNFTs.length === 0) {
      await bot.editMessageText("🚫 No NFTs owned by this address.", {
        chat_id: chatId,
        message_id: messageId,
      });
      return;
    }

    // Prepare the final message with all NFTs' metadata
    const finalMessage = ownedNFTs
      .map(
        (nft) =>
          `🌐 Collection Address: ${nft.collectionAddress}\n` +
          `🏷️ Token Name: ${nft.tokenName}\n` +
          `📝 Description: ${nft.description}\n` +
          `🖼️ Token Image: ${nft.imageURL}\n` +
          `🔍 Attributes:\n${nft.attributes}\n`
      )
      .join("\n------------------\n");

    // Send the final message with all NFT details
    await bot.editMessageText(
      `🎉 NFTs fetched successfully!\n\n${finalMessage}`,
      {
        chat_id: chatId,
        message_id: messageId,
      }
    );
  } catch (error) {
    console.error("Error fetching NFT data:", error);
    await bot.editMessageText(
      "❌ An error occurred while fetching NFT data. Please try again later.",
      { chat_id: chatId, message_id: messageId }
    );
    throw error;
  }
}

// File: src/services/walletService.js

async function mintCameleon(smartContractAddress, privateKey, walletAddress) {
  const keyPair = await KeyPair.fromPrivateKey(privateKey);
  const provider = Web3Provider.mainnet(keyPair); // Assuming we are on mainnet

  const mintFunctionName = "mint";
  const maxGas = MAX_GAS_CALL; // Set appropriate max gas limit
  const coins = BigInt(800 * 10 ** 9); // Convert 800 MAS to nanoMAS (assuming 1 MAS = 10^9 nanoMAS)
  const fee = BigInt(10 ** 7); // 0.01 MAS in nanoMAS

  try {
    // Prepare the function arguments
    const args = new Args().addString(walletAddress);

    // Initialize the smart contract with provider and address
    const smartContract = new SmartContract(provider, smartContractAddress);

    // Call the mint function on the smart contract
    const operation = await smartContract.call(mintFunctionName, args, {
      coins,
      fee,
      maxGas,
    });

    return operation.id; // Return the transaction ID for tracking
  } catch (error) {
    console.error("Failed to mint Cameleon:", error);
    throw new Error(`Failed to mint Cameleon: ${error.message}`);
  }
}

async function transfer(
  smartContractAddress,
  privateKey,
  walletAddress,
  recipientAddress,
  tokenId
) {
  const keyPair = await KeyPair.fromPrivateKey(privateKey);
  const provider = Web3Provider.mainnet(keyPair); // Assuming we are on mainnet
  const transferFunctionName = "transferFrom";
  const maxGas = MAX_GAS_CALL; // Set appropriate max gas limit
  const coins = 0;
  const fee = BigInt(10 ** 7); // 0.01 MAS in nanoMAS

  try {
    // Prepare the function arguments
    const args = new Args()
      .addString(walletAddress)
      .addString(recipientAddress)
      .addU256(tokenId);

    const smartContract = new SmartContract(provider, smartContractAddress);

    // Call the transfer function on the smart contract
    const operation = await smartContract.call(transferFunctionName, args, {
      coins,
      fee,
      maxGas,
    });

    return operation.id; // Return the transaction ID for tracking
  } catch (error) {
    console.error("Failed to mint Cameleon:", error);
    throw new Error(`Failed to mint Cameleon: ${error.message}`);
  }
}

module.exports = {
  sendTransaction,
  getBalance,
  getMyNfts,
  getNfts,
  mintCameleon,
  transfer,
};
