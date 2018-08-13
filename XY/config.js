module.exports = {
    ////////////////////////////////////////////////====通用======///////////////////
    errLoop:10,//程序报错后重复执行次数

    netHOST:'192.168.0.88',  //串口服务器 ip
    netPORT:'8007',  //串口服务器 端口
    appPORT:'9064',  //http 端口
    // appHOST:'192.168.0.60',  //http ip
    appHOST:'127.0.0.1',  //http ip
    wsPort:'9999',  //通讯模块 端口
    rtu:{
        //驱控器
        ID:'01', //驱控器地址码
        Get:'03',//写多个线圈
        Run:'05',//写多个线圈
        Set:'06',//写多个线圈
        SetM:'10',//写多个线圈
        engineNap:1500,//启动等待时间
        warmingUp:100,//驱控器命令等待时间
        lightUp:2000,//光源通电和光源开灯之间的间隔
        engineOffGap:30,
        stateAgain:2000,//轮训状态间隔
        goUp:5,//反转上升
        goDown:4,//正转下降
        motorOn:5000,//电机持续运转时间上限
        limit:1300,//电机运行距离上限，用于报警
        switchInterval:1300,//电机运行距离上限，用于报警
    },
    relay1:{
        //继电器1
        ID:'02', //驱控器地址码
        Get:'03',//写多个线圈
        Run:'05',//写多个线圈
        Set:'06',//写多个线圈
        SetM:'10',//写多个线圈
    },

    /////////////////////////////////////////////图像采集//////////////////////////////////////////
    // rootImgURL:'E:/WorkSpace/2018/ATM/ATM_Engine/PhotoCollect/', //图像采集主目录
    // rootImgDir:'test/img/', //图像存储文件夹
    // mvCameraeEXE:'co/MVCamereController/Debug/MVCamereController.exe', //图像采集程序
    rootImgDir:'img/', //图像存储文件夹
    rootImgURL:`${__dirname}/QR/PhotoCollect2/`, //图像采集主目录
    mvCameraeEXE:'MVCamereController/MVCamereController.exe', //图像采集程序
    cameraExpose:0, //相机曝光时间
    cameraExpose64:0, //拍摄base64人工云---相机曝光时间
    cameraExposeGroup:{
        //拍摄base64人工云---组合曝光时间
        1:5,
        2:10,
        3:20,
        4:40,
        5:50,
    },
    imgTakingPause:1200, //相机曝光时间
    cameraQuality:80, //相机保存
    cameraQuality64:100, //相机保存
    photoType:'.jpg',

    /////////////////////////////////////////////开关位置//////////////////////////////////////////
    rtu_bottom:1, //下限位
    rtu_cap:2, //上限位
    rtu_stop:3, //急停
    rtu_goingUp:4, //上行启动
    rtu_drawer:5, //托盘状态

    /////////////////////////////////////////////继电器位置//////////////////////////////////////////
    relay_switch:1, //抽屉电磁锁对应继电器位置
    garage_switch:2, //底部仓库电磁锁对应继电器位置
    relay_illumination:100, //光源对应继电器位置
    relay_illumi_left:3, //左光源对应继电器位置
    relay_illumi_right:4, //右光源对应继电器位置
    relay_rtu:5, //驱控器对应继电器位置
    relay_pc:7, //PC对应继电器位置
    relay_power:8, //继电器，路由器，串口服务器 供电对应继电器位置，用于重启

    /////////////////////////////////////////////继电器位置//////////////////////////////////////////
    // relay_rtu:1, //驱控器对应继电器位置
    // relay_switch:5, //电磁锁对应继电器位置
    // garage_switch:6, //底部仓库电磁锁对应继电器位置
    // relay_illumination:2, //光源对应继电器位置

    ////////////////继电器输入
    drawer_lock:1,
    garage_lock:2,
    garage_full:6, //底部仓库已满状态监测观点开关对应继电器输入位置 I6
};