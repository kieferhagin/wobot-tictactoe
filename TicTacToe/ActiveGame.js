var randomString = require('./util/RandomString');

function ActiveGame(player1, player2){
    this.id = randomString();
    this.player1 = player1;
    this.player2 = player2;

    this.gameBoard = [[]];

    for (var x = 0; x < 3; x++){
        this.gameBoard[x] = ['#', '#', '#'];
    }

    this.currentTurn = player1;
}

ActiveGame.prototype.getCurrentTurn = function(){
    return this.currentTurn;
};

ActiveGame.prototype.getTile = function(x, y){
    if (x > 2) x = 2;
    if (y > 2) y = 2;
    if (x < 0) x = 0;
    if (y < 0) y = 0;

    return this.gameBoard[x][y];
};

ActiveGame.prototype.generateGameBoard = function(){
    var board = '';
    for (var y = 0; y < 3; y++){
        for (var x = 0; x < 3; x++){
            var tile = this.gameBoard[x][y];
            board += tile;

            if (x < 2)
                board += '|';
        }
        if (y < 2)
            board += '\n';
    }

    var header = 'Current turn: @' + this.getCurrentTurn().name;
    return header + '\n' + board;
};

ActiveGame.prototype.tryMove = function(x, y, playerId){
    if (this.currentTurn.id !== playerId)
        throw 'It\'s not your turn!';

    var tile = this.getTile(x, y);

    if (tile !== '#')
        return false;

    this.gameBoard[x][y] = this.currentTurn === this.player1 ? 'x' : 'o';
    this.currentTurn = this.currentTurn === this.player1 ? this.player2 : this.player1;

    return true;
};

ActiveGame.prototype.checkWin = function(){
    var rows = [];
    var cols = [];
    var diags = [0, 0];

    //rows
    for (var y = 0; y < 3; y++){
        rows[y] = 0;
        for (var x = 0; x < 3; x++){
            if (this.gameBoard[x][y] === 'x')
                rows[y] += 1;
            else if (this.gameBoard[x][y] === 'o')
                rows[y] -= 1;
        }

        if (rows[y] === 3)
            return this.player1;
        else if (rows[y] === -3)
            return this.player2;
    }

    //cols
    for (var x = 0; x < 3; x++){
        cols[x] = 0;
        for (var y = 0; y < 3; y++){
            if (this.gameBoard[x][y] === 'x')
                cols[x] += 1;
            else if (this.gameBoard[x][y] === 'o')
                cols[x] -= 1;
        }

        if (cols[x] === 3)
            return this.player1;
        else if (cols[x] === -3)
            return this.player2;
    }

    var diag = [[0, 0], [1, 1], [2, 2]]
    var antidiag = [[2, 0], [1, 1], [0, 2]];

    for (var i = 0; i < diag.length; i++){
        var coords = diag[i];
        var x = coords[0];
        var y = coords[1];

        var tile = this.gameBoard[x][y];

        if (tile === 'x')
            diags[0] += 1;
        else if (tile === 'o')
            diags[0] -= 1;
    }

    if (diags[0] === 3)
        return this.player1;
    if (diags[0] === -3)
        return this.player2;

    for (var i = 0; i < antidiag.length; i++){
        var coords = antidiag[i];
        var x = coords[0];
        var y = coords[1];

        if (this.gameBoard[x][y] === 'x')
            diags[1] += 1;
        else if (this.gameBoard[x][y] === 'o')
            diags[1] -= 1;
    }

    if (diags[1] === 3)
        return this.player1;
    if (diags[1] === -3)
        return this.player2;

    return null;
}

module.exports = ActiveGame;