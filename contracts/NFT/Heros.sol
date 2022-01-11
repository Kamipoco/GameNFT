// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "../coin/OLYM.sol";


contract Heros is Ownable, EIP712, ERC721URIStorage {
  using Counters for Counters.Counter;
  using Strings for uint256;

  Counters.Counter private _tokenIds;
  address public olymAddress;
  string private constant SIGNING_DOMAIN = "Hero-Voucher";
  string private constant SIGNATURE_VERSION = "1";

  struct BoxInfo {
    uint256 price;
    string boxURI;
  }

  struct HeroVoucher {
    uint256 minPrice;
    string uri;
    bytes signature;
  }

  mapping(address => uint256[]) public allTokenIds;
  mapping(address => mapping(uint256 => bool)) private _usedNonce;
  mapping(uint => BoxInfo) public boxs;

  event Mint(address indexed from, uint256 tokenId, string tokenURI);
  event Redeem(address indexed from, uint256 tokenId, string tokenURI);
  event SetNewURI(address indexed user, uint256 tokenId, string newTokenURI);

  constructor(address _olymAdd)
  ERC721("The Olympus","OLYM")
  EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION){
    olymAddress = _olymAdd;
  }

  function setBox(uint typeBox, uint256 priceBox, string memory boxUri) external onlyOwner {
    BoxInfo memory newBox = BoxInfo({price:priceBox,boxURI:boxUri});
    boxs[typeBox] = newBox;
  }

  function boxPrice(uint typeBox) public view returns (uint256){
    return boxs[typeBox].price;
  }

  function mint(uint typeBox, uint256 amount) public {
    require(amount == boxs[typeBox].price, "GI: Not the right box price");

    OLYM(olymAddress).transferFrom(_msgSender(),address(this),amount);

    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();
    _mint(_msgSender(),newItemId);

    _setTokenURI(newItemId, boxs[typeBox].boxURI);
    string memory tokenUri = tokenURI(newItemId);

    emit Mint(_msgSender(),newItemId,tokenUri);
  }

  function redeem(HeroVoucher calldata voucher) public {
    // make sure signature is valid and get the address of the signer
    address signer = _verify(voucher);
    // make sure that the signer is authorized to mint NFTs
    require(signer == owner(), "Signature invalid or unauthorized");
    // record payment to signer's withdrawal balance
    OLYM(olymAddress).transferFrom(_msgSender(),address(this),voucher.minPrice);
    // first assign the token to the signer, to establish provenance on-chain
    _tokenIds.increment();
    uint256 tokenId = _tokenIds.current();

    _mint(signer, tokenId);
    _setTokenURI(tokenId, voucher.uri);

    // transfer the token to the redeemer
    _transfer(signer, _msgSender(), tokenId);

    emit Redeem(_msgSender(),tokenId,voucher.uri);
  }

  function getCurrentId() public view returns(uint256){
    return _tokenIds.current();
  }

  function getAllTokenURIs(address user) public view returns(uint256[] memory){
    return allTokenIds[user];
  }

  function setTokenURI(uint256 tokenId, string memory tokenURI,uint256 nonce, bytes memory signature) public {
    require(!_usedNonce[_msgSender()][nonce],"GI: Nonce has used");
    _usedNonce[_msgSender()][nonce] = true;
    bytes32 rawMessage = keccak256(abi.encodePacked(_msgSender(),tokenId, tokenURI, nonce, address(this)));
    bytes memory s = abi.encodePacked(rawMessage);
    bytes32 message = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n",Strings.toString(s.length),s));
    require(isValidAccessMessage(message,signature),"GI: Signature invalid");

    _setTokenURI(tokenId,tokenURI);
    emit SetNewURI(_msgSender(),tokenId,tokenURI);
  }

  function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override {
    super._beforeTokenTransfer(from, to, tokenId);
    if(from != address(0) ){
      uint256 balanceUser = balanceOf(from);
      removeToken(from,balanceUser, tokenId);
    }
    allTokenIds[to].push(tokenId);
  }

  function removeToken(address user, uint256 balanceUser, uint256 tokenId) internal  {
    uint256[] storage tokenIdUser = allTokenIds[user];
    for(uint i = 0; i < balanceUser; i++){
      uint256 id = tokenIdUser[i];
      if(id == tokenId){
        tokenIdUser[i] = tokenIdUser[balanceUser - 1];
        tokenIdUser.pop();
        break;
      }
    }
  }

  function splitSignature(bytes memory sig) internal pure returns(uint8 v, bytes32 r, bytes32 s) {
      require(sig.length == 65, "Signature isn't validate");

      assembly {
          // first 32 bytes, after the length prefix.
          r := mload(add(sig, 32))
          // second 32 bytes.
          s := mload(add(sig, 64))
          // final byte (first byte of the next 32 bytes).
          v := byte(0, mload(add(sig, 96)))
      }
      return (v,r,s);
  }

  function isValidAccessMessage(bytes32 message, bytes memory signature) internal view returns (bool){
      (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);
      return ecrecover(message,v,r,s) == owner();
  }

  function _verify(HeroVoucher calldata voucher) internal view returns (address) {
    bytes32 digest = _hash(voucher);
    return ECDSA.recover(digest, voucher.signature);
  }

  function _hash(HeroVoucher calldata voucher) internal view returns (bytes32) {
    return _hashTypedDataV4(keccak256(abi.encode(
      keccak256("HeroVoucher(uint256 minPrice,string uri)"),
      voucher.minPrice,
      keccak256(bytes(voucher.uri))
    )));
  }

}
