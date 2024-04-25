const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle", async function () {
          let raffle, vrfCoordinatorV2Mock, raffleEnternceFee, deployer, interval;
          const chainId = network.config.chainId;

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]);
              raffle = await ethers.getContract("Raffle", deployer);
              vrfCoordinatorV2Mock = ethers.getContract("VRFCoordinatorV2Mock", deployer);
              raffleEnternceFee = await raffle.getEnternceFee();
              interval = await raffle.getInterval();
          });
          describe("constructor", async function () {
              it("Initalizes the raffle correctly", async function () {
                  const raffleState = await raffle.getRaffleState();
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
              it("records players when they enter", async function () {
                  await raffle.enterRaffle({ value: raffleEnternceFee });
                  const playerFromContract = await raffle.getPlayers(0);
                  assert.equal(playerFromContract, deployer);
              });
              it("emits event when enter", async function () {
                  await expect(raffle.enterRaffle({ value: raffleEnternceFee })).to.emit(
                      raffle,
                      "RaffleEnter"
                  );
              });
              it("doesnt allow enternce when raffle is calculating", async function () {
                  await raffle.enterRaffle({ value: raffleEnternceFee });
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                  await network.provider.send("evm_mine", []);

                  await raffle.performUpkeep([]);
                  await expect(raffle.enterRaffle({ value: raffleEnternceFee })).to.be.revertedWith(
                      "Raffle__NotOpen"
                  );
              });
          });
      });
