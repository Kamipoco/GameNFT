/* eslint-disable node/no-missing-import */
import { ethers } from "hardhat";
import { deployGameItems } from "./NFT/deployGameItems";
import { deployOLYM } from "./coin/deployOLYM";
import { deployGame } from "./game/deployGame";

const main = async () => {
  const accounts = await ethers.getSigners();

  const gameInstance = await deployGame();
  const olymInstace = await deployOLYM(
    accounts[1].address,
    accounts[2].address,
    accounts[3].address,
    accounts[4].address,
    accounts[5].address,
    accounts[6].address,
    gameInstance.address,
    accounts[8].address,
    accounts[9].address
  );
  const boxPrice = ethers.utils.parseEther("25");
  await deployGameItems(olymInstace.address, boxPrice);
};

main().then();
