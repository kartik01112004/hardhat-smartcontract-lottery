const { network } = require("hardhat");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployements;
    const { deployer } = await getNamedAccounts();

    const raffle = await deploy("Raffle", {
        from: deployer,
        args: [],
        log: true,
        waitConfermations: network.config.blockConfermations || 1,
    });
};
