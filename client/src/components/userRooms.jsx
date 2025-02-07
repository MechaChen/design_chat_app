import { Avatar } from 'antd';
import { List } from 'antd';
import { useState, useEffect } from 'react';

export default function UserRooms({ socket, userEmail, selectedRoom, setSelectedRoom }) {

    const [userRooms, setUserRooms] = useState([]);

    useEffect(() => {
        if (!socket) return;

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('userRooms data ======>', data);

            if (data.action === "create_room") {
                const userRoomsPayload = {
                    action: "get_user_rooms",
                    user_id: userEmail,
                }
                socket.send(JSON.stringify(userRoomsPayload));
            }

            if (data.action === "get_user_rooms") {
                setUserRooms(data.data);
            }
        };
    }, [socket, userEmail]);

    return (
        <List
            style={{ width: '40%' }}
            bordered
            dataSource={userRooms}
            renderItem={(userRoom) => (
                <List.Item
                    style={{
                        justifyContent: 'flex-start',
                        backgroundColor: selectedRoom?.room_id === userRoom?.room_id ? '#e6f4ff' : 'transparent',
                        cursor: 'pointer'
                    }}
                    onClick={() => setSelectedRoom(userRoom)}
                >
                    <Avatar
                        style={{ backgroundColor: '#91caff', color: '#000', marginRight: '16px' }}
                    >
                        {userRoom.other_participants.join(',').charAt(0)}
                    </Avatar>
                    {userRoom.other_participants.join(',')}
                </List.Item>
            )}
        />
    );
}
