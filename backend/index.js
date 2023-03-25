const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { generateBingoCard } = require("./utils/bingo/cardGenerator");
const { generateGameSequence } = require("./utils/bingo/game");
const { BingoServer } = require("./server/bingoServer");

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/generateCard", (req, res) => {
  res.send({
    type: "GENERATE_CARD",
    payload: {
      card: generateBingoCard(),
    },
  });
});

app.get("/gameSequence", (req, res) => {
  res.send({
    type: "GENERATE_GAME_SEQUENCE",
    payload: {
      sequence: generateGameSequence(),
    },
  });
});

server.listen(4000, () => {
  console.log("listening on *:4000");
  const bingoServer = new BingoServer(io);
  console.log("bingo server initialized");
});
