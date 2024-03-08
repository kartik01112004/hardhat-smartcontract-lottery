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

contract Raffle is VRFConsumerBaseV2 {
    //state variables
    uint256 private immutable i_enteranceFee;
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;

    //events
    event RaffleEnter(address indexed player);

    constructor(
        address vrfCoordinatorV2,
        uint256 enteranceFee,
        bytes32 gasLane
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_enteranceFee = enteranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
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
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {}

    function getEnternceFee() public view returns (uint256) {
        return i_enteranceFee;
    }

    function getPlayers(uint256 index) public view returns (address) {
        return s_players[index];
    }
}
