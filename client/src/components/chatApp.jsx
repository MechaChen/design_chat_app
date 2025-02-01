
import { useState, useEffect } from 'react';

import { connectChatRoomSocket } from '../../apis/websocket';
import CreateRoom from './createRoom';
import UserRooms from './userRooms';


export default function ChatApp({ userEmail }) {

    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socket = connectChatRoomSocket();
        setSocket(socket);

        const connectionPayload = {
            action: "create_connection",
            user_id: userEmail,
        }
        const userRoomsPayload = {
            action: "get_user_rooms",
            user_id: userEmail,
        }

        socket.onopen = () => {
            socket.send(JSON.stringify(connectionPayload));
            socket.send(JSON.stringify(userRoomsPayload));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('data ======>', data);
        };

        const handleBeforeUnload = () => {
            if (socket.readyState === WebSocket.OPEN) {
                const deleteConnectionPayload = {
                    action: "delete_connection",
                    user_id: userEmail,
                };
                socket.send(JSON.stringify(deleteConnectionPayload));
                console.log('Disconnected from the chat room...');
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            socket.close();
        };
    }, [userEmail]);

    return (
        <div>
            <CreateRoom userEmail={userEmail} socket={socket} />
            <UserRooms socket={socket} />
        </div>
    );
}
