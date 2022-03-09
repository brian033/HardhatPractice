//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20{
    constructor(uint256 initialSupply, string memory name, string memory ticker) ERC20(name, ticker) {
        _mint(msg.sender, initialSupply);
    }
}