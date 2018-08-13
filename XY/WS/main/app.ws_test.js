const WSclient = require('../common/ws'); //webSocket
const _ws = require('./core/core_ws');



//==============================================================接口===============================================/////////
let obj = {
    yourName: function (data, fn) {
        fn(0, 'success', {name: 'imgEngine'});
    },
    async relayOn(data, fn) {
        await _ws.F_relayOn(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
    async relayOff(data, fn) {
        await _ws.F_relayOn(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
    /**
     * decode qr code from image
     * @param data
     * @param fn
     * @returns {Promise<void>}
     */
    async getQRCode(data, fn) {
        await _ws.F_getQRCode(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
    /**
     * take photo and delivery it as base64 format
     * @param data
     * @param fn
     * @returns {Promise<void>}
     */
    async getImg64(data, fn) {
        await _ws.F_getImg64(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
    async M_Run_lift(data, fn) {
        await _ws.F_Run_lift(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
    async M_Run_stop(data, fn) {
        await _ws.F_Run_stop(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
    /**
     * open the drawer
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async M_Run_drawer(data, fn) {
        await _ws.F_Run_drawer(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
    /**
     * 等待托盘抽出
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async M_Wait_drawerOut(data, fn) {
        await _ws.F_Wait_drawerOut(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
    /**
     * 等待托盘关闭
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async M_Wait_drawerClose(data, fn) {
        await _ws.F_Wait_drawerClose(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
    /**
     * 查询托盘关闭状态
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async M_drawer_check(data, fn) {
        await _ws.F_drawer_check(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
    async M_Query_lift(data, fn) {
        await _ws.F_Query_lift(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
    async M_lift_to(data, fn) {
        await _ws.F_lift_to(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
    async M_lift_pack(data, fn) {
        await _ws.F_lift_pack(data, (dt)=>{
            fn(dt.code, dt.msg, dt.data);
        })
    },
    /**
     * deprecated
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async M_lights_switch(data, fn) {
        await _ws.F_lights_switch(data, (res)=>{
            fn(res[0],res[1],res[2])
        })

    },
    /**
     * turn on the lights, handle left from ight
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async M_illums_switch(data, fn) {
        await _ws.F_illums_switch(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
    /**
     * 开闭一体机
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async M_PC_switch(data, fn) {
        await _ws.F_PC_switch(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
    /**
     * 重启继电器 路由器 串口服务器
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async M_relay_switch(data, fn) {
        await _ws.F_relay_switch(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
    /**
     * 开闭驱控器
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async M_engine_switch(data, fn) {
        await _ws.F_engine_switch(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
    /**
     * open garage
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async M_garage_open(data, fn) {
        await _ws.F_garage_open(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
    /**
     * check the capacity of the garage
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async M_garage_check(data, fn) {
        await _ws.F_garage_check(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
    /**
     * waiting for garage lock
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async M_garage_lock_wait(data, fn) {
        await _ws.F_garage_lock_wait(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
    /**
     * waiting for drawer lock
     * @param data
     * @param fn
     * @returns {Promise<void>}
     * @constructor
     */
    async M_drawer_lock_wait(data, fn) {
        await _ws.F_drawer_lock_wait(data, (res)=>{
            fn(res[0],res[1],res[2])
        })
    },
};

let ws_imgEngine = {};
module.exports = ws_imgEngine;

const callConnection = (path, obj) => {
    ws_imgEngine.serv = WSclient(path, obj);
    ws_imgEngine.serv.on('open', function () {

        console.log('ws_imgEngine_连接成功');
        ws_imgEngine.shuo = false;
        // writeLog(`ws_imgEngine_连接成功===${Date.now().toLocaleString()}`);
    });
    ws_imgEngine.serv.on('close', function () {
        console.log('ws_imgEngine_连接关闭');
        // writeLog(`ws_imgEngine_连接关闭===${Date.now().toLocaleString()}`);
        setTimeout(function () {
            // ws_imgEngine.serv = callConnection(  path , obj);
            // const https = require('./abd/app.http'); //进一步触发‘close’时间
            require('./app.ws.js');//实例化，并将重新连接websocket（app.http.js  中已经require了app.ws和wsClient）
            throw new Error();
        }, config.rtu.stateAgain);
    });
    ws_imgEngine.serv.on('message', async (dt) => {
        // console.log('message');
        // console.log('message');
        await _ws.engineSleepZero();
    });
};
callConnection(`ws://${config.appHOST}:${config.wsPort}`, obj);