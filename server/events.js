const serverEvents = {
    joinedGame: 'joined-game',
    playerConnected: 'player-connected',
    playerDisconnected: 'player-disconnected',
    changeGameMode: 'lobby-closed',
    tableAssigned: 'table-assigned',
    gameStarted: 'game-has-started',
    newNumber: 'num-announced',
    win: 'win-announced',
};

const clientEvents = {
    changeGameMode: 'set-mode',
    newPlayer: 'request-player',
    answerTable: 'answer-table',
    claimWin: 'claim-win'
};

module.exports = { serverEvents, clientEvents }