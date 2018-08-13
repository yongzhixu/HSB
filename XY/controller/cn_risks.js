module.exports={

};



const factor_P = async(A, C)=>{
    return A/(A+C);
};
const factor_NSR = async(A,B,C,D)=>{
    return (await factor_P(B, D))/(await factor_P(A, C));
};


const test = async()=>{
    console.log(await factor_NSR(1,3,4,5))
    console.log(await factor_P(1,3))
}

test()