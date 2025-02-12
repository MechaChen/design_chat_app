
import { useState, useEffect } from 'react';
import { Button, Flex } from 'antd';

import { connectChatRoomSocket } from '../apis/websocket';
import CreateRoom from './createRoom';
import UserRooms from './userRooms';
import ChatRoom from './chatRoom';
import deleteConnection from '../utils/deleteConnection';


export default function ChatApp({ userEmail, setUserEmail }) {
    const [socket, setSocket] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);


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

        socket.addEventListener("message", (event) => {
            const parsedEvent = JSON.parse(event.data);
            console.log('parsedEvent ======>', parsedEvent);

            // if websocket disconnects by Apigateway automatically, go back to login page
            if (parsedEvent.action === "$disconnect") {
                deleteConnection({ socket, userEmail });
                setUserEmail(null);
            }
        });

        socket.onclose = () => {
            deleteConnection({ socket, userEmail });
        }

        window.addEventListener("beforeunload", () => deleteConnection({ socket, userEmail }));

        return () => {
            deleteConnection({ socket, userEmail });
            window.removeEventListener("beforeunload", () => deleteConnection({ socket, userEmail }));
            socket.close();
        };
    }, [userEmail, setUserEmail]);

    const logout = () => {
        deleteConnection({ socket, userEmail });
        setUserEmail(null);
    }

    return (
        <div>
            <Flex justify="flex-start" align="center">
                <h2 style={{ marginRight: '10px' }}>User: {userEmail}</h2>
                <Button onClick={logout}>Logout</Button>
            </Flex>
            <CreateRoom userEmail={userEmail} socket={socket} />
            <Flex justify="space-between" align="flex-start" style={{ marginTop: '50px' }}>
                <UserRooms
                    userEmail={userEmail}
                    socket={socket}
                    selectedRoom={selectedRoom}
                    setSelectedRoom={setSelectedRoom}
                />
                <ChatRoom
                    roomId={selectedRoom?.room_id}
                    selectedRoom={selectedRoom}
                    setSelectedRoom={setSelectedRoom}
                    socket={socket}
                    userEmail={userEmail}
                />
            </Flex>
        </div>
    );
}
