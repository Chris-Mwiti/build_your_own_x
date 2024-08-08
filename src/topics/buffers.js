const { convertToObject } = require("typescript");

//Initialization of buffers
const buffer = new Buffer.alloc(5);
console.log(buffer);

//Equals Method
let joanName = new Buffer.alloc(5, "Joan");
let chrisName = new Buffer.alloc(5, "Chris");

console.log(new Buffer.from(joanName).equals(chrisName));
console.log(joanName);
console.log(chrisName);

//toJSON() Method
let myJson = new Buffer.alloc(10, {
    name: "Fried"
})
console.log(myJson.toJSON());

let unAllocBufferUnsafe = Buffer.allocUnsafe(10);
console.log(unAllocBufferUnsafe)

//byteLength 
let chrisNameLen = Buffer.byteLength(chrisName)
console.log(chrisNameLen);

//compare Method
let bufferArr = [unAllocBufferUnsafe, myJson,joanName,chrisName];
console.log(bufferArr.sort(Buffer.compare).map(val => val.toString()));

//concat method
let concatenatedBuf = Buffer.concat(bufferArr);
console.log(concatenatedBuf.toString());


//copy method 
let randomBuf = Buffer.from('Derrick');
console.log(randomBuf.buffer)
let randomBuf2 = Buffer.from("ricko");

randomBuf2.copy(randomBuf, 2, 0 )
console.log(randomBuf.toString())

//entries method -> returns index,byte

for (let x of randomBuf.entries()){
    console.log(x.toString())
}

//fill method
let istineBuf = Buffer.alloc(20);
let christineName = "Christine";
for(let l = 0; l < christineName.length; l++){
    istineBuf.fill(christineName.charCodeAt([l]), 0, christineName.length - 1);
}
console.log(istineBuf.toString())

//includes method
console.log(randomBuf.includes('D', 3, 'utf-8'))