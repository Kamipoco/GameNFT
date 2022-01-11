/* eslint-disable node/no-missing-import */
/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { deployOLYM } from "../../scripts/coin/deployOLYM";
import { deploySeedSale } from "../../scripts/vesting/deploySeedSale";
const {
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time,
  snapshot,
} = require("@openzeppelin/test-helpers");

const SECONDS_OF_MONTH = 2592000;
let deployer: SignerWithAddress,
  beneficiary: SignerWithAddress,
  privateSale: SignerWithAddress,
  publicSale: SignerWithAddress,
  advisors: SignerWithAddress,
  team: SignerWithAddress,
  marketing: SignerWithAddress,
  game: SignerWithAddress,
  farmingStaking: SignerWithAddress,
  liquidity: SignerWithAddress;
let durationSeconds: number, startTimestamp: number;
let firstReleaseAmount: BigNumber;
let SeedSaleInstance: Contract;
let OLYMInstance: Contract;
let snapshotA: any;
describe("Seed sale", () => {
  beforeEach(async () => {
    if (!snapshotA) {
      snapshotA = await snapshot();
    } else {
      await snapshotA.restore();
    }

    [
      deployer,
      beneficiary,
      privateSale,
      publicSale,
      advisors,
      team,
      marketing,
      game,
      farmingStaking,
      liquidity
    ] = await ethers.getSigners();
    durationSeconds = 12 * 2592000;

    // startTimestamp = Math.floor((new Date()).valueOf()) + 4 * 2592000000;
    startTimestamp = (await time.latest()).toNumber(10) + 4 * SECONDS_OF_MONTH + 5 * 60;
    firstReleaseAmount = ethers.utils.parseEther("5000000");
    SeedSaleInstance = await deploySeedSale(beneficiary.address, startTimestamp, durationSeconds, firstReleaseAmount);
    OLYMInstance = await deployOLYM(
      SeedSaleInstance.address,
      privateSale.address,
      publicSale.address,
      advisors.address,
      team.address,
      marketing.address,
      game.address,
      farmingStaking.address,
      liquidity.address
    );
    await SeedSaleInstance.setTokenVesting(OLYMInstance.address);
  });
  it("OLYM Balance of SeedSale is 50,000,000", async () => {
    const seedSaleBalance = await OLYMInstance.balanceOf(SeedSaleInstance.address);
    expect(ethers.utils.formatEther(seedSaleBalance.toString())).to.equal("50000000.0");

  });
  it("First release", async () => {
    await SeedSaleInstance.connect(deployer).firstRelease();
    const benificiacyBalance = await OLYMInstance.balanceOf(beneficiary.address);
    expect(ethers.utils.formatEther(benificiacyBalance.toString())).to.equal("5000000.0");
  });

  it("Block vesting 4 month", async () => {
    await SeedSaleInstance.connect(deployer).firstRelease();
    let benificiacyBalance = await OLYMInstance.balanceOf(beneficiary.address);
    expect(ethers.utils.formatEther(benificiacyBalance.toString())).to.equal("5000000.0");

    await time.increase(time.duration.days(30));

    await SeedSaleInstance.release();
    benificiacyBalance = await OLYMInstance.balanceOf(beneficiary.address);
    expect(ethers.utils.formatEther(benificiacyBalance.toString())).to.equal("5000000.0");

    await time.increase(time.duration.days(30));
    await SeedSaleInstance.release();
    benificiacyBalance = await OLYMInstance.balanceOf(beneficiary.address);
    expect(ethers.utils.formatEther(benificiacyBalance.toString())).to.equal("5000000.0");

    await time.increase(time.duration.days(30));
    await SeedSaleInstance.release();
    benificiacyBalance = await OLYMInstance.balanceOf(beneficiary.address);
    expect(ethers.utils.formatEther(benificiacyBalance.toString())).to.equal("5000000.0");

    await time.increase(time.duration.days(30));
    await SeedSaleInstance.release();
    benificiacyBalance = await OLYMInstance.balanceOf(beneficiary.address);
    expect(ethers.utils.formatEther(benificiacyBalance.toString())).to.equal("5000000.0");

  });

  it("Start vesting from 5 month", async () => {
    await time.increase(time.duration.days(5 * 30));
    await SeedSaleInstance.release();
    const benificiacyBalance = await OLYMInstance.balanceOf(beneficiary.address);
    console.log("benificiacyBalance", benificiacyBalance.toString());
  });

  it("Linear distribution in 12 month", async () => {
    let listReleased: Array<Object> = [];
    // 0
    await SeedSaleInstance.connect(deployer).firstRelease();
    let benificiacyBalance = (await OLYMInstance.balanceOf(beneficiary.address)).toString();
    listReleased.push({ month: 0, value: ethers.utils.formatEther(benificiacyBalance).toString() });
    // 1
    await time.increase(time.duration.days(5 * 30));
    await SeedSaleInstance.release();
    benificiacyBalance = (await OLYMInstance.balanceOf(beneficiary.address)).toString();
    listReleased.push({ month: 4, value: ethers.utils.formatEther(benificiacyBalance).toString() });
    // 2
    await time.increase(time.duration.days(30));
    await SeedSaleInstance.release();
    benificiacyBalance = (await OLYMInstance.balanceOf(beneficiary.address)).toString();
    listReleased.push({ month: 5, value: ethers.utils.formatEther(benificiacyBalance).toString() });
    // 3
    await time.increase(time.duration.days(30));
    await SeedSaleInstance.release();
    benificiacyBalance = (await OLYMInstance.balanceOf(beneficiary.address)).toString();
    listReleased.push({ month: 6, value: ethers.utils.formatEther(benificiacyBalance).toString() });
    // 4
    await time.increase(time.duration.days(30));
    await SeedSaleInstance.release();
    benificiacyBalance = (await OLYMInstance.balanceOf(beneficiary.address)).toString();
    listReleased.push({ month: 7, value: ethers.utils.formatEther(benificiacyBalance).toString() });
    // 5
    await time.increase(time.duration.days(30));
    await SeedSaleInstance.release();
    benificiacyBalance = (await OLYMInstance.balanceOf(beneficiary.address)).toString();
    listReleased.push({ month: 8, value: ethers.utils.formatEther(benificiacyBalance).toString() });
    // 6
    await time.increase(time.duration.days(30));
    await SeedSaleInstance.release();
    benificiacyBalance = (await OLYMInstance.balanceOf(beneficiary.address)).toString();
    listReleased.push({ month: 9, value: ethers.utils.formatEther(benificiacyBalance).toString() });
    // 7
    await time.increase(time.duration.days(30));
    await SeedSaleInstance.release();
    benificiacyBalance = (await OLYMInstance.balanceOf(beneficiary.address)).toString();
    listReleased.push({ month: 10, value: ethers.utils.formatEther(benificiacyBalance).toString() });
    // 8
    await time.increase(time.duration.days(30));
    await SeedSaleInstance.release();
    benificiacyBalance = (await OLYMInstance.balanceOf(beneficiary.address)).toString();
    listReleased.push({ month: 11, value: ethers.utils.formatEther(benificiacyBalance).toString() });
    // 9
    await time.increase(time.duration.days(30));
    await SeedSaleInstance.release();
    benificiacyBalance = (await OLYMInstance.balanceOf(beneficiary.address)).toString();
    listReleased.push({ month: 12, value: ethers.utils.formatEther(benificiacyBalance).toString() });
    // 10
    await time.increase(time.duration.days(30));
    await SeedSaleInstance.release();
    benificiacyBalance = (await OLYMInstance.balanceOf(beneficiary.address)).toString();
    listReleased.push({ month: 13, value: ethers.utils.formatEther(benificiacyBalance).toString() });
    // 11
    await time.increase(time.duration.days(30));
    await SeedSaleInstance.release();
    benificiacyBalance = (await OLYMInstance.balanceOf(beneficiary.address)).toString();
    listReleased.push({ month: 14, value: ethers.utils.formatEther(benificiacyBalance).toString() });
    // 12
    await time.increase(time.duration.days(30));
    await SeedSaleInstance.release();
    benificiacyBalance = (await OLYMInstance.balanceOf(beneficiary.address)).toString();
    listReleased.push({ month: 15, value: ethers.utils.formatEther(benificiacyBalance).toString() });
    // 13
    await time.increase(time.duration.days(30));
    await SeedSaleInstance.release();
    benificiacyBalance = (await OLYMInstance.balanceOf(beneficiary.address)).toString();
    listReleased.push({ month: 16, value: ethers.utils.formatEther(benificiacyBalance).toString() });
    // 14
    await time.increase(time.duration.days(30));
    await SeedSaleInstance.release();
    benificiacyBalance = (await OLYMInstance.balanceOf(beneficiary.address)).toString();
    listReleased.push({ month: 17, value: ethers.utils.formatEther(benificiacyBalance).toString() });

    console.log("Listed release: ", listReleased);

  });


});
