// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
contract BlackList is Ownable{
    mapping(address => bool) public isBlackListed;

    event AddBlackList(address indexed _user);
    event RemoveBlackList(address indexed _user);

    function getOwner() external view returns (address){
        return owner();
    }

    function getBlacklistedStatus(address _checker) external view returns (bool){
        return isBlackListed[_checker];
    }

    function addBlackList(address _evilUser) public onlyOwner {
        isBlackListed[_evilUser] = true;
        emit AddBlackList(_evilUser);
    }

    function removeBlackList(address _clearUser) public onlyOwner{
        isBlackListed[_clearUser] = false;
        emit RemoveBlackList(_clearUser);
    }
}
