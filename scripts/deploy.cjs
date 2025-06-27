const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Keepr contract...");

  // Get the contract factory
  const Keepr = await ethers.getContractFactory("Keepr");
  
  // Deploy the contract
  const keepr = await Keepr.deploy();
  
  // Wait for deployment to finish
  await keepr.waitForDeployment();
  
  const address = await keepr.getAddress();
  console.log("Keepr deployed to:", address);
  
  // Verify the deployment
  console.log("Deployment successful!");
  console.log("Contract address:", address);
  console.log("Network:", network.name);
  
  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    contract: "Keepr",
    address: address,
    deployer: (await ethers.getSigners())[0].address,
    timestamp: new Date().toISOString(),
  };
  
  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 