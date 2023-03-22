const express = require("express");
const app = express();
const server = require('http').createServer(app);
const { Server, Socket } = require("socket.io");
const { serverEvents, clientEvents } = require('./events');
const { generateBingoCard } = require("../utils/bingo/cardGenerator");
const { generateGameSequence, checkForWin } = require("../utils/bingo/game");
const { setInterval } = require("timers/promises");
const BINGO_NUMBERS_DELAY = 4000

class BingoServer {
    constructor(io) {
        this.gameState = {
            mode: 'NORMAL',
            players: new Map(), // players[socket.id] = { id, name, table }
            inProgress: false,
            numbers: generateGameSequence(),
        };
        this.io = io;
        this.intervalId = null;
        this.listenToClientEvents();
    }

    listenToClientEvents() {
        this.io.on("connection", (socket) => {
            socket.on("disconnect", () => {
                this.removePlayer(socket);
            });
            socket.on(clientEvents.changeGameMode, ({ mode }) => {
                this.changeGameMode(mode, socket);
            });
            socket.on(clientEvents.answerTable, ({ accept }) => {
                if (!accept) {
                    this.sendTable(socket);
                } else {
                    this.userAcceptedTable(socket);
                }
            });
            socket.on(clientEvents.newPlayer, ({ playerName }) => {
                this.addPlayer(playerName, socket);
            })
            socket.on(clientEvents.claimWin, () => {
                this.checkIfPlayerWin(socket);
            })
        });
    }

    changeGameMode(mode, socket) {
        if (mode == 'FULL') {
            this.gameState = generateGameSequence();
            this.generateNumbersInterval();
        }
        this.gameState.mode = mode;
        this.io.emit(serverEvents.changeGameMode, this.gameState.mode);
    }

    addPlayer(playerName, socket) {
        const newPlayer = {
            id: socket.id,
            name: playerName,
            table: null,
        };
        this.gameState.players[newPlayer.id] = newPlayer;
        this.io.emit(serverEvents.playerConnected, newPlayer);
        this.sendTable(socket);
    }

    removePlayer(socket) {
        const player = this.gameState.players[socket.id];
        if (player == null) {
            return;
        }
        socket.emit(serverEvents.playerDisconnected, player);
        this.gameState.players.delete(player.id);
        if (this.gameState.players.size <= 1) {
            this.changeGameMode('NORMAL', socket);
        }
    }

    sendTable(socket) {
        const table = generateBingoCard();
        this.gameState.players[socket.id].table = table;
        socket.emit(serverEvents.tableAssigned, table);
    }

    userAcceptedTable(socket) {
        const playersMapWithoutTargetPlayer = this.gameState.players.filter((k, v) => {
            v.id !== socket.id
        });
        socket.emit(serverEvents.joinedGame, {
            otherPlayers: playersMapWithoutTargetPlayer,
            player: this.gameState.players[socket.id]
        });
    }

    startGame() {
        this.io.emit(serverEvents.gameStarted, {});
    }

    generateNumbers() {
        const newNumber = this.gameState.numbers.pop()
        if (newNumber === undefined) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            return;
        }
        this.io.emit(serverEvents.newNumber, {
            number: newNumber
        });
    }

    generateNumbersInterval() {
        if (this.intervalId != null) {
            return;
        }
        this.intervalId = setInterval(this.generateNumbers.bind(this), BINGO_NUMBERS_DELAY)
    }

    checkIfPlayerWin(socket) {
        const player = this.gameState.players[socket.id]
        const table = player.table;
        const { columnFull, rowFull, diagonalFull, cardFull } = checkForWin(table)
        if (columnFull || rowFull || diagonalFull || cardFull) {
            this.io.emit(serverEvents.win, {
                winner: player
            });
        }
    }
}

// TODO start server from here