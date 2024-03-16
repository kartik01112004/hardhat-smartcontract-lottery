// Raffle
//enter lottery (pay some ammount)
//pic a randome winner (varifiably random)
//winner to be selected every x amount of time automaticaly
//chainlink oracle -> for randomeness, automated execution(chainlink keepers)

//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

error Raffle__notEnoughETHEnterd();
error Raffle__TransferFailed();

contract Raffle is VRFConsumerBaseV2 {
    //state variables
    uint256 private immutable i_enteranceFee;
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFERMATION = 3;
    uint32 private constant NUM_WORDS = 1;

    // Lottery variables
    address private s_recentWinner;

    //events
    event RaffleEnter(address indexed player);
    event ReqestedRaffleWinner(uint256 indexed requestId);

    constructor(
        address vrfCoordinatorV2,
        uint256 enteranceFee,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_enteranceFee = enteranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
    }

    function enterRaffle() public payable {
        if (msg.value < i_enteranceFee) {
            revert Raffle__notEnoughETHEnterd(); //just for knowing that they enterd enough eth to participate
        }
        s_players.push(payable(msg.sender));
        //we make events with opposite name enterRaffel changed to raffelenter for others to understand easily
        emit RaffleEnter(msg.sender);
    }

    function reqestRandomeWinner() external {
        //request random number
        //once we get it, do something
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, //gas lane
            i_subscriptionId,
            REQUEST_CONFERMATION,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit ReqestedRaffleWinner(requestId);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert Raffle__TransferFailed();
        }
    }

    function getEnternceFee() public view returns (uint256) {
        return i_enteranceFee;
    }

    function getPlayers(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }
}
