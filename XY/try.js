const fs = require('fs');
module.exports = {
    saveAssoc: (ths, assoc, cb) => {
        try {
            ths.assoclist = assoc;
        }catch (e) {
            ths = {
                "assoclist": 0
            }
        }
        fs.writeFile('./threshold.json', JSON.stringify(ths), cb(ths))
    }
};
console.log(
Math.max.apply(null, [2,1,3])
)