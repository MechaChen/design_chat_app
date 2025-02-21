
const endpoint = 'wss://b8zmy3ss44.execute-api.us-east-1.amazonaws.com/production/'

const connectChatRoomSocket = (port) => {
    const socket = new WebSocket(endpoint);

    socket.onopen = () => {
        port.postMessage({ action: "$connect" });
    }

    socket.onmessage = (event) => {
        connections.forEach(port => {
            port.postMessage(JSON.parse(event.data));
        });
    }

    return socket;
}

let socket
let connections = [];


self.onconnect = (event) => {
    const port = event.ports[0];
    connections.push(port);

    console.log('connections =====>', connections);

    if (!socket) {
        socket = connectChatRoomSocket(port);
    } else {
        port.postMessage({ action: "$connect" });
    }

    port.onmessage = (event) => {
        if (event.data.action === "delete_connection") {
            connections = connections.filter(connection => connection !== port);

            if (connections.length === 0) {
                console.log('socket.send =====>', socket);
                console.log('connections =====>', connections);
                socket.send(JSON.stringify(event.data));
                socket.close();
                socket = null;
            }
        } else {
            socket.send(JSON.stringify(event.data));
        }
    }
}