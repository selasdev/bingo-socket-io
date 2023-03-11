const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { generateBingoCard } = require("./utils/bingo/cardGenerator");
const { generateGameSequence } = require("./utils/bingo/game");

const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
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

io.on("connection", (socket) => {
  socket.broadcast.emit("hi");
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("chat message", (msg) => {
    console.log("message: " + msg);

    io.emit("chat message", msg);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
