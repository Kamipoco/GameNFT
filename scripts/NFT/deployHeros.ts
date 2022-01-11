/* eslint-disable node/no-missing-import */
import { Contract } from "ethers";
import { ethers } from "hardhat";

export const deployHeros = async (olymAdd: string): Promise<Contract> => {
  const accounts = await ethers.getSigners();
  const HerosFactory = await ethers.getContractFactory("Heros", accounts[0]);
  const HerosInstance = await HerosFactory.deploy(olymAdd);
  await HerosInstance.deployed();
  console.log(
    "Successfully deployed GameItems contract at: ",
    HerosInstance.address
  );
  return HerosInstance;
};
