// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CabalWager {
    struct Wager {
        address payable player;
        address targetPlayer;  // wallet address of who they think is Cabal
        uint256 amount;
        bool resolved;
    }

    mapping(bytes32 => Wager[]) public wagers;    // gameId => wagers
    mapping(bytes32 => bool) public gameResolved;
    address public house;

    constructor() {
        house = msg.sender;
    }

    function createWager(bytes32 gameId, address targetPlayer) external payable {
        require(msg.value > 0, "Must wager AVAX");
        require(!gameResolved[gameId], "Game already resolved");
        wagers[gameId].push(Wager(payable(msg.sender), targetPlayer, msg.value, false));
    }

    function joinWager(bytes32 gameId, address targetPlayer) external payable {
        require(msg.value > 0, "Must wager AVAX");
        require(!gameResolved[gameId], "Game already resolved");
        wagers[gameId].push(Wager(payable(msg.sender), targetPlayer, msg.value, false));
    }

    function resolveWager(bytes32 gameId, address[] calldata actualCabalAddresses) external {
        require(msg.sender == house, "Only house can resolve");
        require(!gameResolved[gameId], "Already resolved");
        gameResolved[gameId] = true;

        Wager[] storage gameWagers = wagers[gameId];
        uint256 totalPot = 0;
        uint256 winnerCount = 0;

        for (uint i = 0; i < gameWagers.length; i++) {
            totalPot += gameWagers[i].amount;
            for (uint j = 0; j < actualCabalAddresses.length; j++) {
                if (gameWagers[i].targetPlayer == actualCabalAddresses[j]) {
                    winnerCount++;
                    break;
                }
            }
        }

        if (winnerCount == 0) {
            // House wins — retain all funds
            payable(house).transfer(totalPot);
            return;
        }

        uint256 share = totalPot / winnerCount;
        for (uint i = 0; i < gameWagers.length; i++) {
            bool isWinner = false;
            for (uint j = 0; j < actualCabalAddresses.length; j++) {
                if (gameWagers[i].targetPlayer == actualCabalAddresses[j]) {
                    isWinner = true;
                    break;
                }
            }
            if (isWinner) {
                gameWagers[i].player.transfer(share);
            }
        }
    }

    function getWagers(bytes32 gameId) external view returns (Wager[] memory) {
        return wagers[gameId];
    }
}
