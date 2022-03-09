const { expect } = require("chai");

describe("Nft Functionallity", async () => {
    const maxSupply = 200;
    const name = "MyToken";
    const ticker = "MTN";
    let NFT;
    let NFTContract;
    let owner;
    let addr1;
    let addrs;

    beforeEach(async () => {
        //deploy the token before test
        [owner, addr1, ...addrs] = await ethers.getSigners();
        NFT = await ethers.getContractFactory("MyNFT");
        NFTContract = await NFT.deploy(name, ticker, maxSupply);
    });
    describe("Minting functionallity", async () => {
        it("Should let the owner mint", async () => {
            await NFTContract.batchMint(10);
            const ownerBalance = await NFTContract.balanceOf(owner.address);
            expect(ownerBalance).to.equal(10);
            for (let i = 0; i < 10; i++) {
                const ownerOfThisNFT = await NFTContract.ownerOf(i);
                expect(ownerOfThisNFT).to.equal(owner.address);
            }
            const currentIndex = await NFTContract.currentIndex();
            expect(currentIndex).to.equal(10);
        });
        it("Should not let others mint", async () => {
            await expect(
                NFTContract.connect(addr1).batchMint(10)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("Should not let the owner mint exceeding the maxSupply", async () => {
            for (let i = 0; i < maxSupply / 10; i++) {
                await NFTContract.batchMint(10);
            }
            const supp = await NFTContract.currentIndex();
            expect(supp).to.equal(maxSupply);
            await expect(NFTContract.batchMint(1)).to.be.revertedWith(
                "Mint too much"
            );
        });
    });
    describe("Transferring functionality", async () => {
        beforeEach(async () => {
            //mint all of the supplies to the owner
            for (let i = 0; i < maxSupply / 10; i++) {
                await NFTContract.batchMint(10);
            }
        });
        it("Should transfer", async () => {
            const ownerBefore = await NFTContract.ownerOf(134);
            expect(ownerBefore).to.equal(owner.address);
            await NFTContract.transferFrom(owner.address, addr1.address, 134);
            const ownerAfter = await NFTContract.ownerOf(134);
            expect(ownerAfter).to.equal(addr1.address);
        });
        it("Should do normal approved transfer", async () => {
            const ownerBefore = await NFTContract.ownerOf(111);
            expect(ownerBefore).to.equal(owner.address);

            await NFTContract.approve(addr1.address, 111);

            await NFTContract.connect(addr1).transferFrom(
                owner.address,
                addrs[0].address,
                111
            );
            const ownerAfter = await NFTContract.ownerOf(111);
            expect(ownerAfter).to.equal(addrs[0].address);
        });
        it("Should do controller approved transfer", async () => {
            //theoratically approved the addr1 to move all owner's asset
            await NFTContract.connect(owner).setApprovalForAll(
                addr1.address,
                true
            );
            for (let i = 15; i < 200; i += 8) {
                await NFTContract.connect(addr1).transferFrom(
                    owner.address,
                    addrs[0].address,
                    i
                );
                const ownerAfter = await NFTContract.ownerOf(i);
                expect(ownerAfter).to.equal(addrs[0].address);
            }
        });
        it("Shouldn't let not approved person do transferFrom", async () => {
            await expect(
                NFTContract.connect(addr1).transferFrom(
                    owner.address,
                    addrs[0].address,
                    123
                )
            ).to.be.revertedWith(
                "ERC721: transfer caller is not owner nor approved"
            );
        });
    });
});
