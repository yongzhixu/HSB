const dt_init = require('../controller/dt_init')
const path = require('path');
const check = require('../common/check')
const risk = require('../controller/cn_risks')
const fs = require('fs')
const {data_path}= require('../config')

module.exports = {
    cn_PNSR: async() => {
        const ABCD = await dt_init.cn_ABCD(data_path)
        for (let keyY in ABCD) {
            for (let keyD in ABCD[keyY]) {
                if ( check.contains_A(ABCD[keyY][keyD])){
                    for (let keyA in ABCD[keyY][keyD]) {
                        ABCD[keyY][keyD][keyA] = risk.factor_risks(ABCD[keyY][keyD][keyA])
                        // console.log(keyY, keyD,keyA, risk.factor_risks(ABCD[keyY][keyD][keyA]))
                    }
                } else {
                    ABCD[keyY][keyD]={
                        "error":"无相关ABCD值"
                    }
                }
            }
        }
        fs.writeFileSync(path.resolve(__dirname,`../data/PNSR.json`),JSON.stringify(ABCD))
        return ABCD;
    }
};