const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Vending contract functionality", async () => {
    //params for the token
    const tokenSupply = 10000;
    const tokenName = "MyToken";
    const tokenTicker = "MTN";
    let Token;
    let TokenContract;
    //params for the NFT
    const nftMaxSupply = 200;
    const nftName = "MyNFT";
    const nftTicker = "MYNFT";
    let Nft;
    let NftContract;
    //params for the store
    const pricePerNft = 50;
    let Store;
    let StoreContract;
    //callers
    let owner;
    let addr1;
    let addrs;
    beforeEach(async () => {
        //deploy the token and the nft, and mint them all to the owner
        //get signers
        [owner, addr1, ...addrs] = await ethers.getSigners();
        //deploy the token
        Token = await ethers.getContractFactory("Token");
        TokenContract = await Token.deploy(tokenSupply, tokenName, tokenTicker);
        //deploy the NFT
        Nft = await ethers.getContractFactory("MyNFT");
        NftContract = await Nft.deploy(nftName, nftTicker, nftMaxSupply);
        //deploy the store
        Store = await ethers.getContractFactory("NftVendor");
        StoreContract = await Store.deploy(
            NftContract.address,
            TokenContract.address,
            pricePerNft
        );
    });
    describe("Listing/Delisting", async () => {
        beforeEach(async () => {
            //mint all the tokens to the sender and SetApproveForAll to the store
            //mint all of the supplies to the owner
            for (let i = 0; i < nftMaxSupply / 10; i++) {
                await NftContract.batchMint(10);
            }
            NftContract.setApprovalForAll(StoreContract.address, true);
        });

        it("Should let the owner list the tokens", async () => {
            const stockArray = [0, 1, 2, 3, 4, 199];
            await StoreContract.stockUp(stockArray);
            for (let i = 0; i < stockArray.length; i++) {
                const ownerOfThatNft = await NftContract.ownerOf(stockArray[i]);
                expect(ownerOfThatNft).to.equal(StoreContract.address);
                const availability = await StoreContract._isAvailable(
                    stockArray[i]
                );
                expect(availability).to.true;
            }
            const notStocked = await StoreContract._isAvailable(55);
            expect(notStocked).to.be.false;
        });

        describe("Delisting/Buying", async () => {
            const stockArray = [0, 1, 2, 3, 4, 199];
            beforeEach(async () => {
                await StoreContract.stockUp(stockArray);
                for (let i = 0; i < stockArray.length; i++) {
                    const ownerOfThatNft = await NftContract.ownerOf(
                        stockArray[i]
                    );
                    expect(ownerOfThatNft).to.equal(StoreContract.address);
                    const availability = await StoreContract._isAvailable(
                        stockArray[i]
                    );
                    expect(availability).to.true;
                }
                //transfer tokens to other accounts and try to buy
                TokenContract.transfer(addr1.address, 100);
                TokenContract.transfer(addrs[0].address, 100);
            });

            it("Should let owner delist the tokens", async () => {
                await StoreContract.deList(stockArray);
                for (let i = 0; i < stockArray.length; i++) {
                    const ownerOfThatNft = await NftContract.ownerOf(
                        stockArray[i]
                    );
                    expect(ownerOfThatNft).to.equal(owner.address);
                    const availability = await StoreContract._isAvailable(
                        stockArray[i]
                    );
                    expect(availability).to.false;
                }
            });
            it("Should let others buy", async () => {
                await TokenContract.connect(addr1).approve(
                    StoreContract.address,
                    100
                );
                const approved1 = await TokenContract.allowance(
                    addr1.address,
                    StoreContract.address
                );
                expect(approved1).to.equal(100);

                await TokenContract.connect(addrs[0]).approve(
                    StoreContract.address,
                    100
                );
                const approved2 = await TokenContract.allowance(
                    addrs[0].address,
                    StoreContract.address
                );
                expect(approved1).to.equal(100);

                await StoreContract.connect(addr1).buy(stockArray.slice(0, 2));
                await StoreContract.connect(addrs[0]).buy(
                    stockArray.slice(2, 4)
                );
                for (let i = 0; i < 2; i++) {
                    const ownerOfThatNft = await NftContract.ownerOf(
                        stockArray[i]
                    );
                    expect(ownerOfThatNft).to.equal(addr1.address);
                    const availability = await StoreContract._isAvailable(
                        stockArray[i]
                    );
                    expect(availability).to.false;
                }
                for (let i = 2; i < 4; i++) {
                    const ownerOfThatNft = await NftContract.ownerOf(
                        stockArray[i]
                    );
                    expect(ownerOfThatNft).to.equal(addrs[0].address);
                    const availability = await StoreContract._isAvailable(
                        stockArray[i]
                    );
                    expect(availability).to.false;
                }
                const approved1AfterBuy = await TokenContract.allowance(
                    addr1.address,
                    StoreContract.address
                );
                expect(approved1AfterBuy).to.equal(0);

                const approved2AfterBuy = await TokenContract.allowance(
                    addrs[0].address,
                    StoreContract.address
                );
                expect(approved2AfterBuy).to.equal(0);
            });
            it("Should let owner withdrawal after something sold", async () => {
                await TokenContract.connect(addr1).approve(
                    StoreContract.address,
                    100
                );
                const approved1 = await TokenContract.allowance(
                    addr1.address,
                    StoreContract.address
                );
                expect(approved1).to.equal(100);

                await TokenContract.connect(addrs[0]).approve(
                    StoreContract.address,
                    100
                );
                const approved2 = await TokenContract.allowance(
                    addrs[0].address,
                    StoreContract.address
                );
                expect(approved1).to.equal(100);

                await StoreContract.connect(addr1).buy(stockArray.slice(0, 2));
                await StoreContract.connect(addrs[0]).buy(
                    stockArray.slice(2, 4)
                );
                for (let i = 0; i < 2; i++) {
                    const ownerOfThatNft = await NftContract.ownerOf(
                        stockArray[i]
                    );
                    expect(ownerOfThatNft).to.equal(addr1.address);
                    const availability = await StoreContract._isAvailable(
                        stockArray[i]
                    );
                    expect(availability).to.false;
                }
                for (let i = 2; i < 4; i++) {
                    const ownerOfThatNft = await NftContract.ownerOf(
                        stockArray[i]
                    );
                    expect(ownerOfThatNft).to.equal(addrs[0].address);
                    const availability = await StoreContract._isAvailable(
                        stockArray[i]
                    );
                    expect(availability).to.false;
                }
                const approved1AfterBuy = await TokenContract.allowance(
                    addr1.address,
                    StoreContract.address
                );
                expect(approved1AfterBuy).to.equal(0);

                const approved2AfterBuy = await TokenContract.allowance(
                    addrs[0].address,
                    StoreContract.address
                );
                expect(approved2AfterBuy).to.equal(0);
                await StoreContract.claimFunds();
                const ownerBalanceAfterSelling = await TokenContract.balanceOf(
                    owner.address
                );
                expect(ownerBalanceAfterSelling).to.equal(10000);
            });
        });
    });
});
