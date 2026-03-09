import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log(`Deploying CabalWager to ${network.name}...`);

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} AVAX`);

  const CabalWager = await ethers.getContractFactory("CabalWager");
  const contract = await CabalWager.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`CabalWager deployed to: ${address}`);

  // Save to deployments.json
  const deploymentsPath = path.join(__dirname, "../contracts/deployments.json");
  const deployments = {
    CabalWager: {
      address,
      network: network.name,
      chainId: network.config.chainId,
      deployer: deployer.address,
      deployedAt: new Date().toISOString(),
      explorer: `https://testnet.snowtrace.io/address/${address}`,
    },
  };

  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log(`Deployment saved to contracts/deployments.json`);
  console.log(`Explorer: https://testnet.snowtrace.io/address/${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
