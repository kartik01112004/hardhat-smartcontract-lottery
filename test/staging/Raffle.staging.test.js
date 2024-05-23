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
                  const accounts = await ethers.getSigner();
                  await Promise(async (resolve, reject) => {
                      raffle.once("Winner picked", async () => {
                          console.log("Winner picked event fired");
                          resolve();
                          try {
                              const recentWinner = await raffle.getRecentWinner();
                              const raffleState = await raffle.getRaffleState();
                              const winnerEndingBalance = await accounts[0].getBalance();
                              const endingTimeStamp = await raffle.getLastTimeStamp();

                              await expect(raffle.getPlayer(0)).to.be.reverted;
                              assert.equal(recentWinner.toString(), accounts[0].address);
                              assert.equal(raffleState, 0);
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStratingBalance.add(raffleEnternceFee).toString()
                              );
                              assert(endingTimeStamp > startingTimeStamp);
                              resolve();
                          } catch (error) {
                              console.log(error);
                              reject(e);
                          }
                      });
                      await raffle.enterRaffle({ value: raffleEnternceFee });
                      const winnerStratingBalance = await accounts[0].getBalance();
                  });
              });
          });
      });
