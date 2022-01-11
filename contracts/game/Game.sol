// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../coin/IOLY.sol";
import "hardhat/console.sol";
import "../NFT/IGameItems.sol";

contract Game is Ownable {
    mapping(address => mapping(uint256 => bool)) private _usedNonce;
    address private _owner;

    event DepositToken(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint64 timestamp
    );

    event WithdrawToken(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint64 timestamp
    );

    event DepositNFT(
        address indexed user,
        address indexed token,
        uint256 tokenId,
        uint64 timestamp
    );

    event WithdrawNFT(
        address indexed user,
        address indexed token,
        uint256 tokenId,
        uint64 timestamp
    );

    constructor() {
    }

    function depositToken(address token, uint256 amount) public {
        if (amount > 0) {
            IOLY(token).transferFrom(_msgSender(), address(this), amount);
        }
        emit DepositToken(_msgSender(), token, amount, uint64(block.timestamp));
    }

    function depositNFT(address token, uint256 tokenId) public {
        IGameItems(token).transferFrom(
            _msgSender(),
            address(this),
            tokenId
        );

        emit DepositNFT(_msgSender(), token, tokenId, uint64(block.timestamp));
    }

    function withdrawToken(
        address token,
        uint256 amount,
        uint256 nonce,
        bytes memory signature
    ) public {
        require(!_usedNonce[_msgSender()][nonce], "Game:Nonce has used");
        _usedNonce[_msgSender()][nonce] = true;

        bytes32 rawMessage = keccak256(
            abi.encodePacked(_msgSender(), token, amount, nonce,address(this))
        );
        bytes memory s = abi.encodePacked(rawMessage);
        bytes32 message = keccak256(
            abi.encodePacked(
                "x19Ethereum Signed Message:\n",
                Strings.toString(s.length),
                s
            )
        );
        require(
            isValidAccessMessage(message, signature),
            "Game: Signature incorrect"
        );

        uint256 gameContractBalance = IOLY(token).balanceOf(address(this));
        if (gameContractBalance < amount) {
            return;
        }
        IOLY(token).transfer(_msgSender(), amount);
        emit WithdrawToken(_msgSender(), token, amount, uint64(block.timestamp));
    }

    function withdrawNFT(
        address token,
        uint256 tokenId,
        uint256 nonce,
        bytes memory signature
    ) public {
        require(!_usedNonce[_msgSender()][nonce], "Game:Nonce has used");
        _usedNonce[_msgSender()][nonce] = true;

        bytes32 rawMessage = keccak256(
            abi.encodePacked(_msgSender(), token, tokenId, nonce,address(this))
        );
        bytes memory s = abi.encodePacked(rawMessage);
        bytes32 message = keccak256(
            abi.encodePacked(
                "x19Ethereum Signed Message:\n",
                Strings.toString(s.length),
                s
            )
        );
        require(
            isValidAccessMessage(message, signature),
            "Game: Signature incorrect"
        );

        IGameItems(token).safeTransferFrom(
            address(this),
            _msgSender(),
            tokenId
        );

        emit WithdrawNFT(_msgSender(), token, tokenId, uint64(block.timestamp));
    }

    function splitSignature(bytes memory sig)
        internal
        pure
        returns (
            uint8 v,
            bytes32 r,
            bytes32 s
        )
    {
        require(sig.length == 65, "Signature isn't validate");

        assembly {
            // first 32 bytes, after the length prefix.
            r := mload(add(sig, 32))
            // second 32 bytes.
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes).
            v := byte(0, mload(add(sig, 96)))
        }
        return (v, r, s);
    }

    function isValidAccessMessage(bytes32 message, bytes memory signature)
        public
        view
        returns (bool)
    {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);
        return ecrecover(message, v, r, s) == owner();
    }
}
