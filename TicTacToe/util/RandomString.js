module.exports = function(size){
    size = size|32;

    var str = "";
    for (var i = 0; i < size; i++){
        str += random_character();
    }
    return str;
}
function random_character() {
    var chars = "0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ";
    return chars.substr( Math.floor(Math.random() * 62), 1);
}