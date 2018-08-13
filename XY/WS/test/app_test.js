// console.log(Buffer.from([255,255]))

const buf = Buffer.from([22,255]);
console.log(buf)
console.log(buf.readInt16BE(0));
// Prints: 5
console.log(buf.readInt16LE(0));
// Prints: 1280
// console.log(buf.readInt16LE(1));
// Throws ERR_OUT_OF_RANGE