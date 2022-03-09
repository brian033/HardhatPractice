require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

module.exports = {
    solidity: "0.8.1",
    networks: {
        ropsten: {
            url: `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`,
            accounts: [process.env.DEPLOYER_KEY],
        },
        rinkeby: {
            url: `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`,
            accounts: [process.env.DEPLOYER_KEY],
        },
    },
    etherscan: {
        apiKey: {
            ropsten: process.env.ETHERSCAN_KEY,
            rinkeby: process.env.ETHERSCAN_KEY,
        },
    },
};
