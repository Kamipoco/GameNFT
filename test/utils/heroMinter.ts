/* eslint-disable node/no-unsupported-features/es-syntax */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import hre from "hardhat";

const SIGNING_DOMAIN_NAME = "Hero-Voucher";
const SIGNING_DOMAIN_VERSION = "1";
export const createVoucher = async (
  signer: SignerWithAddress,
  uri: string,
  minPrice: BigNumber = BigNumber.from(0),
  contract: string
) => {
  const voucher = { uri, minPrice };
  const domain = {
    name: SIGNING_DOMAIN_NAME,
    version: SIGNING_DOMAIN_VERSION,
    verifyingContract: contract,
    chainId: hre.network.config.chainId,
  };
  const types = {
    HeroVoucher: [
      { name: "minPrice", type: "uint256" },
      { name: "uri", type: "string" },
    ],
  };
  const signature = await signer._signTypedData(domain, types, voucher);
  return {
    ...voucher,
    signature,
  };
};
