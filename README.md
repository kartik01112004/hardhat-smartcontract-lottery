# Hardhat Lottery

`"printWidth": 100`
just changes how log a line can be beofre it changes to another line

insted of storing strings we store error codes as its more gas efficent

## Events

An Event inhertiable member of a contract
ETH is an EVM based blockchain so EVMs have logs

<b>Logs</b>

logs are the data stored by a matchine that represents what what happened at what time

so EVMs store those logs which contains events
events allow us to add stuff to logs
so its more gas efficent than storing it to a storage variable
see if we store somethin inside a contract and access it again and again we spend alot of gas on reading from the storage, but if we store it as a event and listen for it we save much gas as these events and logs are stored in such data structure that is not accessible to the contracts
event are tied to the smart contract

take it like this we make a transaction on website it reloads when its finished as it was listning for the event of transactrion completed to happen

when we emit an event we have 2 types

1. indexed : can be searched for
2. non indexed : ar eabi incoded and needs abi to decode and use these
   we can have 3 indexed parameters and its called a topic

## chanilink VRF

Requesting a random number is a 2 transaction process to insure the random number is pure random number and not tampered with

see documentation for understansding what does what
[documentation of chanilink VRF](https://docs.chain.link/vrf/v2/subscription/examples/get-a-random-number)

## Hardhat Shorthand

It is an npm package that lets us use some short cut sand we dont need to write complete commands to run

## chainlink Keepers now chanlink automation

To trigger a something as per the time you can use chainlink automation contract!
[documentation of chanilink automation](https://docs.chain.link/chainlink-automation/overview/getting-started)

## enums

enums stand for Enumerable. Enums are user-defined data types that restrict the variable to have only one of the predefined values.

### Pure functions

a function that doesn’t read or modify the variables of the state is called a pure function. It can only use local variables that are declared in the function and the arguments that are passed to the function to compute or return a value.
