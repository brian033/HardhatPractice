// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract MyNFT is ERC721, Ownable {
    uint256 public maxSupply;
    uint256 public currentIndex;

    constructor (string memory _name, string memory _ticker, uint _maxSupply) ERC721(_name, _ticker) {
        maxSupply = _maxSupply;
    }

    function batchMint(uint amount) external onlyOwner{
        require((currentIndex + amount) <= maxSupply, "Mint too much");
        for(uint i; i < amount; i++){
            _mint(owner(), currentIndex + i);
        }
        currentIndex += amount;
    }
}