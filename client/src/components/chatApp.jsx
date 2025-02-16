
import { useState, useEffect, useRef } from 'react';
import { Button, Flex } from 'antd';

import { connectChatRoomSocket } from '../apis/websocket';
import CreateRoom from './createRoom';
import UserRooms from './userRooms';
import ChatRoom from './chatRoom';
import deleteConnection from '../utils/deleteConnection';
import { create_connection } from '../config/socketActions';

export const sharedWorker = new SharedWorker('/shared-worker.js', { type: 'module' });


export default function ChatApp({ userEmail, setUserEmail }) {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isConnectionBuilt, setIsConnectionBuilt] = useState(false);
    const isSocketInit = useRef(false);


    useEffect(() => {
        const connectionPayload = {
            action: "create_connection",
            user_id: userEmail,
        }

        if (!isSocketInit.current) {    
            sharedWorker.port.postMessage(connectionPayload);
        }

        sharedWorker.port.addEventListener('message', (event) => {
            if (event.data.action === create_connection) {
                setIsConnectionBuilt(true);
            }
        })

        sharedWorker.port.start();

        console.log('ChatApp component mounted', sharedWorker);

        isSocketInit.current = true;

        // socket.addEventListener("message", (event) => {
        //     const parsedEvent = JSON.parse(event.data);
        //     console.log('parsedEvent ======>', parsedEvent);

        //     // if websocket disconnects by Apigateway automatically, go back to login page
        //     if (parsedEvent.action === "$disconnect") {
        //         deleteConnection({ socket, userEmail });
        //         setUserEmail(null);
        //     }
        // });

        // socket.onclose = () => {
        //     deleteConnection({ socket, userEmail });
        // }

        // window.addEventListener("beforeunload", () => deleteConnection({ socket, userEmail }));

        // return () => {
        //     deleteConnection({ socket, userEmail });
        //     window.removeEventListener("beforeunload", () => deleteConnection({ socket, userEmail }));
        //     socket.close();
        // };
    }, [userEmail, setUserEmail]);

    // const logout = () => {
    //     deleteConnection({ socket, userEmail });
    //     setUserEmail(null);
    // }

    return isConnectionBuilt && (
        <div>
            <Flex justify="flex-start" align="center">
                <h2 style={{ marginRight: '10px' }}>User: {userEmail}</h2>
                {/* <Button onClick={logout}>Logout</Button> */}
            </Flex>
            <CreateRoom userEmail={userEmail} />
            <Flex justify="space-between" align="flex-start" style={{ marginTop: '50px' }}>
                <UserRooms
                    userEmail={userEmail}
                    selectedRoom={selectedRoom}
                    setSelectedRoom={setSelectedRoom}
                />
                <ChatRoom
                    roomId={selectedRoom?.room_id}
                    selectedRoom={selectedRoom}
                    setSelectedRoom={setSelectedRoom}
                    userEmail={userEmail}
                />
            </Flex>
        </div>
    );
}
