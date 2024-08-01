"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const net = __importStar(require("net"));
//Creating a tcp server
let server = net.createServer();
//Create a callback function that will be executed upon a connection received on the port;
function newConn(socket) {
    console.log('connection received', socket.remoteAddress, socket.remotePort);
    //socket on data received
    socket.on("data", (data) => {
        console.log("data received includes the following: ", data);
        //Write back to the socket
        socket.write(data.toString('utf-8'));
        if (data.includes('q')) {
            console.log('closing connection');
            socket.end(); // Will send FIN and close the connection
        }
    });
    socket.on("end", () => {
        console.log("EOF");
    });
}
server.on('connection', newConn);
//Error event listener
server.on('error', (err) => { throw err; });
// server.on('data', )
//Initializing a listening event
server.listen({
    host: '127.0.0.1',
    port: 8000
}, () => {
    console.log("Server listening");
});
