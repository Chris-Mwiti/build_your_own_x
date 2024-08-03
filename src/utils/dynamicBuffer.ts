type DynBuf = {
    data: Buffer,
    length: number
}

//append data to DynBuf
function bufPush(buf: DynBuf, data: Buffer): void {
    const newLen = buf.length + data.length;

    if(buf.data.length < newLen){
        //grow the capacity...
        let cap = Math.max(buf.data.length,32);
        while (cap < newLen){
            cap *= 2;
        }
        const grown = Buffer.alloc(cap);
        buf.data.copy(grown,0,0);
        buf.data = grown;
    }

    data.copy(buf.data,buf.length,0);
    buf.length = newLen
} 

export default bufPush;