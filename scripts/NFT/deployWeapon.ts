/* eslint-disable node/no-missing-import */
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { setWeaponBox } from "./setBox";

export const deployWeapons = async (olymAdd: string): Promise<Contract> => {
  const accounts = await ethers.getSigners();
  const WeaponsFactory = await ethers.getContractFactory(
    "Weapons",
    accounts[0]
  );
  const WeaponsInstance = await WeaponsFactory.deploy(olymAdd);
  await WeaponsInstance.deployed();
  const typeBox = 0;
  const boxPrice = ethers.utils.parseEther("25");
  await setWeaponBox(WeaponsInstance.address, typeBox, boxPrice);
  console.log(
    "Successfully deployed GameItems contract at: ",
    WeaponsInstance.address
  );
  return WeaponsInstance;
};
