
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Flex } from 'antd';

import CreateRoom from './createRoom';
import UserRooms from './userRooms';
import ChatRoom from './chatRoom';
import { create_connection } from '../config/socketActions';

// export const sharedWorker = new SharedWorker('/shared-worker.js', { type: 'module' });


export default function ChatApp({ userEmail, setUserEmail }) {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const sharedWorkerRef = useRef(null);

    const isSocketInit = useRef(false);
    const [isSocketConnected, setIsSocketConnected] = useState(false);

    const isConnectionInit = useRef(false);
    const [isConnectionBuilt, setIsConnectionBuilt] = useState(false);

    useEffect(() => {
        const listenSocketConnection = (event) => {
            if (event.data.action === "$connect") {
                setIsSocketConnected(true);
            }
        };

        if (!isSocketInit.current) {
            // NOTE: it's weird that only onmeesage will work
            sharedWorkerRef.current = new SharedWorker('/shared-worker.js', { type: 'module' });
            sharedWorkerRef.current.port.onmessage = listenSocketConnection;
            isSocketInit.current = true;
        }


        return () => {
            sharedWorkerRef.current?.port.removeEventListener("message", listenSocketConnection);
        };
    }, []);

    const deleteUserConnection = useCallback(() => {
        const deleteConnectionPayload = {
            action: "delete_connection",
            user_id: userEmail,
        };
        sharedWorkerRef.current?.port.postMessage(deleteConnectionPayload);
    }, [userEmail]);


    useEffect(() => {
        if (!isSocketConnected) return;


        const connectionPayload = {
            action: "create_connection",
            user_id: userEmail,
        }

        if (!isConnectionInit.current) {    
            sharedWorkerRef.current?.port.postMessage(connectionPayload);
        }

        sharedWorkerRef.current?.port.addEventListener('message', (event) => {
            if (event.data.action === create_connection) {
                setIsConnectionBuilt(true);
            }
        })

        sharedWorkerRef.current?.port.start();


        isConnectionInit.current = true;

        window.addEventListener("beforeunload", deleteUserConnection);

        return () => {
            deleteUserConnection();
            window.removeEventListener("beforeunload", deleteUserConnection);
            sharedWorkerRef.current = null;
        };
    }, [userEmail, setUserEmail, deleteUserConnection, isSocketConnected]);

    const logout = () => {
        deleteUserConnection();
        setUserEmail(null);
        sharedWorkerRef.current = null;
        // NOTE: if want to remove shared worker connection, we need to remove the shared worker instance
        // perhaps we can use useRef to store the shared worker instance, and when user logout, we can set useRef to null
        // window.location.reload();
    }


    return isConnectionBuilt && (
        <div>
            <Flex justify="flex-start" align="center">
                <h2 style={{ marginRight: '10px' }}>User: {userEmail}</h2>
                <Button onClick={logout}>Logout</Button>
            </Flex>
            <CreateRoom userEmail={userEmail} ref={sharedWorkerRef} />
            <Flex justify="space-between" align="flex-start" style={{ marginTop: '50px' }}>
                <UserRooms
                    userEmail={userEmail}
                    selectedRoom={selectedRoom}
                    setSelectedRoom={setSelectedRoom}
                    ref={sharedWorkerRef}
                />
                {selectedRoom && (
                    <ChatRoom
                        roomId={selectedRoom?.room_id}
                        selectedRoom={selectedRoom}
                        setSelectedRoom={setSelectedRoom}
                        userEmail={userEmail}
                        ref={sharedWorkerRef}
                    />
                )}
            </Flex>
        </div>
    );
}
