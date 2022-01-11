import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractFactory } from "ethers/lib/ethers";
import { ethers } from "hardhat";

export const deployOLYM = async (
  seedSale: string,
  privateSale: string,
  publicSale: string,
  advisors: string,
  team: string,
  marketing: string,
  game: string,
  farmingStaking: string,
  liquidity: string
) => {
  const accounts: SignerWithAddress[] = await ethers.getSigners();
  const OLYMContractFactory: ContractFactory = await ethers.getContractFactory(
    "OLYM",
    accounts[0]
  );
  const OLYMContractInstance = await OLYMContractFactory.deploy(
    seedSale,
    privateSale,
    publicSale,
    advisors,
    team,
    marketing,
    game,
    farmingStaking,
    liquidity
  );
  await OLYMContractInstance.deployed();
  console.log(
    "Successfully deployed OLYM token at: ",
    OLYMContractInstance.address
  );
  return OLYMContractInstance;
};
