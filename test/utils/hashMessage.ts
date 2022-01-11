import { ethers } from "hardhat";

export const hashMessage = (
  from: string,
  tokenId: number,
  tokenURI: string,
  nonce: number,
  contract: string
) => {
  return ethers.utils.solidityKeccak256(
    ["address", "uint256", "string", "uint256", "address"],
    [from, tokenId, tokenURI, nonce, contract]
  );
};
