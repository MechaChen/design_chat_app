import { Button, Select, Space } from 'antd';
import { useEffect, useState, forwardRef } from 'react';

import { getUsers } from '../apis/users';
import { create_room } from '../config/socketActions';

const CreateRoom = forwardRef(function CreateRoom({ userEmail }, sharedWorkerRef) {

    // REST API
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState([]);


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
    const createRoom = () => {
        if (selectedUser.length > 0) {

            const createRoomPayload = {
                action: create_room,
                participants: [userEmail, ...selectedUser],
                created_at: new Date().toISOString(),
            };

            sharedWorkerRef.current?.port.postMessage(createRoomPayload);
            setSelectedUser(null);
        }
    }

    return (
        <>
            <Space size={16}>
                <Select
                    mode="multiple"
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
});

export default CreateRoom;