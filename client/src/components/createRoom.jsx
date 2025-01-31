import { Button, Select, Space } from 'antd';
import { getUsers } from '../../apis/users';
import { useEffect, useState } from 'react';

const CreateRoom = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const users = await getUsers();
                setUsers(users);
            } catch (err) {
                console.error(err);
            }
        }

        fetchUsers();
    }, []);

    const handleChange = (value) => {
        console.log(`selected ${value}`);
    };

    const userOptions = users.map((user) => ({
        value: user.email,
        label: user.email.split('@')[0],
    }));


    return (
        <Space size={16}>
            <Select
                style={{ width: 200 }}
                onChange={handleChange}
                options={userOptions}
                placeholder="Select a user"
            />
            <Button type="primary" htmlType="submit">
                Create Room
            </Button>
        </Space>
    );
};

export default CreateRoom;