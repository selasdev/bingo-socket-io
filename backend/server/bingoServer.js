const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { Server, Socket } = require("socket.io");
const { serverEvents, clientEvents } = require("./events");
const { generateBingoCard } = require("../utils/bingo/cardGenerator");
const { generateGameSequence, checkForWin } = require("../utils/bingo/game");
const BINGO_NUMBERS_DELAY = 4000;

class BingoServer {
  constructor(io) {
    this.gameState = {
      mode: "NORMAL", // FULL | NORMAL, full = room is full, normal = room is not full
      players: new Map(), // players[socket.id] = { id, name, table }
      numbers: generateGameSequence(), // [1,10,56...]
      playMode: null, // can be line, fullCard, etc in the future
    };
    this.io = io; // used for broadcast events
    this.intervalId = null; // numbers poping interval id
    this.listenToClientEvents();
  }

  /**
   * Start listening events from the client.
   * This let us know when the client connects, disconnects, changes the game mode,
   * accepts a table and claims a win.
   * You can see that the socket object is reused. This ensures that only one client
   * receives and event that it sends to that particular socket
   */
  listenToClientEvents() {
    this.io.on("connection", (socket) => {
      console.log("player connected", socket?.id);

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
      });

      socket.on(clientEvents.claimWin, () => {
        this.checkIfPlayerWin(socket);
      });
    });
  }

  /**
   * Changes the game mode in the gameState object.
   * If the mode changes to full, regenerates the numbers that will be yield
   * Emitted Payload: {
   *  mode: String (full | normal)
   * }
   * @param {String} mode
   * @param {Socket} socket can be null!
   */
  changeGameMode(mode, socket) {
    if (mode == "FULL" && !this.canStillPlay()) {
      return;
    }
    this.gameState.mode = mode;
    this.io.emit(serverEvents.changeGameMode, {
      mode: this.gameState.mode,
    });
    if (mode == "FULL") {
      this.gameState.numbers = generateGameSequence();
      this.startGame();
    }
  }

  /**
   * Adds a new player to the players Map, emits a player connected event for all clients
   * and sends a new table to the specific @param socket client. Check @function sendTable
   * Emitted Payload: {
   *  player: { id, name, table }
   * }
   * @param {String} playerName not null
   * @param {Socket} socket not null
   */
  addPlayer(playerName, socket) {
    console.log("adding player", socket?.id, playerName);

    const newPlayer = {
      id: socket.id,
      name: playerName,
      table: null,
    };
    this.io.emit(serverEvents.playerConnected, {
      player: newPlayer,
    });
    this.sendTable(socket, newPlayer);
  }

  /**
   * Removes the player (if exists) from the players map and emit a playerDisconnected event.
   * Side-effect: if !@function canStillPlay, then changes the game mode to 'NORMAL'
   * Emitted Payload: {
   *  player: { id, name, table }
   * }
   * @param {Socket} socket not null
   */
  removePlayer(socket) {
    console.log("player disconnected", socket?.id);
    const player = this.gameState.players.get(socket.id);
    if (player == null) {
      return;
    }
    socket.emit(serverEvents.playerDisconnected, {
      player: player,
    });
    this.gameState.players.delete(player.id);
    if (!this.canStillPlay()) {
      this.changeGameMode("NORMAL", socket);
    }
  }

  /**
   * @returns true if players maps contains at least two values
   */
  canStillPlay() {
    return this.gameState.players.size > 1;
  }

  /**
   * Generates a bingo card and sends it to the client with the tableAssigned event
   * Emitted Payload: {
   *  table: [[]] -> [int][int]
   * }
   * @param {Socket} socket not null
   * @param {} newPlayer 
   */
  sendTable(socket, newPlayer = null) {
    const table = generateBingoCard();
    const player = newPlayer ? newPlayer : this.gameState.players.get(socket.id);
    if (!newPlayer) {
      this.gameState.players.delete(socket.id);
    }
    this.gameState.players.set(socket.id, {...player, table});
    socket.emit(serverEvents.tableAssigned, {
      table: table,
    });
  }

  /**
   * Expected to be called if client accepted the table.
   * Emitted Payload: {
   *    otherPlayers: [player { id, name, table }]
   *    player: player { id, name, table }
   * }
   * @param {Socket} socket socket
   */
  userAcceptedTable(socket) {
    const arrayOfPlayersFiltered = Array.from(this.gameState.players).map(p => p[1]);
    const playersMapWithoutTargetPlayer = arrayOfPlayersFiltered.filter(
      (k, v) => {
        v.id !== socket.id;
      }
    );
    socket.emit(serverEvents.joinedGame, {
      otherPlayers: playersMapWithoutTargetPlayer,
      player: this.gameState.players[socket.id],
    });
  }

  /**
   * Emits and gameStarted event with an empty payload
   */
  startGame() {
    this.io.emit(serverEvents.gameStarted, {});
    this.generateNumbersInterval();
  }

  /**
   * Pops a number from the game state's numbers variable and send its to the clients.
   * If the new number does or the game is no longer valid by @function canPlay , the
   * interval is cleared and the game mode changes to normal.
   * Emitted Payload: {
   *  number: int
   * }
   */
  generateNumbers() {
    const newNumber = this.gameState.numbers.pop();
    const canPlay = this.canStillPlay();
    if (newNumber === undefined || !canPlay) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.changeGameMode("NORMAL", null);
      return;
    }
    this.io.emit(serverEvents.newNumber, {
      number: newNumber,
    });
  }

  /**
   * Starts the numbers interval if not already started
   */
  generateNumbersInterval() {
    if (this.intervalId != null) {
      return;
    }
    this.intervalId = setInterval(
      this.generateNumbers.bind(this),
      BINGO_NUMBERS_DELAY
    );
  }

  /**
   * Check if a player did win. The player if retrieved with the socket's id
   * Emitted Payload IF player is indeed winner: {
   *  winner: player { id, name, table }
   * }
   * @param {Socket} socket not null
   * @returns
   */
  checkIfPlayerWin(socket) {
    const player = this.gameState.players[socket.id];
    if (player === undefined) {
      return;
    }
    const table = player.table;
    const hasWon = this.validateWinByPlayMode(his.gameState.playMode, table);
    if (hasWon) {
      this.io.emit(serverEvents.win, {
        winner: player,
      });
    }
  }

  /**
   * Check if a given table did win. There can be multiple win conditions so we handle it
   * with a switch. Default check its with every result yield by @function checkForWin
   * @param {String} playMode not null
   * @param {Matrix[int][int]} table not null
   * @returns true if it is a winner table of a setted play mode, false otherwise
   */
  validateWinByPlayMode(playMode, table) {
    const { columnFull, rowFull, diagonalFull, cardFull } = checkForWin(table);
    switch (playMode) {
      case "fullCard":
        return cardFull;
      case "line":
        return columnFull || rowFull || diagonalFull;
      default:
        return columnFull || rowFull || diagonalFull || cardFull;
    }
  }
}

module.exports = { BingoServer };

// TODO start server
// TODO create BingoServer object
