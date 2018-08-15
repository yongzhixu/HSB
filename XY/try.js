

const cnmid = require('./controller/cn_mid');
(async()=>{
   const pnsr = await cnmid.cn_PNSR();
   console.log(pnsr['1996Q1']['GDP增长率'])
})()