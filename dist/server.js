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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const net = __importStar(require("net"));
function soInit(socket) {
    const conn = {
        socket: socket, reader: null, ended: false, err: null
    };
    socket.on('data', (data) => {
        console.assert(conn.reader);
        //pause the 'data'event until the next read
        conn.socket.pause();
        //fulfill the promise of the current read.
        conn.reader.resolve(data);
        conn.reader = null;
    });
    socket.on("end", () => {
        //this also fulfills the current read. 
        conn.ended = true;
        if (conn.reader) {
            conn.reader.resolve(Buffer.from(''));
            conn.reader = null;
        }
    });
    socket.on("error", (err) => {
        conn.err = err;
        if (conn.reader) {
            conn.reader.reject(err);
            conn.reader = null;
        }
    });
    return conn;
}
function soRead(conn) {
    console.assert(!conn.reader); //no concurrent calls
    console.log(conn);
    return new Promise((resolve, reject) => {
        if (conn.err) {
            reject(conn.err);
            return;
        }
        if (conn.ended) {
            resolve(Buffer.from('')); // EOF
            return;
        }
        conn.reader = {
            resolve: resolve,
            reject: reject
        };
        //and resume the data event to fulfill the promise later.
        conn.socket.resume();
    });
}
function soWrite(conn, data) {
    console.assert(data.length > 0);
    return new Promise((resolve, reject) => {
        if (conn.err) {
            reject(conn.err);
            return;
        }
        conn.socket.write(data, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
function serveClient(socket) {
    return __awaiter(this, void 0, void 0, function* () {
        const conn = soInit(socket);
        while (true) {
            const data = yield soRead(conn);
            if (data.length === 0) {
                console.log('end connection');
                break;
            }
            console.log('data', data);
            yield soWrite(conn, data);
        }
    });
}
//Creating a tcp server
let server = net.createServer({
    pauseOnConnect: true
});
//Create a callback function that will be executed upon a connection received on the port;
function newConn(socket) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('connection received', socket.remoteAddress, socket.remotePort);
        try {
            yield serveClient(socket);
        }
        catch (error) {
            console.error('exception: ', error);
        }
        finally {
            socket.destroy();
        }
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
