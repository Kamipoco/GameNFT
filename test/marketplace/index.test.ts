/* eslint-disable node/no-missing-import */
/* eslint-disable no-unused-vars */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { deployOLYM } from "../../scripts/coin/deployOLYM";
import { deployMarketplace } from "../../scripts/marketplace/deploytMarketplace";
import { deployHeros } from "../../scripts/NFT/deployHeros";

let deployer: SignerWithAddress, user: SignerWithAddress;
let MarketplaceInstance: Contract, HeroInstance: Contract, OLYMInstance: Contract;

describe("Game smartcontract test", () => {
  beforeEach(async () => {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    user = accounts[1];
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
    MarketplaceInstance = await deployMarketplace(OLYMInstance.address);
    HeroInstance = await deployHeros(OLYMInstance.address)

    await HeroInstance.setBox(1, ethers.utils.parseUnits("25"), "")

    await OLYMInstance.connect(user).approve(
      HeroInstance.address,
      ethers.utils.parseEther("25")
    );

    await HeroInstance.connect(user).mint(1, ethers.utils.parseEther("25"));
  });

  it('should be able to offer item on marketplace', async () => {
    await HeroInstance.connect(user).approve(
      MarketplaceInstance.address,
      1
    )

    await MarketplaceInstance.connect(user).offer(
      1,
      HeroInstance.address,
      ethers.utils.parseEther("30")
    )

    expect((await MarketplaceInstance.available(1)).exists).to.equal(true);
    expect((await HeroInstance.ownerOf(1))).to.equal(MarketplaceInstance.address);
  })

  it('should be able to buy item on marketplace', async () => {
    await HeroInstance.connect(user).approve(
      MarketplaceInstance.address,
      1
    )

    await MarketplaceInstance.connect(user).offer(
      1,
      HeroInstance.address,
      ethers.utils.parseEther("30")
    )

    await OLYMInstance.approve(
      MarketplaceInstance.address,
      ethers.utils.parseEther("30")
    )

    await MarketplaceInstance.buy((await MarketplaceInstance.available(1)).tokenId)

    expect(!!(await MarketplaceInstance.available(1)).exists).to.equal(false);
    expect(await HeroInstance.ownerOf(1)).to.equal(deployer.address);
  })

  it('should be able to withdraw item from marketplace', async () => {
    await HeroInstance.connect(user).approve(
      MarketplaceInstance.address,
      1
    )

    await MarketplaceInstance.connect(user).offer(
      1,
      HeroInstance.address,
      ethers.utils.parseEther("30")
    )

    await MarketplaceInstance.connect(user).withdraw(
      1
    )

    expect(await HeroInstance.ownerOf(1)).to.equal(user.address);
  })
});
