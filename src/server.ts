import * as net from 'net';

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

    while(true){
        const data = await soRead(conn);
        if(data.length === 0){
            console.log('end connection'); 
            break;
        }

        console.log('data', data);
        await soWrite(conn, data)
    }
}

//Creating a tcp server
let server = net.createServer({
    pauseOnConnect: true
});

//Create a callback function that will be executed upon a connection received on the port;
 async function newConn(socket: net.Socket): Promise<void>{
    console.log('connection received', socket.remoteAddress, socket.remotePort);

    try {
       await serveClient(socket) 
    } catch (error) {
        console.error('exception: ', error)
    } finally{
        socket.destroy();
    }

}

server.on('connection', newConn);


//Error event listener
server.on('error', (err: Error) => { throw err;});

// server.on('data', )

//Initializing a listening event
server.listen({
    host: '127.0.0.1',
    port: 8000
}, () => {
    console.log("Server listening")
})
