import type net from 'net'
type TCPConn = {
    socket: net.Socket;

    err: null | Error;
    ended: boolean;

    //the callbacks of the promise of the current read
    reader:null | {
        resolve:(value: Buffer) => void;
        reject: (reason: Error) => void;
    }

    
}
export {
    TCPConn,
}