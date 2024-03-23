const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployements;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    let vrfCoordinatorV2Address;

    if (developmentChains.include(network.name)) {
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = VRFCoordinatorV2Mock.address;
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"];
    }

    const enteranceFee = networkConfig[chainId]["enteranceFee"];
    const args = [];
    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfermations: network.config.blockConfermations || 1,
    });
};
