
var WSServer     = require('ws').Server                                 ;
var WSclient     = require('./ws')                              ;
var wss          = new WSServer({ port : 9999 })                        ;
var check        = [ 'cc', 'test', 'test2', 'demo','wifi'];
var sktList      = {}                                                   ;
var wSConnect    = require('./wSConnect')                       ;

module.exports = exports = sktList;

// 断开连接
function onClose(){

    delete sktList[this.name];

        var keys = [];

    for (var p in sktList){
        keys.push(p);
    };

    console.log('剩下连接的对象',keys)

}

// 确定连接对象
function yourName(dt){

    var name = dt.data.name;

    if (
        check.some(function(item){return item === name}) && !sktList[name]) {

        this.name       = name;
        sktList[name]   = this;

    }else {
        this.socket.state = false;
        console.log('error', name);
        this.socket.close();
    }

    var keys = [];

    for (var p in sktList){
        keys.push(p);
    };

    console.log('已连接的对象',keys);

    if( dt.data.name ==='mc'){

        setTimeout(function(){

            if( !sktList['cc'] ){ return };

            sktList['cc'].emit('HwInitial',{},function(){});

        },5000)

    };


}

// 超时回复
function overtimeFun(){

    this.socket.state = false;

    console.log('overtime');
    this.socket.close();

}

// 监听连接成功事件
wss.on('connection', function( socket ){

    var encapsu =  require('../common/socket');
    var socket = new encapsu( socket , { send : function( dt, fn ){

        console.log('接收到send',"数据是:" + JSON.stringify( dt , null , 4 ) );

        fn(0,'ok!',dt);

    }});
    socket.sktList = sktList;
    socket.state = true;

    socket.on('close',onClose);

    socket.on('error',onClose);

    socket.on('message',function(data){

        var json    = JSON.parse(data);
        var evSplit = json.event.split('/');

        if( evSplit.length !== 2 ){ return };

        var key    = evSplit[0];
        json.event = evSplit[1];
        var callback = json.callback ? 0 : 1 ;

        data = JSON.stringify(json);

        if(sktList['demo']){

            var dt = {
                receiveInfo   : data        ,
                sendTarget    : socket.name ,
                receiveTarget : key         ,
                type          : callback    ,
            };

            sktList['demo'].emit('output', dt, function(data){})

        }else{

            console.log('_____________________________________________');
            console.log( socket.name, callback ? '发送':'返回', key );
            console.log(data);
        }


    });

    setTimeout(function( socket ){

        socket.emit('yourName', {} , yourName , overtimeFun , 5000 );

    }, 1000, socket);

});

// var mailMan = require('../centerControl/mailMan');
