
import { useState, useEffect } from 'react';

import { connectChatRoomSocket } from '../../apis/websocket';
import CreateRoom from './createRoom';
import UserRooms from './userRooms';
import { Button, Flex } from 'antd';


export default function ChatApp({ userEmail, setUserEmail }) {

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
            const parsedEvent = JSON.parse(event);
            console.log('parsedEvent ======>', parsedEvent);

            // if websocket disconnects by Apigateway automatically, go back to login page
            if (parsedEvent.action === "$disconnect") {
                setUserEmail(null);
            }
        };

        const deleteConnection = () => {
            if (socket.readyState === WebSocket.OPEN) {
                const deleteConnectionPayload = {
                    action: "delete_connection",
                    user_id: userEmail,
                };
                socket.send(JSON.stringify(deleteConnectionPayload));
                console.log('Disconnected from the chat room......');
            }
        };

        window.addEventListener("beforeunload", deleteConnection);

        return () => {
            deleteConnection();
            window.removeEventListener("beforeunload", deleteConnection);
            socket.close();
        };
    }, [userEmail, setUserEmail]);

    return (
        <div>
            <Flex justify="flex-start" align="center">
                <h2 style={{ marginRight: '10px' }}>User: {userEmail}</h2>
                <Button onClick={() => setUserEmail(null)}>Logout</Button>
            </Flex>
            <CreateRoom userEmail={userEmail} socket={socket} />
            <UserRooms userEmail={userEmail} socket={socket} />
        </div>
    );
}
