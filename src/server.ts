import * as net from 'net';
import { TCPConn } from './types/server.types';
import { serveClient } from './utils/server.utils';



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
