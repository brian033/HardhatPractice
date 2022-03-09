const hre = require("hardhat");

const delay = (timeout) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, timeout);
    });
};
const main = async () => {
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

    //deploy the token
    console.log("Deploying Token contract...");
    Token = await hre.ethers.getContractFactory("Token");
    TokenContract = await Token.deploy(tokenSupply, tokenName, tokenTicker);
    await TokenContract.deployed();
    console.log("Deployed Token contract at: " + TokenContract.address);
    //deploy the NFT
    console.log("Deploying NFT contract...");
    Nft = await hre.ethers.getContractFactory("MyNFT");
    NftContract = await Nft.deploy(nftName, nftTicker, nftMaxSupply);
    await NftContract.deployed();
    console.log("Deployed NFT contract at: " + NftContract.address);
    //deploy the store
    console.log("Deploying Store contract...");
    Store = await hre.ethers.getContractFactory("NftVendor");
    StoreContract = await Store.deploy(
        NftContract.address,
        TokenContract.address,
        pricePerNft
    );
    await StoreContract.deployed();

    console.log("Deployed Store contract at: " + StoreContract.address);
    await delay(60000);
    await hre.run("verify:verify", {
        contract: "contracts/Token.sol:Token",
        address: TokenContract.address,
        constructorArguments: [tokenSupply, tokenName, tokenTicker],
    });
    await hre.run("verify:verify", {
        contract: "contracts/Nft.sol:MyNFT",
        address: NftContract.address,
        constructorArguments: [nftName, nftTicker, nftMaxSupply],
    });
    await hre.run("verify:verify", {
        contract: "contracts/Store.sol:NftVendor",
        address: StoreContract.address,
        constructorArguments: [
            NftContract.address,
            TokenContract.address,
            pricePerNft,
        ],
    });
};

const runMain = async () => {
    try {
        console.log("Script start...");
        await main();
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};
runMain();
