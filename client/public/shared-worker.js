import { connectChatRoomSocket } from "../src/apis/websocket";

const socket = connectChatRoomSocket();
const connections = [];

socket.onmessage = (event) => {
    console.log('Socket ---> Shared worker', event, new Date().toISOString());
    connections.forEach(port => {
        port.postMessage(JSON.parse(event.data));
    });
}


self.onconnect = (event) => {
    const port = event.ports[0];
    connections.push(port);
    
    port.onmessage = (event) => {
        console.log('Port ---> Shared worker', event, new Date().toISOString());
        socket.send(JSON.stringify(event.data));
    }
}