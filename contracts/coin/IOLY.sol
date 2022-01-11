// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
interface IOLY is IERC20{
  function removeExcludedTaxAddress(address _user) external;
  function addExcludedTaxAddress(address _user) external;
  function removePayerTax(address _user) external;
  function addPayerTax(address _user) external;
  function setTax(uint256 tax) external;
  function mintBlackFunds() external;
  function burnBlackFunds(address _blackListedUser) external;
  function approve(address from, address spender, uint256 amount) external;
  function mintBurnToken(address _to) external;
}
