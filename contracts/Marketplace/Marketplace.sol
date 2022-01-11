pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../coin/IOLY.sol";

contract Marketplace is ReentrancyGuard {
    using Counters for Counters.Counter;

    struct Item {
        uint256 tokenId;
        address itemContract;
        address owner;
        uint256 price;
        bool exists;
    }

    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address public tokenContract;
    mapping(uint256 => Item) public available;

    event Offer(
        uint256 itemId,
        uint256 tokenId,
        address itemContract,
        address owner,
        uint256 price,
        uint64 timestamp
    );

    event Buy(
        uint256 itemId,
        uint256 tokenId,
        address itemContract,
        address buyer,
        uint256 price,
        uint64 timestamp
    );

    event Withdraw(
        uint256 itemId,
        uint256 tokenId,
        address itemContract,
        address owner,
        uint64 timestamp
    );

    constructor(address _tokenContract) {
        tokenContract = _tokenContract;
    }

    function offer(
        uint256 tokenId,
        address itemContract,
        uint256 price
    ) public nonReentrant {
        // TODO: listing fee, not really needed, just here to consider

        IERC721(itemContract).transferFrom(
            address(msg.sender),
            address(this),
            tokenId
        );
        _itemIds.increment();
        available[_itemIds.current()] = Item({
            tokenId: tokenId,
            itemContract: itemContract,
            owner: msg.sender,
            price: price,
            exists: true
        });

        emit Offer(
            _itemIds.current(),
            tokenId,
            itemContract,
            msg.sender,
            price,
            uint64(block.timestamp)
        );
    }

    function buy(uint256 itemId) public nonReentrant {
        require(available[itemId].exists, "Item not in marketplace");
        require(
            available[itemId].owner != msg.sender,
            "You cannot buy your own NFT"
        );

        Item memory buyItem = available[itemId];

        // TODO: royalties, do we need this?

        IOLY(tokenContract).transferFrom(
            msg.sender,
            buyItem.owner,
            buyItem.price
        );
        IERC721(buyItem.itemContract).transferFrom(
            address(this),
            address(msg.sender),
            buyItem.tokenId
        );
        _itemsSold.increment();

        emit Buy(
            itemId,
            buyItem.tokenId,
            buyItem.itemContract,
            msg.sender,
            buyItem.price,
            uint64(block.timestamp)
        );

        delete available[itemId];
    }

    function withdraw(uint256 itemId) public nonReentrant {
        require(
            available[itemId].owner == msg.sender,
            "You don't own this NFT"
        );

        Item memory withdrawItem = available[itemId];

        IERC721(withdrawItem.itemContract).transferFrom(
            address(this),
            address(msg.sender),
            withdrawItem.tokenId
        );

        emit Withdraw(
            itemId,
            withdrawItem.tokenId,
            withdrawItem.itemContract,
            msg.sender,
            uint64(block.timestamp)
        );

        delete available[itemId];
    }
}
