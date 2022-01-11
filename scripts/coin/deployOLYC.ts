import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "ethers/lib/ethers";
import { ethers } from "hardhat";

export const deployOLYC = async (miningAddress: string) => {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const OLYCContractFactory: ContractFactory = await ethers.getContractFactory(
    "OLYC",
    accounts[0]
  );
  const OLYCContractInstance = await OLYCContractFactory.deploy(miningAddress);
  await OLYCContractInstance.deployed();
  console.log(
    "Successfully deployed OLYC token at: ",
    OLYCContractInstance.address
  );
  return OLYCContractInstance;
};
