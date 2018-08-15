module.exports = {
    thresTrack: (ths, sheetName, columnTitle) => {
        return ths[sheetName][columnTitle] ? ths[sheetName][columnTitle] : null;
    },
    thresTrackP: (ths, columnTitle) => {
        return ths[columnTitle] ? ths[columnTitle] : null;
    },
    contains_A: (obj) => {
        for (let value in obj) {
            if (obj[value]["A"]+1) {
                return true;
            }
        }
        return false;
    },

}