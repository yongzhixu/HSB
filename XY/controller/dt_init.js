const XLSX = require('xlsx');
const ths = require('../config/threshold.json')
const check = require('../common/check')
const dt_workbook = require('./dt_workbook')
const fs = require('fs');

/* get the first worksheet as an array of arrays, skip the first row */
// const wb = XLSX.readFile('../data/使用数据.xlsx', {type: "file"});
//
// // const res = ths;
// for (let i = 0; i < wb.SheetNames.length; ++i) {
//     const ws = wb.Sheets[wb.SheetNames[i]];
//     const aoa = XLSX.utils.sheet_to_json(ws, {header: 1, raw: true}).slice(1);
//     const key = check.thresTrackP(ths, wb.SheetNames[i]);
//     if (!key) {
//         ths[wb.SheetNames[i]] = {
//             "error": "数据sheet名称和阈值标题不对应"
//         };
//     }
//     else {
//         dt_workbook._workbook(aoa, 2, ths[wb.SheetNames[i]])
//         // res[wb.SheetNames[i]] = dt_workbook._workbook(aoa, 2, ths[wb.SheetNames[i]])
//     }
// }
// // console.log(res["1996Q1"]);
// fs.writeFileSync('../data/123.json', JSON.stringify(ths))


module.exports = {
    cn_ABCD: async(fname) => {
        /* get the first worksheet as an array of arrays, skip the first row */
        const wb = XLSX.readFile(fname, {type: "file"});
        for (let i = 0; i < wb.SheetNames.length; ++i) {
            const ws = wb.Sheets[wb.SheetNames[i]];
            const aoa = XLSX.utils.sheet_to_json(ws, {header: 1, raw: true}).slice(1);
            const key = check.thresTrackP(ths, wb.SheetNames[i]);
            if (!key) {
                ths[wb.SheetNames[i]] = {
                    "error": "数据sheet名称和阈值标题不对应"
                };
            }
            else {
                dt_workbook._workbook(aoa, 2, ths[wb.SheetNames[i]])
            }
        }
        return ths;
    }
};