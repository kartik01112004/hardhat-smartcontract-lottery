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
          describe("checkUpkeep", function () {
              it("returns false if people haven't sent any ETH", async () => {
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                  await network.provider.request({ method: "evm_mine", params: [] });
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x"); // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert(!upkeepNeeded);
              });
              it("returns false if raffle isn't open", async () => {
                  await raffle.enterRaffle({ value: raffleEnternceFee });
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                  await network.provider.request({ method: "evm_mine", params: [] });
                  await raffle.performUpkeep([]); // changes the state to calculating
                  const raffleState = await raffle.getRaffleState(); // stores the new state
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x"); // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert.equal(raffleState.toString() == "1", upkeepNeeded == false);
              });
              it("returns false if enough time hasn't passed", async () => {
                  await raffle.enterRaffle({ value: raffleEnternceFee });
                  await network.provider.send("evm_increaseTime", [interval.toNumber() - 5]); // use a higher number here if this test fails
                  await network.provider.request({ method: "evm_mine", params: [] });
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x"); // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert(!upkeepNeeded);
              });
              it("returns true if enough time has passed, has players, eth, and is open", async () => {
                  await raffle.enterRaffle({ value: raffleEnternceFee });
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                  await network.provider.request({ method: "evm_mine", params: [] });
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x"); // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
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
                  const raffleState = await raffle.getRaffleState();
                  assert(requestId.toNumber() > 0);
                  assert(raffleState.toString() == "1");
              });
          });
          describe("fulfillRandomWords", function () {
              beforeEach(async () => {
                  await raffle.enterRaffle({ value: raffleEnternceFee });
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                  await network.provider.request({ method: "evm_mine", params: [] });
              });
              it("can only be called after performupkeep", async () => {
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
                  ).to.be.revertedWith("nonexistent request");
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)
                  ).to.be.revertedWith("nonexistent request");
              });
              it("pic a winner, reset the lottery, and send money", async function () {
                  const additionalEntrants = 3;
                  const startingAccountIndex = 1; // as deployer is 0
                  const accounts = await ethers.getSigners();
                  for (
                      let i = startingAccountIndex;
                      i < startingAccountIndex + additionalEntrants;
                      i++
                  ) {
                      const accountConnectedRaffle = raffle.connect(accounts[i]);
                      await accountConnectedRaffle.enterRaffle({ value: raffleEnternceFee });
                  }
                  const startingTimeStamp = await raffle.getLastTimeStamp();

                  await new Promise(async function (resolve, reject) {
                      raffle.once("WinnerPicked", async () => {
                          console.log("found the evnet");
                          try {
                              console.log(accounts[3]);
                              console.log(accounts[1]);
                              console.log(accounts[0]);
                              console.log(accounts[2]);
                              const recentWinner = await raffle.getRecentWinner();
                              console.log(recentWinner);
                              const raffleState = await raffle.getRaffleState();
                              const endingTimeStamp = await raffle.getLastTimeStamp();
                              const numPlayers = await raffle.getNumberOfPlayers();
                              assert.equal(numPlayers.toString(), "0");
                              assert.equal(raffleState.toString(), "0");
                              assert(endingTimeStamp > startingTimeStamp);
                          } catch (e) {
                              reject(e);
                          }
                          resolve();
                      });
                      const tx = await raffle.performUpkeep([]);
                      const txReceipt = await tx.wait(1);
                      await vrfCoordinatorV2Mock.fulfillRandomWords(
                          txReceipt.events[1].args.requestId,
                          raffle.address
                      );
                  });
              });
          });
      });
