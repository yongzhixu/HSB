const factors_filter = (init, ths, crisis) => {
    if (crisis) {
        if (init > ths) {
            return "A";
        }
        else {
            return "C";
        }
    } else {
        if (init > ths) {
            return "B";
        }
        else {
            return "D";
        }
    }
}
const test = {
    "A": 0,
    "B": 0,
    "C": 0,
    "D": 0,
}

const factors_add = (count, factor) => {
    try {
        count[factor]++;
    } catch (e) {

    }
};

module.exports = {
    factors_add: (count, factor) => {
        try {
            count[factor]++;
        } catch (e) {
            count[factor] = 0;
        }
    },
    factors_filter: (init, ths, crisis) => {
        if (crisis) {
            if (init > ths) {
                return "A";
            }
            else {
                return "C";
            }
        } else {
            if (init > ths) {
                return "B";
            }
            else {
                return "D";
            }
        }
    }
};