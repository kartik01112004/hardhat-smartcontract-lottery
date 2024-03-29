const { ethers } = require("hardhat");

const networkConfig = {
    11155111: {
        name: "sepolia",
        vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        enteranceFee: ethers.utils.parseEther("0.01"),
    },
    31337: {
        name: "hardhat",
        enteranceFee: ethers.utils.parseEther("0.01"),
    },
};

const developmentChains = ["hardhat", "localhost"];

module.exports = {
    networkConfig,
    developmentChains,
};
