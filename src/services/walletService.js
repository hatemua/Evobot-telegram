// File: src/services/walletService.js

const {
  Account: KeyPair,
  Web3Provider,
  formatMas,
  parseMas,
} = require("@massalabs/massa-web3");

async function sendTransaction(privateKey, recipientAddress, amount) {
  const keyPair = await KeyPair.fromPrivateKey(privateKey);
  const provider = Web3Provider.buildnet(keyPair);
  try {
    const tx = await provider.transfer(
      "AU12uctMA217TsaumbZag89HABxyEmkSAM1XhyQEn5qh5SVV57sF8",
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

module.exports = { sendTransaction, getBalance };
