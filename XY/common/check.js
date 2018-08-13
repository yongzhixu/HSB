module.exports={
    thresTrack:(ths,sheetName, columnTitle) => {
        return ths[sheetName][columnTitle] ? ths[sheetName][columnTitle] : null;
    },
    thresTrackP:(ths, columnTitle) => {
        return ths[columnTitle] ? ths[columnTitle] : null;
    },

}