/* eslint-disable node/no-missing-import */
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { setArmorBox } from "./setBox";

export const deployArmors = async (olymAdd: string): Promise<Contract> => {
  const accounts = await ethers.getSigners();
  const ArmorsFactory = await ethers.getContractFactory("Armors", accounts[0]);
  const ArmorsInstance = await ArmorsFactory.deploy(olymAdd);
  await ArmorsInstance.deployed();
  const typeBox = 0;
  const boxPrice = ethers.utils.parseEther("25");
  await setArmorBox(ArmorsInstance.address, typeBox, boxPrice);
  console.log(
    "Successfully deployed GameItems contract at: ",
    ArmorsInstance.address
  );
  return ArmorsInstance;
};
