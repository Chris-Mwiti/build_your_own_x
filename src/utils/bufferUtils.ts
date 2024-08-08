export type DynBuf = {
    data: Buffer,
    length: number
}

//append data to DynBuf
function bufPush(buf: DynBuf, data: Buffer): void {
    //calc the new length of the buff
    const newLen = buf.length + data.length;

    if(buf.data.length < newLen){
        //grow the capacity...
        let cap = Math.max(buf.data.length,32); // let newLen -> 4 pick 32
        while (cap < newLen){
            //Grow the capacity exponentilly
            cap *= 2;
        }
        const grown = Buffer.alloc(cap);
        buf.data.copy(grown,0,0);
        buf.data = grown;
    }

    data.copy(buf.data,buf.length,0);
    buf.length = newLen
} 

//Extract message from the dynamic buffer
export function cutMessage(buf: DynBuf) : null | Buffer {
    //messages are separeted by '\n'
    const idx = buf.data.subarray(0, buf.length).indexOf('\n');

    if(idx < 0){
        return null;
    }

    //make a copy of the message and move the remaining data to the front
    const msg = Buffer.from(buf.data.subarray(0, idx + 1));
    bufPop(buf,idx + 1);
    return msg;
}

//Removes a set of buffers from the specified condition to the end
/**@todo: improve the buffer pop method to become a smart buffer so that to reduce the time complexity from O(n2) */
function bufPop(buf:DynBuf, len:number): void {
    buf.data.copyWithin(0, len, buf.length);
    buf.length -= len;
}

export default bufPush;