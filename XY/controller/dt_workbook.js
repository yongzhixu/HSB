const factors = require('./cn_factors')
const givenThres = (ths, columnTitle) => {
    let cap = null;
    try {
        cap = ths[columnTitle].min + ths[columnTitle].step * 3;
    } catch (e) {
    }
    return cap ? cap : null;
};
module.exports = {
    _workbook: (aoa, start, ths) => {
        const n = aoa.length, m = aoa[0].length;
        for (let j = start; j < m; ++j) {
            const init = givenThres(ths, aoa[0][j]);
            if (!init) {
                ths[aoa[0][j]] = {
                    "error": "数据列和阈值标题不对应"
                };
                return;
            }
            else {
                let risk_givenHold={}
                for(let hold = init; hold < ths[aoa[0][j]].max; hold+=ths[aoa[0][j]].step*3){
                    const temp = {
                        "A": 0,
                        "B": 0,
                        "C": 0,
                        "D": 0
                    };
                    for (let i = 0; i < n; ++i) {
                        factors.factors_add(temp, factors.factors_filter(aoa[i][j], hold, false))
                    }
                    risk_givenHold[hold] = temp;
                }
                ths[aoa[0][j]] = risk_givenHold;
            }
        }
        return ths;
    }
};