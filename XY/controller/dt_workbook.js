const factors = require('./cn_factors')
const givenThres = (ths, columnTitle) => {
    let cap = null;
    try {
        cap = ths[columnTitle].min;
        // cap = ths[columnTitle].min + ths[columnTitle].step * 3;
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
                // return;
            }
            else {
                let risk_givenHold = {}
                for (let hold = init; hold < ths[aoa[0][j]].max; hold += ths[aoa[0][j]].step * 3) {
                    const temp = {
                        "A": 0,
                        "B": 0,
                        "C": 0,
                        "D": 0,
                        "ths": null
                    };
                    for (let i = 0; i < n - 1; ++i) {
                        factors.factors_add(temp, factors.factors_filter(aoa[i + 1][j], hold, aoa[i + 1][1]))
                    }
                    temp['ths'] = hold;
                    risk_givenHold[hold] = temp;
                }
                const tempMax = {
                    "A": 0,
                    "B": 0,
                    "C": 0,
                    "D": 0,
                    "ths": null

                };
                for (let i = 0; i < n - 1; ++i) {
                    factors.factors_add(tempMax, factors.factors_filter(aoa[i + 1][j], ths[aoa[0][j]].max, aoa[i + 1][1]))
                }
                tempMax['ths'] = ths[aoa[0][j]].max;
                risk_givenHold[ths[aoa[0][j]].max] = tempMax;
                ths[aoa[0][j]] = risk_givenHold;
            }
        }
        return ths;
    }
};