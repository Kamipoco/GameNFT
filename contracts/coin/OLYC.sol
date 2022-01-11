// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./support/BlackList.sol";

contract OLYC is ERC20, Ownable, BlackList, Pausable{
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    uint256 public _burnAmount;
    uint256 public _tax;
    uint256 public _dirtyFunds;
    address public _feeKeeper;
    address public _miningAddress;
    mapping(address => bool) public _excludedTax;
    mapping(address => bool) public _isPayerTax;

    event BurnBlackFunds(address indexed blackListedUser, uint256 indexed funds);
    event MintBlackFunds(uint256 indexed dirtyFunds);

    constructor(address miningAddress) ERC20("The Olympus", "OLYC"){
        _feeKeeper = _msgSender();
        _excludedTax[_msgSender()] = true;
        _tax = 200;
        _miningAddress = miningAddress;
    }

    function setTax(uint256 tax) external onlyOwner{
        _tax = tax;
    }

    function addPayerTax(address _user) external onlyOwner{
        _isPayerTax[_user] = true;
    }

    function removePayerTax(address _user) external onlyOwner{
        _isPayerTax[_user] = false;
    }

    function addExcludedTaxAddress(address _user) external onlyOwner {
        _excludedTax[_user] = true;
    }

    function removeExcludedTaxAddress(address _user) external onlyOwner {
        _excludedTax[_user] = false;
    }

    function pause() external virtual  onlyOwner whenNotPaused {
        _pause();
    }

    function unpause() external virtual onlyOwner whenPaused {
        _unpause();
    }

    function mintBlackFunds() external onlyOwner {
        require(_dirtyFunds > 0, "OLYM:Empty dirty funds");
        _mint(_miningAddress,_dirtyFunds);
        _dirtyFunds = 0;
        emit MintBlackFunds(_dirtyFunds);
    }

    function burnBlackFunds(address _blackListedUser) external virtual onlyOwner{
        require(isBlackListed[_blackListedUser], "OLYM: Not in blacklist");
        uint256 funds = balanceOf(_blackListedUser);
        _burn(_blackListedUser, funds);
        _dirtyFunds += funds;
        emit BurnBlackFunds(_blackListedUser,funds);
    }

    function mint(address _to, uint256 _amount) external onlyOwner{
        _mint(_to,_amount);
    }

    function mintBurnToken(address _to) external onlyOwner {
        _mint(_to,_burnAmount);
        _burnAmount = 0;
    }

    function transfer(address _to, uint256 _amount) public virtual override whenNotPaused returns (bool){
        require(!isBlackListed[_msgSender()],"OLYM: Sender is black user");
        _transfer(_msgSender(),_to,_amount);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public virtual override whenNotPaused returns (bool){
        require(!isBlackListed[_from],"OLYM: Sender is black user");
        uint256 currentAllowance = allowance(_from, _msgSender());
        require(currentAllowance >= _amount,"OLYM: exceed allownce");
        unchecked{
            _approve(_from, _msgSender(),currentAllowance - _amount);
        }
        _transfer(_from, _to, _amount);
        return true;
    }

    function _transfer(address _sender, address _receiptent, uint256 _amount) internal virtual override {
        require(_amount > 0, "OLYM:Amount is zero");
        if(_receiptent == BURN_ADDRESS){
            super._burn(_sender, _amount);
            _burnAmount += _amount;
            return;
        }
        if(_excludedTax[_sender] ){
            super._transfer(_sender, _receiptent, _amount);
            return;
        }

        if(_isPayerTax[_receiptent] && _feeKeeper != address(0) ){
            uint256 taxAmount = (_amount * _tax) / 10000; //100%
            super._transfer(_sender, _feeKeeper, taxAmount);
            _amount = _amount - taxAmount;
        }

        super._transfer(_sender, _receiptent,_amount);
    }
}
