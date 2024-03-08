// Raffle
//enter lottery (pay some ammount)
//pic a randome winner (varifiably random)
//winner to be selected every x amount of time automaticaly
//chainlink oracle -> for randomeness, automated execution(chainlink keepers)

//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

error Raffle__notEnoughETHEnterd();

contract Raffle {
    //state variables
    uint256 private immutable i_enteranceFee;
    address payable[] private s_players;

    //events
    event RaffleEnter(address indexed player);

    constructor(uint256 enteranceFee) {
        i_enteranceFee = enteranceFee;
    }

    function enterRaffle() public payable {
        if (msg.value < i_enteranceFee) {
            revert Raffle__notEnoughETHEnterd(); //just for knowing that they enterd enough eth to participate
        }
        s_players.push(payable(msg.sender));
        //we make events with opposite name enterRaffel changed to raffelenter for others to understand easily
        emit RaffleEnter(msg.sender);
    }

    // function picRandomeWinner() {}

    function getEnternceFee() public view returns (uint256) {
        return i_enteranceFee;
    }

    function getPlayers(uint256 index) public view returns (address) {
        return s_players[index];
    }
}
