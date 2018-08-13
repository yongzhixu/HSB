const array_fix = (arr) => {
    const max = Math.max.apply(null, arr);
    const min = Math.min.apply(null, arr);
    const step = Math.floor((max - min) / arr.length)
    return {"min": min, "max": max, "step": step};
};
const array_pure = (arr) => {
    let res = [];
    arr.map((currentValue,index) => {
        if (typeof (currentValue) !== "number") {
            // console.log(currentValue,index)
        }
        else {
            res.push(currentValue)
        }
    });
    if (res.length<1){
        res=[0]
    }
    return res;
};


const sheet_mirror = (aoa, n, j, start) => {
    let arr = [];
    for (let i = start; i < n; ++i) {
        arr.push(aoa[i][j]);
    }
    return arr;
};

module.exports = {
    array_fix: (arr) => {
        arr = array_pure(arr);
        const max = Math.max.apply(null, arr);
        const min = Math.min.apply(null, arr);
        const step = (max - min) / arr.length;
        if(max==null){
            console.log(arr)
        }
        return {"min": min, "max": max, "step": step};
    },
    sheet_mirror: (aoa, n, j, start) => {
        let arr = [];
        for (let i = start; i < n; ++i) {
            arr.push(aoa[i][j]);
        }
        return arr;
    }
};