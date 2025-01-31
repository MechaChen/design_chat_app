import { Button, Select, Space } from 'antd';
import { getUsers } from '../../apis/users';
import { useEffect, useState } from 'react';

const CreateRoom = ({ userEmail }) => {
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
        const socket = new WebSocket('wss://b8zmy3ss44.execute-api.us-east-1.amazonaws.com/production/');
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
            socket.send(JSON.stringify(connectionPayload));
            socket.send(JSON.stringify(userRoomsPayload));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('data ======>', data);
        };

        return () => {
            socket.close();
        };
    }, [userEmail]);


    return (
        <Space size={16}>
            <Select
                style={{ width: 200 }}
                value={selectedUser}
                onChange={handleChange}
                options={userOptions}
                placeholder="Select a user"
            />
            <Button type="primary" htmlType="submit" onClick={createRoom} disabled={!selectedUser}>
                Create Room
            </Button>
        </Space>
    );
};

export default CreateRoom;