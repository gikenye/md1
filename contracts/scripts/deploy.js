const hre = require("hardhat");

async function main() {
  // Base network Chainlink VRF parameters
  const VRF_COORDINATOR = "0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634";
  const KEY_HASH = "0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899";
  const SUBSCRIPTION_ID = 1; // You'll need to create a subscription
  const CALLBACK_GAS_LIMIT = 100000;
  const REQUEST_CONFIRMATIONS = 3;

  const [deployer] = await hre.ethers.getSigners();
  const balance = await deployer.getBalance();
  
  console.log("Deployer address:", deployer.address);
  console.log("Balance:", hre.ethers.utils.formatEther(balance), "ETH");
  
  console.log("Deploying MDoubleGame to Base...");

  const MDoubleGame = await hre.ethers.getContractFactory("MDoubleGame");
  const game = await MDoubleGame.deploy(
    VRF_COORDINATOR,
    SUBSCRIPTION_ID,
    KEY_HASH,
    CALLBACK_GAS_LIMIT,
    REQUEST_CONFIRMATIONS
  );

  await game.deployed();
  const address = game.address;

  console.log("MDoubleGame deployed to:", address);
  console.log("Remember to:");
  console.log("1. Create a Chainlink VRF subscription");
  console.log("2. Add this contract as a consumer");
  console.log("3. Fund the subscription with LINK tokens");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});