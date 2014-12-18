var CommandRouter = require('./CommandRouter');
var request = require('request');
var TicTacToe = require('./TicTacToe/TicTacToe');

var ticTac = new TicTacToe();

// Bot config:
var rooms = {
    // put your hipchat rooms here
};

var wobot = require('wobot');
var bot = new wobot.Bot({
    jid: '', // jabber id
    password: '',
    name: ''
});

// end bot config

var router = new CommandRouter();

router.addRoute('ttt', function(context, args){
    var playerId = context.from.jid;
    var command = args[0];
    var activeGame = ticTac.getActiveGame(playerId);
    var noActiveGameMessage = 'You don\'t have any active games. Try the \'new\' command to start a new game!';

    if (command === 'status'){
        if (!activeGame)
            return onFailure(context, noActiveGameMessage);

        return bot.message(context.channel, '\n' + activeGame.generateGameBoard());
    }

    if (command === 'new'){
        if (activeGame)
            return onFailure(context, 'You already have an active game!. Use the "status" command to see where the game is at, or use the "forfeit" command to end your active game!');

        if (args.length < 2)
            return onFailure(context, 'You can\'t start a game without an opponent! Example: "new @JohnDoe"');

        var mentionName = args.splice(1).join(' ').trim();

        getUserFromMentionName(mentionName, function(user){
            if (!user) return onFailure(context, 'There is no user on this server with a mention name of \'' + mentionName + '\'!');
            var player1 = { id: playerId, name: context.from.mention_name };
            var player2 = { id: user.jid, name: user.mention_name };

            var game = ticTac.newGame(player1, player2);

            bot.message(context.channel, '\n' + game.generateGameBoard());
        });

        return;
    }

    if (command === 'forfeit'){
        if (!activeGame)
            return onFailure(context, noActiveGameMessage);

        var success = ticTac.forfeit(playerId);

        if (success)
            return onSuccess(context, 'You\'ve successfully forfeited ya\' quitter!');

        return onFailure(context, noActiveGameMessage);
    }

    if (command === 'move'){
        var invalidCoordsMessage = 'You have to supply valid integers for move coordinates, between 0 and 2! Example: "move 1 2"';
        if (!activeGame)
            return onFailure(context, noActiveGameMessage);

        if (args.length < 3)
            return onFailure(context, 'You can\t move without supplying an x and y value! Example: "move 1 2"');

        var x = -1, y = -1;

        try {
            x = parseInt(args[1]);
            y = parseInt(args[2]);
        } catch (err){
            return onFailure(context, invalidCoordsMessage);
        }

        if (x < 0 || x > 2 || y < 0 || y > 2) return onFailure(context, invalidCoordsMessage);

        try {
            var valid = activeGame.tryMove(x, y, playerId);

            if (!valid)
                return onFailure(context, 'Invalid move dude! Someone has already taken that tile or you picked something out of bounds.');

            bot.message(context.channel, '\n' + activeGame.generateGameBoard());

            var winner = activeGame.checkWin();
            console.log('Winner: ' + JSON.stringify(winner));

            if (winner) {
                ticTac.endGame(activeGame);
                return onSuccess(context, winner.name + ' is the winner! Game over.', '(dance)');
            }
        } catch (err){
            return onFailure(context, 'It ain\'t yo\' turn!');
        }

        return;
    }

    onFailure(context, 'Invalid command bro! Valid commands are: "new", "forfeit", "status", and "move"');

}, 'Simple tic-tac-toe game! Commands are: "new", "forfeit", "status", and "move"', ['command']);

router.addRoute('gameofthrones', function(context){
    var characters = ['(tywin)', '(joffrey)', '(daenerys)', '(jonsnow)', '(ned)', '(jaime)', '(tyrion)', '(arya)', '(hodor)'];
    bot.message(context.channel, characters.join(' '));
}, 'Prints out all of your favorite GoT characters!');

router.addRoute('chuck', function(context){
    request('http://api.icndb.com/jokes/random', function(error, response, body){
        try {
            body = JSON.parse(body);
            if (body.type === 'success'){
                var joke = decodeURIComponent(body.value.joke);
                return onSuccess(context, joke, '(chucknorris)');
            }
            onFailure(context, 'Something is up with the joke API...chuck norris probably killed it.');
        } catch(e) {
            onFailure(context, 'Something is up with the joke API...chuck norris probably killed it.');
        }
    });
}, 'Everyone loves a Chuck Norris joke.');

//search lookups
//store and search chat history

router.addRoute('slap', function(context, args){
    var user = args[0];

    bot.message(context.channel, '/me slaps @' + user + ' upside the head!');
}, 'Slappa\' da\' bass!', ['user']);

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
bot.on('connect', function(){
    for (var key in rooms)
        this.join(rooms[key]);
});

bot.on('message', function(channel, from, message){
    console.log(channel + ' *** ' + from + ': ' + message);
    if (message.indexOf('@OverBot') === 0)
        return parseCommand(channel, from, message);
})

bot.connect();

function parseCommand(channel, from, message){
    var parts = message.trim().split(' ');

    if (parts.length <= 1)
        return onUnknownCommand(context);

    parts = parts.slice(1, parts.length);

    var identifier = parts[0];
    var args = [];
    if (parts.length > 1)
        args = parts.slice(1, parts.length);

    getUserFromRealName(from, function(user){
        try {
            var context = {
                channel: channel,
                from: user,
                message: message
            };

            var routeExists = router.executeRoute(identifier, context, args);

            if (!routeExists)
                onUnknownCommand(context);
        } catch (error){
            onRouteError(context, error);
        }
    });
}

function onFailure(context, message){
    bot.message(context.channel, '@' + context.from.mention_name + ' - ' + message + ' (wtf)');
}

function onSuccess(context, message, icon){
    var ico = icon || '(success)';
    bot.message(context.channel, '@' + context.from.mention_name + ' - ' + message + ' ' + ico);
}

function onRouteError(context, error){
    bot.message(context.channel, '@' + context.from.mention_name + ' - ' + error + ' (derp)');
}

function onFatalError(context){
    bot.message(context.channel, '@' + context.from.mention_name + ' - ....something went very wrong! Better check my server logs!' + ' (failed)');
}

function onUnknownCommand(context){
    bot.message(context.channel, '@' + context.from.mention_name + ' - I don\'t know that one. (wat)');
}

function getUserFromRealName(realName, callback){
    bot.getRoster(function(err, roster){
        if (err) return callback(null);
        for (var i = 0; i < roster.length; i++){
            if (roster[i].name === realName)
                return callback(roster[i]);
        }

        callback(null);
    });
}

function getUserFromMentionName(mentionName, callback){
    mentionName = mentionName.replace('@', '');
    bot.getRoster(function(err, roster){
        if (err) return callback(null);
        for (var i = 0; i < roster.length; i++){
            if (roster[i].mention_name === mentionName)
                return callback(roster[i]);
        }

        callback(null);
    });
}