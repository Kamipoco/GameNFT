import { BigNumber } from "ethers";
import { ethers } from "hardhat";

export const setHeroBox = async (
  HeroContract: string,
  typeBox: number,
  boxPrice: BigNumber,
  boxURI: string
) => {
  const accounts = await ethers.getSigners();
  const HerosFactory = await ethers.getContractFactory("Heros", accounts[0]);
  const HerosInstance = HerosFactory.attach(HeroContract);
  const tx = await HerosInstance.setBox(typeBox, boxPrice, boxURI);
  await tx.wait();
  console.log("Successfully set/update Hero box");
};

export const setWeaponBox = async (
  HeroContract: string,
  typeBox: number,
  boxPrice: BigNumber
) => {
  const accounts = await ethers.getSigners();
  const WeaponsFactory = await ethers.getContractFactory(
    "Weapons",
    accounts[0]
  );
  const WeaponsInstance = WeaponsFactory.attach(HeroContract);
  const tx = await WeaponsInstance.setBoxPrice(typeBox, boxPrice);
  await tx.wait();
  console.log("Successfully set/update Weapon box");
};

export const setArmorBox = async (
  HeroContract: string,
  typeBox: number,
  boxPrice: BigNumber
) => {
  const accounts = await ethers.getSigners();
  const ArmorsFactory = await ethers.getContractFactory("Armors", accounts[0]);
  const ArmorsInstance = ArmorsFactory.attach(HeroContract);
  const tx = await ArmorsInstance.setBoxPrice(typeBox, boxPrice);
  await tx.wait();
  console.log("Successfully set/update Armor box");
};
