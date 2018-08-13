var WSclient = require('./ws');
const fs = require('fs');
const config = require('../../config');

var obj = {

    yourName: function (data, fn) {
        fn(0, 'ok', {name: 'test'});
        // client.emit('wifi/reset', {}, function(dt){
        //     console.log(dt);
        // });
    },
    wifiStatus: function (data, fn) {
        console.log('data'+JSON.stringify(data));
        fn(0, 'msg', {
             wifiStatus: 'wifiStatus',
        });
    }
};
// 参数，url ,监听事件
var client ={};

module.exports = client;

const writeLog=(data)=>{
    fs.appendFile('log.txt', '\n'+data+'\n', (err) => {
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
    });
};


//  连接客户端
function wSConnect(  path , targetEvent ) {

    client.skt = WSclient( path, targetEvent);
    client.skt.on('close', function(){
            // writeLog(`wsClient连接关闭===${Date.now().toLocaleString()}`);
            console.log('wsClient连接关闭');
        setTimeout(function(){
            // client['skt'] = wSConnect(  path , targetEvent);
            // const https = require('./abd/app.http'); //进一步出发‘close’时间
            // require('../main/app.http.js');//实例化，并将重新连接websocket（app.http.js  中已经require了app.ws和wsClient）
        },1000);
    });

    client.skt.on('open', function () {
        console.log('wsClient连接成功');
        // writeLog(`wsClient连接成功===${Date.now().toLocaleString()}`);
    });

    client.skt.on('message', function (dt) {
        // console.log('ws监听Client', dt);
    });

};

wSConnect( `ws://${config.appHOST}:${config.wsPort}`, obj);




