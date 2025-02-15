import { connectChatRoomSocket } from "../src/apis/websocket";
import { create_connection, get_user_rooms, create_message, disconnect } from "../src/config/socketActions";

let socket = null;
const connections = [];


onconnect = (event) => {
    const port = event.ports[0];
    connections.push(port);

    
    port.onmessage = (event) => {

        if (event.data.type === 'initSocket' && !socket) {
            socket = connectChatRoomSocket();

            socket.onopen = () => {
                const { socketPayload } = event.data;

                socket.send(JSON.stringify(socketPayload));
                // socket.send(JSON.stringify(userRoomsPayload));
            }


            socket.onmessage = (event) => {
                console.log('Socket ---> Shared worker', event, new Date().toISOString());
                connections.forEach(port => {
                    port.postMessage(JSON.parse(event.data));
                });
            }
        } else {
            console.log('Port ---> Shared worker', event, new Date().toISOString());
            const { socketPayload } = event.data;
            socket.send(JSON.stringify(socketPayload));
        }

    }

    // port.start();
}