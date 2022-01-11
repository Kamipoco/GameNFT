import { Contract } from "ethers";
import { ethers } from "hardhat";

export const deployGame = async (): Promise<Contract> => {
  const accounts = await ethers.getSigners();
  const gameContractFactory = await ethers.getContractFactory(
    "Game",
    accounts[0]
  );
  const gameContractInstance = await gameContractFactory.deploy();
  await gameContractInstance.deployed();
  console.log(
    "Successfully deploy GameContract at: ",
    gameContractInstance.address
  );
  return gameContractInstance;
};
