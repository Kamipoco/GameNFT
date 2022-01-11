/* eslint-disable node/no-missing-import */
/* eslint-disable no-unused-vars */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

let deployer: SignerWithAddress, user: SignerWithAddress;
let MarketplaceInstance: Contract,
  HeroInstance: Contract,
  OLYMInstance: Contract;

describe("Game smartcontract test", () => {
  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    user = accounts[1];

    const OLYMContract = await ethers.getContractFactory("OLYM", deployer);
    OLYMInstance = OLYMContract.attach(
      "0x8868fc4e3cD70fE208da85d5376c5cebcC1A0e78"
    );
    const marketplaceContractFactory = await ethers.getContractFactory(
      "Marketplace",
      deployer
    );
    MarketplaceInstance = marketplaceContractFactory.attach(
      "0x617C815C1bCfaD77929D97912e1d40a0F3D74ECD"
    );
    const herosFactory = await ethers.getContractFactory("Heros", deployer);
    HeroInstance = herosFactory.attach(
      "0xc35E2B0de280405f557Bb2F22c54a03dAB416ddE"
    );
  });

  it("should be able to offer item on marketplace", async () => {
    await OLYMInstance.connect(user).approve(
      HeroInstance.address,
      ethers.utils.parseEther("25")
    );
    await HeroInstance.connect(user).mint(1, ethers.utils.parseEther("25"));
    const tokenIds = await HeroInstance.connect(user).getAllTokenURIs(
      user.address
    );
    const lastTokenId = tokenIds[tokenIds.length - 1].toString();
    await HeroInstance.connect(user).approve(
      MarketplaceInstance.address,
      lastTokenId
    );

    const tx = await MarketplaceInstance.connect(user).offer(
      lastTokenId,
      HeroInstance.address,
      ethers.utils.parseEther("30")
    );
    const receipt = await tx.wait();
    const event = receipt.events?.filter((x: any) => {
      return x.event === "Offer";
    });
    const itemId = event[0].args.itemId.toString();

    expect((await MarketplaceInstance.available(itemId)).exists).to.equal(true);
    expect(await HeroInstance.ownerOf(lastTokenId)).to.equal(
      MarketplaceInstance.address
    );
  });

  it("should be able to buy item on marketplace", async () => {
    await OLYMInstance.connect(user).approve(
      HeroInstance.address,
      ethers.utils.parseEther("25")
    );
    await HeroInstance.connect(user).mint(1, ethers.utils.parseEther("25"));
    const tokenIds = await HeroInstance.connect(user).getAllTokenURIs(
      user.address
    );
    const lastTokenId = tokenIds[tokenIds.length - 1].toString();
    await HeroInstance.connect(user).approve(
      MarketplaceInstance.address,
      lastTokenId
    );

    const tx = await MarketplaceInstance.connect(user).offer(
      lastTokenId,
      HeroInstance.address,
      ethers.utils.parseEther("30")
    );
    const receipt = await tx.wait();
    const event = receipt.events?.filter((x: any) => {
      return x.event === "Offer";
    });
    const itemId = event[0].args.itemId.toString();

    await OLYMInstance.connect(deployer).approve(
      MarketplaceInstance.address,
      ethers.utils.parseEther("30")
    );
    const tx1 = await MarketplaceInstance.connect(deployer).buy(itemId);
    await tx1.wait();
    expect(!(await MarketplaceInstance.available(itemId)).exists).to.equal(
      true
    );
    expect(await HeroInstance.ownerOf(lastTokenId)).to.equal(deployer.address);
  });

  it("should be able to withdraw item from marketplace", async () => {
    await OLYMInstance.connect(user).approve(
      HeroInstance.address,
      ethers.utils.parseEther("25")
    );
    await HeroInstance.connect(user).mint(1, ethers.utils.parseEther("25"));
    const tokenIds = await HeroInstance.connect(user).getAllTokenURIs(
      user.address
    );
    const lastTokenId = tokenIds[tokenIds.length - 1].toString();
    await HeroInstance.connect(user).approve(
      MarketplaceInstance.address,
      lastTokenId
    );

    const tx = await MarketplaceInstance.connect(user).offer(
      lastTokenId,
      HeroInstance.address,
      ethers.utils.parseEther("30")
    );
    const receipt = await tx.wait();
    const event = receipt.events?.filter((x: any) => {
      return x.event === "Offer";
    });
    const itemId = event[0].args.itemId.toString();

    const tx1 = await MarketplaceInstance.connect(user).withdraw(itemId);
    await tx1.wait();
    expect(await HeroInstance.ownerOf(lastTokenId)).to.equal(user.address);
  });
});
