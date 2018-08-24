const cnmid = require('../controller/cn_mid');
const check = require('../common/check');
const _ = require('lodash');
const {data_path, p_cap} = require('../config')
const fs = require('fs')
const path = require('path')

const verify = (slot) => {
    if (slot.P >= p_cap) {
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
const arrfilter = (arr, ver) => {
    if (ver) {
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
                    "NSR": slot.NSR,
                    "PSR": slot.PSR,
                })
                // res.push(slot.NSR)
            }
        });
        res = _.sortBy(res, 'NSR')
        return res;
    }
    else {
        arr = _.sortBy(arr, ['NSR']);
        return arr;
    }
}

(async () => {
    const pnsr = await cnmid.cn_PNSR();
    for (let key1 in pnsr) {
        for (let key2 in pnsr[key1]) {
            if (check.contains_A(pnsr[key1][key2])) {
                const arr = obj_arr(pnsr[key1][key2]);
                // console.log(pnsr[key1][key2])
                const arrFilter = arrfilter(arr, true);
                const mymy = {}
                if (arrFilter[0]) {
                    arrFilter[0].ths = Math.round(arrFilter[0].ths * 100) / 100;
                    arrFilter[0].P = Math.round(arrFilter[0].P * 100) / 100;
                    arrFilter[0].NSR = Math.round(arrFilter[0].NSR * 100) / 100;
                    arrFilter[0].PSR = Math.round(arrFilter[0].PSR * 100) / 100;
                    // arrFilter[0].min_NSR = Math.round(_.minBy(arrFilter, "NSR").NSR * 100) / 100;
                    mymy.p_cap = arrFilter[0];
                    // pnsr[key1][key2] = arrFilter[0];
                } else {
                    // console.log(key1, key2, pnsr[key1][key2],arrFilter)
                    mymy.p_cap = {"message": `无满足条件(如：P>${p_cap})的值`};
                }
                const arrFilter2 = arrfilter(arr, false);
                if (arrFilter2[0]) {
                    arrFilter2[0].ths = Math.round(arrFilter2[0].ths * 100) / 100;
                    arrFilter2[0].P = Math.round(arrFilter2[0].P * 100) / 100;
                    arrFilter2[0].NSR = Math.round(arrFilter2[0].NSR * 100) / 100;
                    arrFilter2[0].PSR = Math.round(arrFilter2[0].PSR * 100) / 100;
                    mymy.min_NSR = arrFilter2[0];
                    // pnsr[key1][key2] = arrFilter[0];
                } else {
                    // console.log(key1, key2, pnsr[key1][key2],arrFilter)
                    mymy.min_NSR = {"message": `无满足条件(如：min_NSR)的值`};
                }
                pnsr[key1][key2] = mymy;
            }
        }
    }
    console.log(pnsr['1996Q1'])
    fs.writeFileSync(path.resolve(__dirname, `../data/result.json`), JSON.stringify(pnsr))

})()