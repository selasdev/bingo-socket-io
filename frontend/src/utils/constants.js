export const serverEvents = {
  joinedGame: "joined-game",
  playerConnected: "player-connected",
  playerDisconnected: "player-disconnected",
  changeGameMode: "lobby-closed",
  tableAssigned: "table-assigned",
  gameStarted: "game-has-started",
  gameEnded: "game-has-ended",
  newNumber: "num-announced",
  win: "win-announced",
};

export const clientEvents = {
  changeGameMode: "set-mode",
  newPlayer: "request-player",
  answerTable: "answer-table",
  claimWin: "claim-win",
};
