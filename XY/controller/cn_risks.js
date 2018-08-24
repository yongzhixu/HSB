module.exports = {
    factor_risks: (obj) => {
        return factor_risks(obj.A, obj.B, obj.C, obj.D, obj.ths)
    },
};
const factor_P = (A, C) => {
    return A / (A + C);
};
const factor_NSR = (A, B, C, D) => {
    return (factor_P(B, D)) / (factor_P(A, C));
};
const factor_PSR = (A, B, C, D) => {
    return (A + D) / (A + B + C + D);
};
const factor_risks = (A, B, C, D, ths) => {
    return {
        "A": A,
        "B": B,
        "C": C,
        "D": D,
        "ths": ths,
        "P": factor_P(A, B),
        "NSR": factor_NSR(A, B, C, D),
        "PSR": factor_PSR(A, B, C, D)
    }
};


// const test = async () => {
//     console.log(factor_NSR(1, 3, 4, 5))
//     console.log( factor_P(1, 3))
// }
//
// test()