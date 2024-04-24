const { getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle", async function () {
          let raffle, vrfCoordinatorV2Mock;
          const chainId = network.config.chainId;

          beforeEach(async function () {
              const { deployer } = await getNamedAccounts();
              await deployments.fixture(["all"]);
              raffle = await ethers.getContract("Raffle", deployer);
              vrfCoordinatorV2Mock = ethers.getContract("VRFCoordinatorV2Mock", deployer);
          });
          describe("constructor", async function () {
              it("Initalizes the raffle correctly", async function () {
                  const raffleState = await raffle.getRaffleState();
                  const interval = await raffle.getInterval();
                  assert.equal(raffleState.toString(), "0");
                  //   console.log(interval.toString());
                  //   console.log(networkConfig[chainId]["interval"]);
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
              });
          });

          describe("enterRaffle", async function () {
              it("reverts when you don't pay enough", async () => {
                  expect(raffle.enterRaffle());
              });
          });
      });
