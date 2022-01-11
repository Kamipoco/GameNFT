/* eslint-disable node/no-missing-import */
/* eslint-disable no-unused-vars */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { deployOLYM } from "../../scripts/coin/deployOLYM";
import { deployGame } from "../../scripts/game/deployGame";
import { deployGameItems } from "../../scripts/NFT/deployGameItems";
import { hashMessage } from "../utils/hashMessage";

let deployer: SignerWithAddress, user: SignerWithAddress;
let OLYMInstance: Contract, GameInstance: Contract, GameItemsInstance: Contract;

describe("Game smartcontract test", () => {
  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    user = accounts[1];
    GameInstance = await deployGame();
    OLYMInstance = await deployOLYM(
      accounts[0].address,
      accounts[1].address,
      accounts[2].address,
      accounts[3].address,
      accounts[4].address,
      accounts[5].address,
      accounts[6].address,
      accounts[7].address,
      accounts[8].address
    );
    GameItemsInstance = await deployGameItems(
      OLYMInstance.address,
      ethers.utils.parseEther("25")
    );
  });

  it("Deposit NFT ", async () => {
    // Approve olym for gameitems contract
    await OLYMInstance.connect(user).approve(
      GameItemsInstance.address,
      ethers.utils.parseEther("25")
    );
    // User mint NFT
    await GameItemsInstance.connect(user).mint(ethers.utils.parseEther("25"));
    const ownerToken = await GameItemsInstance.ownerOf(1);
    const tokenURI = await GameItemsInstance.tokenURI(1);
    expect(tokenURI).to.equal(
      "https://gateway.pinata.cloud/ipfs/QmP7C3wUvQ5dGf9ccpoK1S47QLE1fgvwf6mEVwMBQmNTWb"
    );
    expect(ownerToken).to.equal(user.address);
    // Approve NFT of user to game contract;
    await GameItemsInstance.connect(user).approve(GameInstance.address, 1);
    // User deposit NFT to game smart contract;
    await GameInstance.connect(user).depositNFT(GameItemsInstance.address, 1);
  });
});
