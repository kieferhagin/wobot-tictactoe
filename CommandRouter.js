function CommandRouter(){
    this.routes = {};
}

CommandRouter.prototype.addRoute = function(identifier, handler, description, requires, options){
    identifier = identifier.toLowerCase();

    var route = {
        identifier: identifier,
        handler: handler,
        requires: requires,
        options: options,
        description: description
    };

    this.routes[identifier] = route;
}

CommandRouter.prototype.executeRoute = function(identifier, context, allArgs){
    identifier = identifier.toLowerCase();

    if (this.routes.hasOwnProperty(identifier)){
        var route = this.routes[identifier];

        var structuredArgs = structureArguments(allArgs);

        if (!assertSignature(route, structuredArgs.required))
            throw identifier + ' requires: ' + route.requires.join(', ');

        route.handler(context, structuredArgs.required, structuredArgs.options);
        return true;
    }

    return false;
}

CommandRouter.prototype.generateHelp = function(){
    var help = "~*~ Routes Help ~*~";
    help += '\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n';

    for (var key in this.routes){
        var route = this.routes[key];
        help += '"' + route.identifier + '" - ' + route.description;

        if (route.requires || route.options)
             help += ' || ';

        if (route.requires){
            help += 'params: ';
            help += route.requires.join(', ');
            if (route.options)
                help += ' | ';
        }
        if (route.options){
            help += 'options: ';
            route.options.forEach(function(element, index, array){
                help += ' -' + element;
            });
        }

        help = help.trim();
        help += '\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n';
    }

    return help;
}

function structureArguments(args){
    var options = [];

    for (var i = 0; i < args.length; i++){
        var arg = args[i];
        var isOption = arg.indexOf('-') === 0;

        if (isOption) {
            options.push(arg.slice(1));
            args.splice(i, 1);
            i--;
        }
    }

    return {
        required: args,
        options: options
    };
}

function assertSignature(route, args){
     if (route.requires && route.requires.length > 0){
        if (!args || route.requires.length > args.length){
            return false;
        }
    }

    return true;
}

module.exports = CommandRouter;