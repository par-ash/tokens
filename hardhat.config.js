require("@nomicfoundation/hardhat-toolbox");

const ALCHEMY_API_KEY = "-u0CZe73uLcbrag3ydgz7H05oD57ma-Z";
const GOERLI_PRIVATE_KEY = "e69680a36bbcbdc74ecc8afa4fc45ec74806a40b9e41dd2437812d8b5cffc456";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY]
    }
  }
};
