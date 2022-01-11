import { Contract } from "ethers";
import { ethers } from "hardhat";

export const deployMarketplace = async (tokenAddress: string): Promise<Contract> => {
  const accounts = await ethers.getSigners();
  const marketplaceContractFactory = await ethers.getContractFactory(
    "Marketplace",
    accounts[0]
  );
  const marketplaceContractInstance = await marketplaceContractFactory.deploy(tokenAddress);
  await marketplaceContractInstance.deployed();
  console.log(
    "Successfully deploy MarketplaceContract at: ",
    marketplaceContractInstance.address
  );
  return marketplaceContractInstance;
};
