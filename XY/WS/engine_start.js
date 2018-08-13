const fork = require('child_process').fork;
//保存被子进程实例数组
let workers = [];

//这里的子进程理论上可以无限多
// const appsPath = ['./main/app.http.js','./main/core_ws.js'];//因为app.http.js中已经require了app.ws和wsClient，所以无需再次添加'./main/core_ws.js' 和 wsClient，否则app.ws和wsClient会被启动两次
// const appsPath = [`${__dirname}/main/app.ws.js`];
const appsPath = [`${__dirname}/main/app.http.js`];

const createWorker = function (appPath) {
    // console
    //保存fork返回的进程实例
    const worker = fork(appPath);
    //监听子进程exit事件
    worker.on('exit', function () {
        console.log('worker:' + worker.pid + 'exited');
        delete workers[worker.pid];
        createWorker(appPath);
    });
    workers[worker.pid] = worker;
    console.log('Create worker:' + worker.pid);
};

const start = () => {
    //启动所有子进程
    for (let i = appsPath.length - 1; i >= 0; i--) {
        createWorker(appsPath[i]);
    }
};

module.exports = {
    start: async () => {
        await start();
    },
    restart: async () => {
        // console.log('restart', workers)
        if (workers.length>0) {
            for (let pid in workers) {
                await workers[pid].kill();
            }
        } else {
            await start()
        }
    }
}

//父进程退出时杀死所有子进程
process.on('exit', async () => {
    for (let pid in workers) {
        await workers[pid].kill();
    }
});