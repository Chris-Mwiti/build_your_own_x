import { TCPConn } from "../types/server.types";
import type net from 'net';
import bufPush, { DynBuf } from "./bufferUtils";
import { cutMessage } from "./bufferUtils";

function soInit(socket: net.Socket): TCPConn {
    const conn:TCPConn = {
        socket: socket, reader: null, ended: false, err: null
    }

    socket.on('data', (data: Buffer) => {
        console.assert(conn.reader);

        //pause the 'data'event until the next read
        conn.socket.pause();

        //fulfill the promise of the current read.
        conn.reader!.resolve(data);
        conn.reader = null;
    })
    
    socket.on("end", () => {
        //this also fulfills the current read. 
        conn.ended = true;

        if(conn.reader){
            conn.reader.resolve(Buffer.from(''));
            conn.reader = null;
        }
    }) 

   socket.on("error", (err: Error) => {
        conn.err = err;

        if(conn.reader) {
            conn.reader.reject(err);
            conn.reader = null
        }
   })
    
    return conn;
} 

function soRead(conn: TCPConn) : Promise<Buffer>{
    console.assert(!conn.reader) //no concurrent calls
    console.log(conn);
    return new Promise((resolve, reject ) => {
        if(conn.err){
            reject(conn.err)
            return;
        }

        if(conn.ended){
            resolve(Buffer.from('')) // EOF
            return;
        }


        conn.reader = {
            resolve: resolve, 
            reject: reject
        }

        //and resume the data event to fulfill the promise later.
        conn.socket.resume()
    })
}

function soWrite(conn:TCPConn, data:Buffer): Promise<void> {
    console.assert(data.length > 0); 
    return new Promise((resolve,reject) => {
        if(conn.err){
            reject(conn.err);
            return;
        }
        conn.socket.write(data, (err?:Error) => {
            if(err){
                reject(err)
            }else {
                resolve();
            }
        })
    }) 
}

async function serveClient(socket: net.Socket): Promise<void> {
    const conn: TCPConn =  soInit(socket);

    //Store the current message that needs to be processed 
    const buf: DynBuf = {
        data: Buffer.alloc(0),
        length: 0
    }

    while(true){
        const msg: null | Buffer = cutMessage(buf);

        if(!msg){
            const data: Buffer = await soRead(conn);
            bufPush(buf,data);

            //EOF?
            if(data.length === 0){
                console.log("connection ended...");
                break;
            }
            continue;
        } 
        if(msg.equals(Buffer.from('quit\n'))){
            await soWrite(conn, Buffer.from('Bye.\n'));
            socket.destroy();
            return
        } else {
            const reply = Buffer.concat([Buffer.from('Echo: '), msg]);
            await soWrite(conn,reply);
        }
    }
}

export {
    serveClient
}