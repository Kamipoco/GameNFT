import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

export const deploySeedSale = async (
  beneficiary: string,
  startTimestamp: number,
  durationSecond: number,
  firstTimeRelease: BigNumber
): Promise<Contract> => {
  const accounts = await ethers.getSigners();
  const seedSaleContractFactory = await ethers.getContractFactory(
    "SeedSale",
    accounts[0]
  );
  const seedSaleContractInstance = await seedSaleContractFactory.deploy(
    beneficiary,
    startTimestamp,
    durationSecond,
    firstTimeRelease
  );
  await seedSaleContractInstance.deployed();
  console.log(
    "Successfully deploy Seed sale at: ",
    seedSaleContractInstance.address
  );
  return seedSaleContractInstance;
};
