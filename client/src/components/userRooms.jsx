import { Avatar, Flex } from 'antd';
import { List } from 'antd';
import { useState, useEffect, useRef } from 'react';

import { sharedWorker } from './chatApp';
import { create_room, get_user_rooms } from '../config/socketActions';

export default function UserRooms({ userEmail, selectedRoom, setSelectedRoom }) {

    const [userRooms, setUserRooms] = useState([]);
    const isUserRoomsInit = useRef(false);

    useEffect(() => {
        if (isUserRoomsInit.current) return;

        const userRoomsPayload = {
            action: get_user_rooms,
            user_id: userEmail,
        }

        //  initial get user rooms
        sharedWorker.port.postMessage(userRoomsPayload);

        sharedWorker.port.addEventListener('message', (event) => {
            console.log('Shared worker ---> UserRooms', event);

            if (event.data.action === get_user_rooms) {
                setUserRooms(event.data.data);
            }

            if (event.data.action === create_room) {
                sharedWorker.port.postMessage(userRoomsPayload);
            }
        })

        sharedWorker.port.start();

        isUserRoomsInit.current = true;
    }, [userEmail]);

    return (
        <List
            style={{ width: '40%' }}
            bordered
            dataSource={userRooms}
            renderItem={(userRoom) => (
                <List.Item
                    style={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        backgroundColor: selectedRoom?.room_id === userRoom?.room_id ? '#e6f4ff' : 'transparent',
                        cursor: 'pointer'
                    }}
                    onClick={() => setSelectedRoom(userRoom)}
                >
                    {userRoom.other_participants.map((participant, index) => (
                        <Flex key={participant} align="center" style={{ paddingTop: index === 0 ? '0px' : '8px', cursor: 'pointer' }}>
                            <Avatar
                                style={{ backgroundColor: '#91caff', color: '#000', marginRight: '8px' }}
                            >
                                {participant.charAt(0)}
                            </Avatar>
                            {participant}
                        </Flex>
                    ))}
                </List.Item>
            )}
        />
    );
}
