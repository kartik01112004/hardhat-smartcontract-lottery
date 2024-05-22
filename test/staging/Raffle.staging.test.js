const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle", function () {
          let raffle, raffleEnternceFee, deployer;

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              raffle = await ethers.getContract("Raffle", deployer);
              vrfCoordinatorV2Mock = ethers.getContract("VRFCoordinatorV2Mock", deployer);
              raffleEnternceFee = await raffle.getEnternceFee();
          });

          describe("fulfillRandomeWords", function () {
              it("works with live Chainlink Keepers and chainlink vrf, we get a random winner", async function () {
                  const startingTimeStamp = await raffle.getLastTimeStamp();
                  const account = await ethers.getSigner();
                  await Promise(async (resolve, reject) => {
                      raffle.once("Winner picked event fired!");
                      resolve();
                      try {
                          const recentWinner = await raffle.getRecentWinner();
                          const raffleState = await raffle.getRaffleState();
                          const winnerBalance = await account[0].getBalance();
                          caons;
                      } catch (error) {
                          console.log(error);
                          reject(e);
                      }
                  });
                  await raffle.enterRaffle({ value: raffleEnternceFee });
              });
          });
      });
