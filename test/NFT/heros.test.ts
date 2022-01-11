/* eslint-disable node/no-missing-import */
/* eslint-disable no-unused-vars */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { deployOLYM } from "../../scripts/coin/deployOLYM";
import { deployHeros } from "../../scripts/NFT/deployHeros";
import { setHeroBox } from "../../scripts/NFT/setBox";
import { hashMessage } from "../utils/hashMessage";
import { createVoucher } from "../utils/heroMinter";
const {
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time,
  snapshot,
} = require("@openzeppelin/test-helpers");

let deployer: SignerWithAddress;
let user: SignerWithAddress;
let HerosInstance: Contract;
let OLYMInstace: Contract;
let boxPrice: BigNumber;
const typeBox = 0;
const boxURI =
  "https://gateway.pinata.cloud/ipfs/QmP7C3wUvQ5dGf9ccpoK1S47QLE1fgvwf6mEVwMBQmNTWb";
const heroURI =
  "https://gateway.pinata.cloud/ipfs/QmTrG2qWgXBPoSYUTXRTybFhjkj62hjXGs3terNvU9tZYM";
const newBoxPrice = ethers.utils.parseEther("30");

describe("Game Items smart contract", () => {
  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    user = accounts[1];
    OLYMInstace = await deployOLYM(
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
    boxPrice = ethers.utils.parseEther("25");
    HerosInstance = await deployHeros(OLYMInstace.address);
    await setHeroBox(HerosInstance.address, typeBox, boxPrice, boxURI);
  });

  it("Mint 1 item in GameItems", async () => {
    await OLYMInstace.connect(user).approve(
      HerosInstance.address,
      ethers.utils.parseEther("25")
    );
    await HerosInstance.connect(user).mint(
      typeBox,
      ethers.utils.parseEther("25")
    );
    const ownerToken = await HerosInstance.ownerOf(1);
    const tokenURI = await HerosInstance.tokenURI(1);
    expect(tokenURI).to.equal(
      "https://gateway.pinata.cloud/ipfs/QmP7C3wUvQ5dGf9ccpoK1S47QLE1fgvwf6mEVwMBQmNTWb"
    );
    expect(ownerToken).to.equal(user.address);
  });

  it("Mint item not appove", async () => {
    await expectRevert(
      HerosInstance.connect(user).mint(typeBox, ethers.utils.parseEther("25")),
      "OLYM: exceed allownce"
    );
  });

  it("Mint item without enough token", async () => {
    await expectRevert(
      HerosInstance.connect(user).mint(
        typeBox,
        ethers.utils.parseEther("24.5")
      ),
      "GI: Not the right box price"
    );
  });

  it("Set new URI", async () => {
    await OLYMInstace.connect(user).approve(
      HerosInstance.address,
      ethers.utils.parseEther("25")
    );
    const tx = await HerosInstance.connect(user).mint(
      typeBox,
      ethers.utils.parseEther("25")
    );
    await tx.wait();
    const tokenId = await HerosInstance.getCurrentId();
    const nonce = await user.getTransactionCount();
    const message = hashMessage(
      user.address,
      tokenId,
      heroURI,
      nonce,
      HerosInstance.address
    );
    const sig = await deployer.signMessage(ethers.utils.arrayify(message));
    await HerosInstance.connect(user).setTokenURI(tokenId, heroURI, nonce, sig);
    const tokenURI = await HerosInstance.tokenURI(1);
    expect(tokenURI).to.equal(heroURI);
  });

  it("Set URI for tokenId not existed", async () => {
    await OLYMInstace.connect(user).approve(
      HerosInstance.address,
      ethers.utils.parseEther("25")
    );
    await HerosInstance.connect(user).mint(
      typeBox,
      ethers.utils.parseEther("25")
    );
    const tokenURI = await HerosInstance.tokenURI(1);

    expect(tokenURI).to.equal(
      "https://gateway.pinata.cloud/ipfs/QmP7C3wUvQ5dGf9ccpoK1S47QLE1fgvwf6mEVwMBQmNTWb"
    );
    const nonce = await user.getTransactionCount();
    const message = hashMessage(
      user.address,
      2,
      heroURI,
      nonce,
      HerosInstance.address
    );
    const sig = await deployer.signMessage(ethers.utils.arrayify(message));
    await expectRevert(
      HerosInstance.connect(user).setTokenURI(2, heroURI, nonce, sig),
      "ERC721URIStorage: URI set of nonexistent token"
    );
  });

  it("Set new price box", async () => {
    const priceBoxBefore = await HerosInstance.boxPrice(typeBox);
    expect(priceBoxBefore.toString()).to.equal(boxPrice.toString());
    await HerosInstance.setBox(typeBox, newBoxPrice, boxURI);
    const priceBoxAfter = await HerosInstance.boxPrice(typeBox);
    expect(priceBoxAfter.toString()).to.equal(newBoxPrice.toString());
  });

  it("Set box price isnt deployer", async () => {
    await expectRevert(
      HerosInstance.connect(user).setBox(typeBox, newBoxPrice, boxURI),
      "Ownable: caller is not the owner"
    );
  });

  it("Update new box", async () => {
    const newTypeBox = 1;
    const priceNewTypwBox = ethers.utils.parseEther("30");
    const newBoxURI =
      "https://gateway.pinata.cloud/ipfs/QmTrG2qWgXBPoSYUTXRTybFhjkj62hjXGs3terNvU9tZYM";
    await HerosInstance.setBox(newTypeBox, newBoxPrice, newBoxURI);
    const priceBox1 = await HerosInstance.boxPrice(typeBox);
    expect(priceBox1.toString()).to.equal(boxPrice.toString());
    const priceBox2 = await HerosInstance.boxPrice(newTypeBox);
    expect(priceBox2.toString()).to.equal(priceNewTypwBox.toString());
  });

  it("Redeem lazy mint hero", async () => {
    const voucher = await createVoucher(
      deployer,
      heroURI,
      ethers.utils.parseEther("25"),
      HerosInstance.address
    );
    await OLYMInstace.connect(user).approve(
      HerosInstance.address,
      ethers.utils.parseEther("25")
    );
    const tx = await HerosInstance.connect(user).redeem(voucher);
    const tokenIdsUser = await HerosInstance.getAllTokenURIs(user.address);
    expect(tokenIdsUser[0]).to.equal(BigNumber.from(1));
    const tokenURIUser = await HerosInstance.tokenURI(tokenIdsUser[0]);
    expect(tokenURIUser).to.equal(heroURI);
  });
});
