//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
contract NftVendor is Ownable, IERC721Receiver{
    IERC721 public nft;
    IERC20 public token;
    uint256 public pricePerNft;
    uint256 public tokensCount;
    mapping (uint256 => bool) public _isAvailable;

    event Purchase(address _buyer, uint256 _id);
    event StockUp(uint256 _id);
    event Delist(uint256 _id);
    constructor (address _nftAddress, address _erc20Address, uint256 _price){
        nft = IERC721(_nftAddress);
        token = IERC20(_erc20Address);
        pricePerNft = _price;
    }
    
    function _stockUp(uint _id) private{
        _isAvailable[_id] = true;
        emit StockUp(_id);
        
        tokensCount += 1;
    }

    function stockUp(uint[] calldata _ids) external onlyOwner{
        for(uint i; i < _ids.length; i++){
            nft.transferFrom(msg.sender, address(this), _ids[i]);
            _stockUp(_ids[i]);
        }
        
    }

    function onERC721Received(
        address operator,
        address from,
        uint256,
        bytes calldata
    )
        external
        view
        override
        returns(bytes4)
    {
        require(msg.sender == address(nft), "wrong NFT!");
        require(operator == address(this), "You can't manually send in NFT");
        require(from == owner(), "Only owner can stock up this contract");
        return(0x150b7a02);
    }

    function deList(uint[] calldata _ids) external onlyOwner{
        for(uint i; i < _ids.length; i++){
            nft.safeTransferFrom(address(this), msg.sender , _ids[i]);
            _isAvailable[_ids[i]] = false;
            emit Delist(_ids[i]);
        }
        tokensCount -= _ids.length;
    }

    function isAvailable(uint[] calldata _ids) public view returns(bool[] memory){
        bool[] memory ret = new bool[](_ids.length);
        for(uint i; i < _ids.length; i++){
            ret[_ids[i]] = _isAvailable[_ids[i]];
        }
        return ret;
    }
    function isAllAvailable(uint[] calldata _ids) public view returns(bool){
        for(uint i; i < _ids.length; i++){
            if(!_isAvailable[_ids[i]]){return false;}
        }
        return true;
    }

    function buy(uint[] calldata _ids) external{
        require(isAllAvailable(_ids), "Some of your purchase is not available");
        uint payAmount = _ids.length * pricePerNft;
        require(token.transferFrom(msg.sender, address(this), payAmount), "Transfer failed");
        for(uint i; i < _ids.length; i++){
            nft.safeTransferFrom(address(this), msg.sender , _ids[i]);
            _isAvailable[_ids[i]] = false;
            emit Purchase(msg.sender, _ids[i]);
        }
    }

    function claimFunds() external onlyOwner{
        token.transfer(owner(), token.balanceOf(address(this)));
    }

}
