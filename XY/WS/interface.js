module.exports = {
    M_illums_switch: {
        //开闭光源，可同时开闭两个或者单独开闭一个
        method: 'M_illums_switch',
        data: {
            which: [
                'both',
                'left',
                'right'
            ], switch: ['on', 'off']
        },
    },
    M_PC_switch: {
        //开闭pc
        method: 'M_PC_switch',
        data: {
            switch: ['on', 'off']
        },
    },
    M_relay_switch: {
        //重启继电器
        method: 'M_relay_switch',
        data: {
            switch: ['restart']
        },
    },
    alarm: {
        //设备故障报警
        data: {code: -1, msg: 'fails', data: '限位开关故障'},
    },
    getImg64: {
        //获取base64
        data: {
            expose: 1
        },
    },
};