const cnmid = require('../controller/cn_mid');
const check = require('../common/check');
const _ = require('lodash/core');

const verify = (slot) => {
    if (slot.P > 0.6) {
        return true;
    }
    return false;
}
const obj_arr = (obj) => {
    let arr = [];
    for (let key in obj) {
        arr.push(obj[key]);
    }
    return arr;
}
const arrfilter = (arr) => {
    let res = [];
    arr.forEach((slot) => {
        // console.log("slot",slot)
        if (verify(slot)) {
            res.push({
                "A": slot.A,
                "B": slot.B,
                "C": slot.C,
                "D": slot.D,
                "ths": slot.ths,
                "P": slot.P,
                "NSR": slot.NSR
            })
            // res.push(slot.NSR)
        }
    });
    _.sortBy(res, ['NSR', 'P'])
    return res;
}

(async () => {
    const pnsr = await cnmid.cn_PNSR();
    for (let key1 in pnsr) {
        for (let key2 in pnsr[key1]) {
            if (check.contains_A(pnsr[key1][key2])) {
                const arr = obj_arr(pnsr[key1][key2]);
                // console.log(pnsr[key1][key2])
                const arrFilter = arrfilter(arr);
                if (arrFilter[0]) {
                    arrFilter[0].ths = Math.round(arrFilter[0].ths * 100) / 100;
                    arrFilter[0].P = Math.round(arrFilter[0].P * 100) / 100;
                    arrFilter[0].NSR = Math.round(arrFilter[0].NSR * 100) / 100;
                    pnsr[key1][key2] = arrFilter[0];
                } else {
                    // console.log(key1, key2, pnsr[key1][key2],arrFilter)
                    pnsr[key1][key2] = {"message": "无满足条件(如：P>0.6)的值"};
                }
            }
        }
    }
    console.log(pnsr)
})()