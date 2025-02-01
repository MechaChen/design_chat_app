import { Avatar } from 'antd';
import { Button, List } from 'antd';
import { useState, useEffect } from 'react';

export default function UserRooms({ socket, userEmail }) {

    const [userRooms, setUserRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);

    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('userRooms data ======>', data);

            if (data.action === "get_user_rooms") {
                setUserRooms(data.data);
            }
        };
    }, [socket, userEmail]);

    return (
        <List
            style={{ marginTop: '50px', width: '40%' }}
            bordered
            dataSource={userRooms}
            renderItem={(userRoom) => (
                <List.Item
                    style={{
                        justifyContent: 'flex-start',
                        backgroundColor: selectedRoom?.room_id === userRoom?.room_id ? '#F7EBE1D9' : 'transparent',
                        cursor: 'pointer'
                    }}
                    onClick={() => setSelectedRoom(userRoom)}
                >
                    <Avatar
                        style={{ backgroundColor: '#fde3cf', color: '#f56a00', marginRight: '16px' }}
                    >
                        {userRoom.other_participants.join(',').charAt(0)}
                    </Avatar>
                    {userRoom.other_participants.join(',')}
                </List.Item>
            )}
        />
    );
}
