//
// const {spawn} = require('child_process');
// let server = null;
// function startServer(){
//     console.log('start server');
//     server = spawn('node',['./main/app.ws','./main/app.http.js','./common/wsClient.js']);
//     console.log('node js pid is '+server.pid);
//     // console.log('node js pid is '+JSON.stringify(server));
//     server.on('close',function(code,signal){
//         server.kill(signal);
//         server = startServer();
//     });
//     server.on('error',function(code,signal){
//         server.kill(signal);
//         server = startServer();
//     });
//     return server;
// };
//
// startServer();


const fork = require('child_process').fork;
//保存被子进程实例数组
let workers = [];


//这里的子进程理论上可以无限多
// const appsPath = ['./main/app.http.js','./main/app.ws.js'];//因为app.http.js中已经require了app.ws和wsClient，所以无需再次添加'./main/app.ws.js' 和 wsClient，否则app.ws和wsClient会被启动两次
const appsPath = ['./main/app.http.js'];

const createWorker = function(appPath){
    // console
    //保存fork返回的进程实例
    const worker = fork(appPath);

    //监听子进程exit事件
    worker.on('exit',function(){
        console.log('worker:' + worker.pid + 'exited');
        delete workers[worker.pid];
        createWorker(appPath);
    });
    workers[worker.pid] = worker;
    console.log('Create worker:' + worker.pid);
};

const main=()=>{
    //先关闭所有子进程
    for (let i = appsPath.length - 1; i >= 0; i--) {
        // console.log(1);
        // createWorker(appsPath[i]);
    };

    //启动所有子进程
    for (let i = appsPath.length - 1; i >= 0; i--) {
        createWorker(appsPath[i]);
    };
};
main();

//父进程退出时杀死所有子进程
process.on('exit',function(){
    for(let pid in workers){
        workers[pid].kill();
    }
});