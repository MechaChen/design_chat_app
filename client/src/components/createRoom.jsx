import { Button, Select, Space, message } from 'antd';
import { useEffect, useState } from 'react';

import { getUsers } from '../../apis/users';
import { connectChatRoomSocket } from '../../apis/websocket';

const CreateRoom = ({ userEmail }) => {
    const [messageApi, contextHolder] = message.useMessage();

    // REST API
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);


    useEffect(() => {
        getUsers().then(setUsers);
    }, []);

    const handleChange = (value) => {
        setSelectedUser(value);
    };

    const userOptions = users
        .filter(user => user.email !== userEmail)
        .map((user) => ({
            value: user.email,
            label: user.email.split('@')[0],
        }));


    // WebSocket
    const [socket, setSocket] = useState(null);

    const createRoom = () => {
        if (socket && selectedUser) {
            const message = JSON.stringify({
                action: "create_room",
                participants: [userEmail, selectedUser],
                created_at: new Date().toISOString(),
            });

            socket.send(message);
            setSelectedUser(null);
        }
    }


    useEffect(() => {
        const socket = connectChatRoomSocket();
        setSocket(socket);

        const connectionPayload = {
            action: "create_connection",
            user_id: userEmail,
        }

        const userRoomsPayload = {
            action: "get_user_rooms",
            user_email: userEmail,
        }

        socket.onopen = () => {
            console.log('socket opened');
            try {
                socket.send(JSON.stringify(connectionPayload));
                socket.send(JSON.stringify(userRoomsPayload));
                messageApi.success('Connected to the chat room successfully');
            } catch (error) {
                console.error('Failed to connect to the server', error);
                messageApi.error('Failed to connect to the server');
            }
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
    }, [messageApi, userEmail]);


    return (
        <>
            {contextHolder}
            <Space size={16}>
                <Select
                    style={{ width: 200 }}
                    value={selectedUser}
                    onChange={handleChange}
                    options={userOptions}
                    placeholder="Select a user"
                />
                <Button
                    type="primary"
                    htmlType="submit"
                    onClick={createRoom}
                    disabled={!selectedUser}
                >
                    Create Room
                </Button>
            </Space>
        </>
    );
};

export default CreateRoom;