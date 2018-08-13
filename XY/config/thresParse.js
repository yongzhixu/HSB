const XLSX = require('xlsx');
const fs = require('fs');
const row_array = require('../common/row_array');

/* get the first worksheet as an array of arrays, skip the first row */
const wb = XLSX.readFile('../data/使用数据.xlsx');
const ths = {}
for (let i = 0; i < wb.SheetNames.length; ++i) {
    const ws = wb.Sheets[wb.SheetNames[i]];
    const aoa = XLSX.utils.sheet_to_json(ws, {header: 1, raw: true}).slice(1);
    ths[wb.SheetNames[i]] = {}
    for (let j = 0; j < aoa[0].length; j++) {
        ths[wb.SheetNames[i]][aoa[0][j]] = row_array.array_fix(row_array.sheet_mirror(aoa,aoa.length,j,1))
    }
}
fs.writeFileSync('./threshold.json', JSON.stringify(ths))
