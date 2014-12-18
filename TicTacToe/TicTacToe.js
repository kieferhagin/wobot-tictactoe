var ActiveGame = require('./ActiveGame');

function TicTacToe(){
    this.activeGames = {};
}

TicTacToe.prototype.newGame = function(player1, player2){
    var game = new ActiveGame(player1, player2);
    this.activeGames[game.id] = game;

    return game;
};

TicTacToe.prototype.forfeit = function(playerId){
    var game = this.getActiveGame(playerId);

    if (game) {
        this.endGame(game);
        return true;
    }

    return false;
};

TicTacToe.prototype.endGame = function(game){
    delete this.activeGames[game.id];
};

TicTacToe.prototype.checkForExistingGame = function(playerId){
    var game = this.getActiveGame(playerId);

    return !!game;
};

TicTacToe.prototype.getActiveGame = function(playerId){
    for (var gameId in this.activeGames){
        var activeGame = this.activeGames[gameId];
        if (activeGame.player1.id === playerId
            || activeGame.player2.id === playerId){
            return activeGame;
        }
    }

    return null;
};

module.exports = TicTacToe;