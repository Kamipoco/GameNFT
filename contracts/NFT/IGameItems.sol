pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IGameItems is IERC721 {
   struct AllTokenURI {
    uint256 tokenId;
    string tokenURI;
  }
  function mint() external payable returns (uint256);
  function setTokenURI(uint256 tokenId, string memory tokenURI) external;
  function getAllTokenURIs(address user) external returns(AllTokenURI[] memory);
}
