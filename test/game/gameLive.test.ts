/* eslint-disable node/no-missing-import */
/* eslint-disable no-unused-vars */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

let deployer: SignerWithAddress, user: SignerWithAddress;
let OLYMInstance: Contract, GameInstance: Contract, GameItemsInstance: Contract;
const newURI =
  "https://gateway.pinata.cloud/ipfs/QmQTytMsptENLmytB9vaUUCJmXMYYtKtoybxZaNEWi8kHn";
describe("Game smartcontract test", () => {
  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    user = accounts[1];

    const OLYMContract = await ethers.getContractFactory("OLYM", deployer);
    OLYMInstance = OLYMContract.attach(
      "0x8868fc4e3cD70fE208da85d5376c5cebcC1A0e78"
    );
    const GameContract = await ethers.getContractFactory("Game", deployer);
    GameInstance = GameContract.attach(
      "0x5d29E5E18A0fA2f8eA24c054d4Ce0df2ca7E680E"
    );
    const GameItemsContract = await ethers.getContractFactory(
      "GameItems",
      deployer
    );
    GameItemsInstance = GameItemsContract.attach(
      "0x94ba44a77433C317d56Dd2C459Cf2ECd6b531fD2"
    );
  });

  it("Deposit NFT ", async () => {
    // Approve olym for gameitems contract
    await OLYMInstance.connect(user).approve(
      GameItemsInstance.address,
      ethers.utils.parseEther("25")
    );
    // User mint NFT
    const tx = await GameItemsInstance.connect(user).mint(
      ethers.utils.parseEther("25")
    );
    await tx.wait();
    const tokenId = await GameItemsInstance.getCurrentId();
    const ownerToken = await GameItemsInstance.ownerOf(tokenId);
    let tokenURI = await GameItemsInstance.tokenURI(tokenId);
    expect(tokenURI).to.equal(
      "https://gateway.pinata.cloud/ipfs/QmP7C3wUvQ5dGf9ccpoK1S47QLE1fgvwf6mEVwMBQmNTWb"
    );
    expect(ownerToken).to.equal(user.address);
    // Update new URI for token
    const tx1 = await GameItemsInstance.connect(user).setTokenURI(
      tokenId,
      newURI
    );
    tx1.wait();

    // Approve NFT of user to game contract;
    const tx2 = await GameItemsInstance.connect(user).approve(
      GameInstance.address,
      tokenId
    );
    tx2.wait();
    tokenURI = await GameItemsInstance.tokenURI(tokenId);
    expect(tokenURI).to.equal(newURI);
    // User deposit NFT to game smart contract;
    await GameInstance.connect(user).depositNFT(
      GameItemsInstance.address,
      tokenId
    );
  });
});
