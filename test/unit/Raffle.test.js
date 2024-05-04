const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle", function () {
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
          describe("constructor", function () {
              it("Initalizes the raffle correctly", async function () {
                  const raffleState = await raffle.getRaffleState();
                  assert.equal(raffleState.toString(), "0");
                  //   console.log(interval.toString());
                  //   console.log(networkConfig[chainId]["interval"]);
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
              });
          });

          describe("enterRaffle", function () {
              it("reverts when you don't pay enough", async () => {
                  expect(raffle.enterRaffle()).to.be.revertedWith("Raffle__notEnoughETHEnterd");
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
          describe("checkUpKeep", function () {
              it("returns false if peoplw havent sent any ETH", async function () {
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                  await network.provider.send("evm_mine", []);
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
                  assert(!upkeepNeeded);
              });
              it("returns false if raffle isnt open", async function () {
                  await raffle.enterRaffle({ value: raffleEnternceFee });
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                  await network.provider.send("evm_mine", []);
                  await raffle.performUpkeep([]);
                  const raffleState = await raffle.getRaffleState();
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
                  assert.equal(raffleState.toString(), "1");
                  assert.equal(upkeepNeeded, false);
              });
              it("returns false if enought time hasnt passed", async function () {
                  await raffle.enterRaffle({ value: raffleEnternceFee });
                  await network.provider.send("evm_increaseTime", [interval.toNumber() - 1]);
                  await network.provider.send("evm_mine", []);
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x");
                  assert(!upkeepNeeded);
              });
              it("returns true if enough time has passed, has players, ETH, and is open", async function () {
                  await raffle.enterRaffle({ value: raffleEnternceFee });
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                  await network.provider.send("evm_mine", []);
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x");
                  assert(upkeepNeeded);
              });
          });
          describe("performUpkeep", function () {
              it("it only works if checkUpkeep is true", async function () {
                  await raffle.enterRaffle({ value: raffleEnternceFee });
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                  await network.provider.send("evm_mine", []);
                  const tx = await raffle.performUpkeep([]);
                  assert(tx);
              });
              it("it revets when checkUpkeep is false", async function () {
                  await expect(raffle.performUpkeep([])).to.be.revertedWith(
                      "Raffle__UpkeepNotNeeded"
                  );
              });
              it("updates the raffle state,emits an event,and calls the vrfcoordinator", async function () {
                  await raffle.enterRaffle({ value: raffleEnternceFee });
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                  await network.provider.send("evm_mine", []);
                  const txResponce = await raffle.performUpkeep([]);
                  const txReceipt = await txResponce.wait(1);
                  const requestId = txReceipt.events[1].args.requestId;
                  assert;
              });
          });
      });
