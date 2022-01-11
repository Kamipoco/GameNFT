/* eslint-disable no-unused-vars */
/* eslint-disable node/no-extraneous-import */
/* eslint-disable node/no-missing-import */
import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployOLYM } from "../../scripts/coin/deployOLYM";
const {
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time,
  snapshot,
} = require("@openzeppelin/test-helpers");

let OLYMInstance: Contract;
let deployer: SignerWithAddress,
  user: SignerWithAddress,
  client: SignerWithAddress,
  seedSale: SignerWithAddress,
  privateSale: SignerWithAddress,
  publicSale: SignerWithAddress,
  advisors: SignerWithAddress,
  team: SignerWithAddress,
  marketing: SignerWithAddress,
  game: SignerWithAddress,
  farmingStaking: SignerWithAddress,
  liquidity: SignerWithAddress;

describe("OLYM", async () => {
  beforeEach(async () => {
    [
      deployer,
      user,
      client,
      seedSale,
      privateSale,
      publicSale,
      advisors,
      team,
      marketing,
      game,
      farmingStaking,
      liquidity,
    ] = await ethers.getSigners();

    OLYMInstance = await deployOLYM(
      seedSale.address,
      privateSale.address,
      publicSale.address,
      advisors.address,
      team.address,
      marketing.address,
      game.address,
      farmingStaking.address,
      liquidity.address
    );
  });

  it("Mint to user address", async () => {
    // Mint 1000 OLYM to user
    const tx = await OLYMInstance.mint(
      user.address,
      ethers.utils.parseEther("1000")
    );
    const userOLYMBalance = await OLYMInstance.balanceOf(user.address);
    expect(ethers.utils.parseUnits(userOLYMBalance.toString(), "wei")).to.equal(
      ethers.utils.parseEther("1000")
    );
  });

  it("Mint to zero address: ", async () => {
    // Mint 1000 OLYM to zero address
    await expectRevert(
      OLYMInstance.mint(
        "0x0000000000000000000000000000000000000000",
        ethers.utils.parseEther("1000")
      ),
      "ERC20: mint to the zero address"
    );
  });

  it("Mint", async () => {
    // Mint to user 1 billion token
    await OLYMInstance.mint(user.address, ethers.utils.parseEther("999999999"));
    const userOLYMBalance = await OLYMInstance.balanceOf(user.address);
    expect(ethers.utils.parseUnits(userOLYMBalance.toString(), "wei")).to.equal(
      ethers.utils.parseEther("999999999")
    );
    // Trying to mint 10 token for the client
    await OLYMInstance.mint(client.address, ethers.utils.parseEther("10"));
  });

  it("Owner OLYM transfer to '_to(user)' 1000 token ", async () => {
    // Mint to sender 1000 OLYM token
    await OLYMInstance.mint(deployer.address, ethers.utils.parseEther("1000"));
    const senderOLYMBalance = await OLYMInstance.balanceOf(deployer.address);
    expect(
      ethers.utils.parseUnits(senderOLYMBalance.toString(), "wei")
    ).to.equal(ethers.utils.parseEther("1000"));
    // Is sender black user?
    const senderStatus = await OLYMInstance.isBlackListed(deployer.address);
    expect(senderStatus).to.equal(false);
    // Deployer transder to  user is 1000 OLYM token
    await OLYMInstance.transfer(user.address, ethers.utils.parseEther("1000"));
    const userOLYMBalance = await OLYMInstance.balanceOf(user.address);
    expect(ethers.utils.parseUnits(userOLYMBalance.toString(), "wei")).to.equal(
      ethers.utils.parseEther("1000")
    );
  });

  it("Sender is black user", async () => {
    // Set sender is black user
    await OLYMInstance.addBlackList(deployer.address);
    const senderStatus = await OLYMInstance.isBlackListed(deployer.address);
    expect(senderStatus).to.equal(true);
    // Mint sender 1000 OLYM token
    await OLYMInstance.mint(deployer.address, ethers.utils.parseEther("1000"));
    const senderOLYMBalance = await OLYMInstance.balanceOf(deployer.address);
    expect(
      ethers.utils.parseUnits(senderOLYMBalance.toString(), "wei")
    ).to.equal(ethers.utils.parseEther("1000"));

    await expectRevert(
      OLYMInstance.transfer(user.address, ethers.utils.parseEther("1000")),
      "OLYM: Sender is black user"
    );
  });

  it("User send 1000 OLYM to client by client", async () => {
    // User approved to cleint use to 1000 OLYM
    await OLYMInstance.connect(user).approve(
      client.address,
      ethers.utils.parseEther("1000")
    );
    const clienSpendingUser = await OLYMInstance.allowance(
      user.address,
      client.address
    );
    expect(
      ethers.utils.parseUnits(clienSpendingUser.toString(), "wei")
    ).to.equal(ethers.utils.parseEther("1000"));
    // Mint to user 1000 OLYM
    await OLYMInstance.mint(user.address, ethers.utils.parseEther("1000"));
    const userOLYMBalance = await OLYMInstance.balanceOf(user.address);
    expect(ethers.utils.parseUnits(userOLYMBalance.toString(), "wei")).to.equal(
      ethers.utils.parseEther("1000")
    );

    // Clien takes 1000 OLYM from user
    await OLYMInstance.connect(client).transferFrom(
      user.address,
      client.address,
      ethers.utils.parseEther("1000")
    );
    const clientOLYMBalance = await OLYMInstance.balanceOf(client.address);
    expect(
      ethers.utils.parseUnits(clientOLYMBalance.toString(), "wei")
    ).to.equal(ethers.utils.parseEther("1000"));
  });

  it("The client takes 1000 OLYM from user but the user still isn't approve yet ", async () => {
    // Mint to the user 1000 OLYM
    await OLYMInstance.mint(user.address, ethers.utils.parseEther("1000"));
    const userOLYMBalance = await OLYMInstance.balanceOf(user.address);
    expect(ethers.utils.parseUnits(userOLYMBalance.toString(), "wei")).to.equal(
      ethers.utils.parseEther("1000")
    );

    // Clien takes 1000 OLYM from user
    await expectRevert(
      OLYMInstance.connect(client).transferFrom(
        user.address,
        client.address,
        ethers.utils.parseEther("1000")
      ),
      "OLYM: exceed allownce"
    );
  });

  it("Pause exchange OLYM token", async () => {
    // Mint user 1000 OLYM token
    await OLYMInstance.mint(user.address, ethers.utils.parseEther("1000"));
    const userOLYMBalance = await OLYMInstance.balanceOf(user.address);
    expect(ethers.utils.parseUnits(userOLYMBalance.toString(), "wei")).to.equal(
      ethers.utils.parseEther("1000")
    );
    // pause OLYM exchange
    await OLYMInstance.pause();
    const oylmStatus = await OLYMInstance.paused();
    expect(oylmStatus).to.equal(true);
    // User send to client1000 OLYM
    await expectRevert(
      OLYMInstance.connect(user).transfer(
        client.address,
        ethers.utils.parseEther("1000")
      ),
      "Pausable: paused"
    );
  });

  it("Pause and unpause OLYM", async () => {
    // Pause OLYM
    await OLYMInstance.pause();
    let oylmStatus = await OLYMInstance.paused();
    expect(oylmStatus).to.equal(true);

    // Unpause OLYM
    await OLYMInstance.unpause();
    oylmStatus = await OLYMInstance.paused();
    expect(oylmStatus).to.equal(false);
  });

  it("Client is payer tax", async () => {
    // Mint to the user 1000 OLYM
    await OLYMInstance.mint(user.address, ethers.utils.parseEther("1000"));
    const userOLYMBalance = await OLYMInstance.balanceOf(user.address);
    expect(ethers.utils.parseUnits(userOLYMBalance.toString(), "wei")).to.equal(
      ethers.utils.parseEther("1000")
    );
    // Add the client into payer tax list
    await OLYMInstance.addPayerTax(client.address);
    const clientTaxStatus = await OLYMInstance._isPayerTax(client.address);
    expect(clientTaxStatus).to.equal(true);

    // The user transfer to the client is 1000 OLYM, tax the client pay is 2%
    await OLYMInstance.connect(user).transfer(
      client.address,
      ethers.utils.parseEther("1000")
    );
    const balanceOLYMClient = await OLYMInstance.balanceOf(client.address);
    const feeKeeperOLYMBalance = await OLYMInstance.balanceOf(deployer.address);
    expect(
      ethers.utils.parseUnits(balanceOLYMClient.toString(), "wei")
    ).to.equal(ethers.utils.parseEther("980"));
    expect(
      ethers.utils.parseUnits(feeKeeperOLYMBalance.toString(), "wei")
    ).to.equal(ethers.utils.parseEther("20"));
  });
});
