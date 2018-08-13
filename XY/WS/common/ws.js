var WS = function (){

    function WS(url, ext){
        // console.log(url);

        var socket = new WS.WebSocket(url);
        return new WS.Socket(socket, ext);
    }
    WS.WebSocket    = typeof WebSocket === 'function'  ? WebSocket : require('ws');
    // WS.WebSocket    = require('ws');
    WS.Socket       = typeof Socket    === 'undefined' ? require('./socket') : Socket;
    return WS;
}();

if (typeof exports !== 'undefined'){
    exports = module.exports = WS;
}
