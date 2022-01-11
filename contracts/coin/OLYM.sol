// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./support/BlackList.sol";

contract OLYM is ERC20, Ownable, BlackList, Pausable{
    uint256 public constant cap = 1000000000*10**18;
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

    constructor(
        address seedSale,
        address privateSale,
				address publicSale,
				address advisors,
				address team,
				address marketing,
				address game,
				address farmingStaking,
				address liquidity
				) ERC20("The Olympus", "OLYM"){
        _feeKeeper = _msgSender();
        _excludedTax[_msgSender()] = true;
        _tax = 200;
				_miningAddress = farmingStaking;

				_mint(seedSale, 50000000*10**18);
				_mint(privateSale, 100000000*10**18);
				_mint(publicSale, 20000000*10**18);
				_mint(advisors, 50000000*10**18);
				_mint(team, 180000000*10**18);
				_mint(marketing, 180000000*10**18);
				_mint(game, 250000000*10**18);
				_mint(farmingStaking, 150000000*10**18);
				_mint(liquidity, 20000000*10**18);
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

    //Function for testing will be removed when deploy on on-chain
    function mint(address _to, uint256 _amount) external onlyOwner{
        _mint(_to,_amount);
    }

    function mintBurnToken(address _to) external onlyOwner {
        require(totalSupply() + _burnAmount <= cap,"OLYM: Exceed cap");  //Address is zero
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
