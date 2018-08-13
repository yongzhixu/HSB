
var Socket = function(){
    function Socket(socket, ext){

        var that      =
        socket.target = this;
        that.onevent  = {};
        that.socket   = socket;
        if (socket.on){

            socket.on('message', Socket.message);
            socket.on('open'   , Socket.open);
            socket.on('close'  , Socket.close);
            socket.on('error'  , Socket.error);
        } else {
            socket.onmessage = Socket.message;
            socket.onopen    = Socket.open;
            socket.onclose   = Socket.close;
            socket.onerror   = Socket.error;
        }
        ext && Object.keys(ext).forEach(function(key){
            that.on(key, ext[key]);
        });

        return that;
    }
    Socket.event   = function event(key, args){
        var target = this.target;
        var list = target.onevent[key];

        list && list.forEach(function(fn){
            fn.apply(target, args);
        });
    }
    Socket.message = function message(data) {

        if (data.currentTarget === this){
            data = data.data;
        }
        Socket.event.call(this, 'message', [ data ]);

        data       = JSON.parse(data);
        var target = this.target;
        var evname = data.event;
        var ev     = target.onevent[evname];

        target['_on' + typeof ev](evname, ev, data);
    }
    Socket.open     = function open(){

        this.target.state = true;
        Socket.event.call(this, 'open', arguments);
    }
    Socket.close     = function close(){

        this.target.state = false;
        Socket.event.call(this, 'close', arguments);
    }
    Socket.error     = function error(){

        this.target.state = false;
        Socket.event.call(this, 'error', arguments);
    }

    Socket.prototype._onfunction    = function onfunction(name, fn, data){

        // console.log('返回',this.socket.url , name , data);

        delete this.onevent[name];
        fn.call(this , data);
        return this;
    };
    Socket.prototype._onobject      = function onobject(name, arr, data){

        // console.log('监听到' , this.socket.url , name );


        var that     = this;
        var callback = function(code, msg, dt){

            that.state || console.log('Socket.prototype.emit', that.state);

            if (!that.state){
                return;
            };

            dt = {
                event   : data.callback,
                code    : code,
                msg     : msg,
                data    : dt
            };
            that.socket.send(JSON.stringify(dt));

        }
        arr.forEach(function(fn){
            fn.call(that, data.data, callback);
        });

        return this;
    }
    Socket.prototype._onundefined   = function onundefined(name, un, data){

        var evSplit = name.split('/');

        if( evSplit.length !== 2 ){
            return this;
        }
        var key = evSplit[0];

        var target = this.sktList[key];
        if( !target ){
            return this;
        }
        
        data.event = evSplit[1];

        var callback = data.callback;
        if (callback){

            data.callback = this.name + '/' + callback;
        } 

        target.socket.send(JSON.stringify(data));
        return this;
    }
    Socket.prototype.emit           = function emit(ev, data, fn, erFn, timeout){

        // this.state || console.log('Socket.prototype.emit', this.state);
        if (!this.state){
            return;
        }
        var dt = {};
        dt.event = ev;
        if (fn){
            dt.callback = this.callback(fn, erFn, timeout || 60 * 1000);
        }
        dt.data  = data;


        this.socket.send(JSON.stringify(dt));
    }
    Socket.prototype.callback       = function callback(fn, errFn, timeout){


        var fnKey = (+new Date).toString(36) + Math.random().toString(36).slice(2);
        this.onevent[fnKey] = fn;

        errFn && setTimeout(function(that){

            if(that.onevent[fnKey]) {
                delete that.onevent[fnKey];
                errFn.call(that);
            }
        }, timeout, this);

        return fnKey;
    }
    Socket.prototype.on             = function on(evname, fn){

        onevent     = this.onevent;
        var list    = evname in onevent
                    ? onevent[evname]
                    : (onevent[evname] = []);

        list.push(fn);
        return this;
    }
    return Socket;
}();


if (typeof exports !== 'undefined'){
    exports = module.exports = Socket;
}
