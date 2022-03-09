const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token Functionality", async () => {
    const initialSupply = 10000;
    const name = "MyToken";
    const ticker = "MTN";
    let Token;
    let TokenContract;
    let owner;
    let addr1;
    let addrs;
    beforeEach(async () => {
        //deploy the token before test
        [owner, addr1, ...addrs] = await ethers.getSigners();
        Token = await ethers.getContractFactory("Token");
        TokenContract = await Token.deploy(initialSupply, name, ticker);
    });

    describe("Deployment", async () => {
        it("Should mint the total supply to the deployer", async () => {
            const initialDeployerBalance = await TokenContract.balanceOf(
                owner.address
            );
            expect(await TokenContract.totalSupply()).to.equal(
                initialDeployerBalance
            );
        });
    });
    describe("Transactions", async () => {
        it("Should transfer from owner address to other addresses", async () => {
            await TokenContract.connect(owner).transfer(addr1.address, 100);
            const addr1Bal = await TokenContract.balanceOf(addr1.address);
            const ownerBal = await TokenContract.balanceOf(owner.address);
            expect(addr1Bal).to.equal(100);
            expect(ownerBal).to.equal(initialSupply - 100);
        });
        it("Should let other address use transferFrom after approval", async () => {
            await TokenContract.connect(owner).transfer(addr1.address, 100);
            await TokenContract.connect(addr1).approve(owner.address, 100);
            const approvedAmount = await TokenContract.allowance(
                addr1.address,
                owner.address
            );
            expect(approvedAmount).to.equal(100);
            await TokenContract.connect(owner).transferFrom(
                addr1.address,
                addrs[0].address,
                100
            );
            const approvedAmountAfterTransferFrom =
                await TokenContract.allowance(addr1.address, owner.address);
            expect(approvedAmountAfterTransferFrom).to.equal(0);
            const balanceOfAddrs0 = await TokenContract.balanceOf(
                addrs[0].address
            );
            expect(balanceOfAddrs0).to.equal(100);
        });
    });
});
