const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ejs = require('ejs');
const config = require('../../config');
const aging = require('./aging');
const engine = null;
const fs = require('fs');
const buttons = require('../test/tsFlocks');
app.use('/assets', express.static(__dirname + '/public')); // '/assets' rather than 'assets'
app.use(bodyParser.urlencoded({extended: false}));
app.engine('html', ejs.__express);
app.set('view engine', 'ejs');
let msg;

const PORT = config.appPORT;


const writeLog = (data) => {
    fs.appendFile('log.txt', '\n' + data + '\n', (err) => {
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
    });
};
app.use('/', (req, res, next) => {
    // res.send('hello');
    res.render(`${__dirname}/views/home`, {buttonG: buttons.buttons});
    next();
});

//=======================================================================拍照===========================================================//
app.get('/imgQR', async (req, res, next) => {
    let ress = null;
    ress = await client.emit('imgEngine/getQRCode', {
        code: 0,
        client: 'test',
    }, function (dt) {
        console.log('httpreset' + JSON.stringify(dt.data.qrInfo));
        writeLog(JSON.stringify(dt.data.qrInfo) + '===' + Date.now().toLocaleString());
        ress = JSON.stringify(dt.data);
    });
    res.send('mew' + ress);
    next();
});

//=======================================================================获取位置信息===========================================================//
app.get('/M_Query_lift', async (req, res, next) => {
    let ress = null;
    ress = await client.emit('imgEngine/M_Query_lift', {
        code: 0,
        client: 'test',
    }, function (dt) {
        // console.log('httpreset' + JSON.stringify(dt));
    });
    // res.send('mew'+ress);
    next();
});


//=======================================================================获取位置信息===========================================================//
app.get('/M_garage_open', async (req, res, next) => {
    let ress = null;
    ress = await client.emit('imgEngine/M_garage_open', {
        code: 0,
        client: 'test',
    }, function (dt) {
        // console.log('httpreset' + JSON.stringify(dt));
    });
    // res.send('mew'+ress);
    next();
});

//=======================================================================等待抽屉关闭===========================================================//
app.get('/M_Wait_drawerClose', async (req, res, next) => {
    let ress = null;
    await client.emit('imgEngine/M_lift_pack', {
        code: 0,
        // job:'init_recycle',
        // job:'cell_detect',
        job: 'quit_recycle',
        // job:'hesitate_recycle',
    }, function (dt) {
        // console.log('httpreset' + JSON.stringify(dt));
    });
    ress = await client.emit('imgEngine/M_Wait_drawerClose', {
        code: 0,
        time: 20000,
    }, async (dt) => {
        // console.log('httpreset' + JSON.stringify(dt));
        await client.emit('imgEngine/M_lift_pack', {
            code: 0,
            // job:'init_recycle',
            // job:'cell_detect',
            job: 'quit_recycle',
            // job:'hesitate_recycle',
        }, function (dt) {
            // console.log('httpreset' + JSON.stringify(dt));
        });
    });
    // res.send('mew'+ress);
    next();
});

//=======================================================================等待抽屉关闭===========================================================//
app.get('/M_Run_stop', async (req, res, next) => {
    let ress = null;
    ress = await client.emit('imgEngine/M_Run_stop', {
        code: 0,
        client: 'test',
        time: 1500,
    }, function (dt) {
        // console.log('httpreset' + JSON.stringify(dt));
    });
    // res.send('mew'+ress);
    next();
});

//=======================================================================等待抽屉关闭===========================================================//
app.get('/M_Run_lift', async (req, res, next) => {
    let ress = null;
    ress = await client.emit('imgEngine/M_Run_lift', {
        code: 0,
        switch: 'up',
        time: 1500,
    }, function (dt) {
        // console.log('httpreset' + JSON.stringify(dt));
    });
    // res.send('mew'+ress);
    next();
});

//=======================================================================等待抽屉关闭===========================================================//
app.get('/M_lift_pack', async (req, res, next) => {
    let ress = null;
    ress = await client.emit('imgEngine/M_lift_pack', {
        code: 0,
        job: 'init_recycle',
        // job:'cell_detect',
        // job:'quit_recycle',
        // job:'hesitate_recycle',
    }, function (dt) {
        // console.log('httpreset' + JSON.stringify(dt));
    });
    // res.send('mew'+ress);
    next();
});

//=======================================================================等待抽屉关闭===========================================================//
app.get('/M_lights_switch', async (req, res, next) => {
    let ress = null;
    ress = await client.emit('imgEngine/M_lights_switch', {
        code: 0,
        // switch:'on',
        switch: 'off',
    }, function (dt) {
        // console.log('httpreset' + JSON.stringify(dt));
    });
    // res.send('mew'+ress);
    next();
});

//=======================================================================临时测试===========================================================//
app.get('/test', async (req, res, next) => {
    // await client.emit('imgEngine/M_Wait_drawerClose', {
    await client.emit('imgEngine/M_drawer_check', {
        // await client.emit('imgEngine/M_lift_pack', {
        code: 0,
        // job:'init_recycle',
        // job:'cell_detect',
        time: 6000,
        job: 'hesitate_recycle',
    }, function (dt) {
        // console.log('httpreset' + JSON.stringify(dt));
    })
    next();
});


//=======================================================================测试===========================================================//
app.get('/en/:which/:data', async (req, res, next) => {
    console.log(`imgEngine/${req.params.which}`);
    if (req.params.which === 'M_prj_resart') {
        server.close()
    }
    const dt = {
        // await client.emit(`imgEngine/M_engine_switch`, {
        code: 0,
        // switch:'on',
        which: req.params.data.split('&')[0],
        switch: req.params.data.split('&')[1],
        job: req.params.data.split('&')[2],
        time: req.params.data.split('&')[3],
    };
    await aging[req.params.which](dt, (dt, d2, d3) => {
        console.log(dt, d2, d3)
    });
    // next();
});

//=======================================================================测试===========================================================//
app.get('/loop/:which/:data', async (req, res, next) => {
    console.log(`imgEngine/${req.params.which}`);
    const dt = {
        // await client.emit(`imgEngine/M_engine_switch`, {
        code: 0,
        // switch:'on',
        which: req.params.data.split('&')[0],
        switch: req.params.data.split('&')[1],
        job: req.params.data.split('&')[2],
        time: req.params.data.split('&')[3],
    };
    await aging[req.params.which](dt, (dt, d2, d3) => {
        console.log(dt, d2, d3);
    });
    next();
});

app.param('en', async (req, res, next, en) => {
    await client.emit(`imgEngine/${en}`, {
        code: 0,
        // switch:'on',
        switch: 'off',
    }, function (dt) {
        // console.log('httpreset' + JSON.stringify(dt));
    });
    next();
});

//=======================================================================电控===========================================================//
app.param('cmd', async (req, res, next, cmd) => {
    if (cmd === 'goingUp') {
        //上升
        await engine.rtuUp();
        // res.send();
    } else if (cmd === 'goingDown') {
        //下降
        await engine.rtuDown()

    } else if (cmd === 'Stop') {
        //急停
        await engine.rtuStop();

    } else if (cmd === 'switchOn') {
        //下降
        await engine.switchOn();

    } else if (cmd === 'pos') {
        //获取当前位置
        await engine.rtuPos();
    } else if (cmd === 'posZero') {
        //获取当前位置
        await engine.rtuPosZero();
    }
    next();
});

app.get('/rtu/:cmd', function (req, res, next) {
    // console.log('although this matches');
    next();
});

//=======================================================================继电器===========================================================//
app.param('on', async (req, res, next, on) => {
    engine.relayOn(on);
    next();
});

app.param('off', async (req, res, next, off) => {
    engine.relayOff(off);
    next();
});

app.get('/relayOn/:on', function (req, res, next) {
    // console.log('although this matches');
    next();
});
app.get('/relayOff/:off', function (req, res, next) {
    // console.log('although this matches');
    next();
});

let server;
const portL = () => {
    server = app.listen(PORT, async (err) => {
        if (err) {
            server.close();
            portL();
        }
        else {
            console.log(config.appPORT);
            // await aging.M_switch_test_drawer();
        }
    });
    // server.close();
};
portL()
