import * as net from 'net';

//Creating a tcp server
let server = net.createServer();

//Create a callback function that will be executed upon a connection received on the port;
function newConn(socket: net.Socket): void{
    console.log('connection received', socket.remoteAddress, socket.remotePort);

    //socket on data received
    socket.on("data", (data) => { 
        console.log("data received includes the following: ", data)

        //Write back to the socket
        socket.write(data.toString('utf-8'));


        
        if(data.includes('q')) {
            console.log('closing connection');
            socket.end() // Will send FIN and close the connection
        }
    })

    socket.on("end", () => {
        console.log("EOF") 
    })
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
