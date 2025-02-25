import { Card, Input, Skeleton, Upload } from 'antd';
import { useEffect, useRef, useState, forwardRef } from 'react';
import { PlusOutlined } from '@ant-design/icons';

import { getRoomMessages } from '../apis/rooms';
import { create_message } from '../config/socketActions';
import { getDraftMessage, initDB, storeDraftMessage } from '../utils/clientStorage';
import debounce from '../utils/debounce';

const Message = ({ children, isUser }) => {
    return (
        <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
            <Card
                style={{
                    display: 'inline-block',
                    padding: '5px 10px',
                    borderColor: isUser ? '#91caff' : '#f0f2f5',

                }}
                styles={{
                    body: { padding: 0 }
                }}
            >
                {children}
            </Card>
        </div>
    );
};

const UploadButton = () => {
    return (
        <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );
}

const draftMessageChannel = new BroadcastChannel('draftMessageChannel');

const defaultDraftText = '';
const defaultDraftFileList = [];

const ChatRoom = forwardRef(({ roomId, userEmail, selectedRoom }, sharedWorkerRef) => {
    const [messages, setMessages] = useState([]);
    const [isGettingRoomMessages, setIsGettingRoomMessages] = useState(false);
    const messagesEndRef = useRef(null);


    useEffect(() => {
        const addCurRoomMessageListener = (event) => {
            if (event.data.action === create_message) {
                setMessages(prevMessages => [...prevMessages, event.data]);
            }
        }

        sharedWorkerRef.current?.port.addEventListener("message", addCurRoomMessageListener);

        return () => {
            // prevent event listener being added twice
            sharedWorkerRef.current?.port.removeEventListener("message", addCurRoomMessageListener);
        }
    }, [roomId, sharedWorkerRef]);

    useEffect(() => {
        if (selectedRoom) {
            setIsGettingRoomMessages(true);
            getRoomMessages(selectedRoom.room_id).then((data) => {
                setMessages(data.data);
                setIsGettingRoomMessages(false);
            });
        }
    }, [selectedRoom]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);


    // draft message
    const [draftText, setDraftText] = useState(defaultDraftText);
    const [draftFileList, setDraftFileList] = useState(defaultDraftFileList);
    const draftMessageDBRef = useRef(null);

    const handleSendMessage = () => {
        const messagePayload = {
            action: create_message,
            message: draftText,
            room_id: roomId,
            sender: userEmail,
        }

        sharedWorkerRef.current?.port.postMessage(messagePayload);
        setDraftText('');
    }

    const handleFileChange = ({ fileList: newFileList }) => {
        console.log({ newFileList });

        draftMessageChannel.postMessage({
            type: 'updateDraftFileList',
            userIdAndRoomId: `${userEmail}_${roomId}`,
            fileList: newFileList
        });
        setDraftFileList(newFileList);
        storeDraftMessage(draftMessageDBRef.current, { userIdAndRoomId: `${userEmail}_${roomId}`, message: draftText, fileList: newFileList });
    }

    const saveDraftMessage = (e) => {
        draftMessageChannel.postMessage({
            type: 'updateDraftText',
            userIdAndRoomId: `${userEmail}_${roomId}`,
            message: e.target.value,
        });
        setDraftText(e.target.value)

        const debouncedSaveDraftMessage = debounce(() => {
            storeDraftMessage(
                draftMessageDBRef.current,
                { userIdAndRoomId: `${userEmail}_${roomId}`, message: e.target.value, fileList: draftFileList });
        }, 500);

        debouncedSaveDraftMessage();
    };

    useEffect(() => {
        const updateDraftMessage = (event) => {
            const userIdAndRoomId = event.data.userIdAndRoomId;

            console.log({ userIdAndRoomId, userEmail, roomId });

            if (event.data.type === 'updateDraftText' && userIdAndRoomId === `${userEmail}_${roomId}`) {
                setDraftText(() => event.data.message);
            } 
            
            if (event.data.type === 'updateDraftFileList' && userIdAndRoomId === `${userEmail}_${roomId}`) {
                setDraftFileList(event.data.fileList);
            }
        }


        draftMessageChannel.onmessage = updateDraftMessage;

        return () => {
            draftMessageChannel.onmessage = null;
        }
    }, [roomId, userEmail]);

    useEffect(() => {
        async function getRoomDraftMessage() {
            draftMessageDBRef.current = await initDB();
            const draftMessage = await getDraftMessage(draftMessageDBRef.current, { userIdAndRoomId: `${userEmail}_${roomId}` });
            setDraftText(draftMessage?.message || defaultDraftText);
            setDraftFileList(draftMessage?.fileList || defaultDraftFileList);
        }

        getRoomDraftMessage();
    }, [roomId, userEmail]);



    return (
        <div style={{ width: '58%' }}>
            <>
                <Card style={{ marginBottom: '10px', height: '500px', overflowY: 'auto' }}>
                    {isGettingRoomMessages ? <Skeleton active /> : messages.map((message) => {
                        const isUser = message.sender === userEmail;
                        return (
                            <div key={message.message_id} style={{ paddingBottom: '10px' }}>
                                {!isUser && (<div style={{ fontSize: '12px', color: '#888' }}>
                                    {message.sender.split('@')[0]}
                                </div>)}

                                <Message
                                    key={message.message_id}
                                    isUser={isUser}
                                    message={message}
                                >
                                    {message.message}
                                </Message>
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </Card>
                <Card styles={{ body: { paddingTop: 10, paddingBottom: 10 } }}>
                    <Upload
                        listType="picture-card"
                        fileList={draftFileList}
                        onChange={handleFileChange}
                        customRequest={({ onSuccess }) => {
                            onSuccess('upload successfully');
                        }}
                    >
                    <UploadButton />
                    </Upload>
                    <Input
                        style={{ paddingTop: '20px', paddingLeft: 0 }}
                        variant="borderless"
                        disabled={isGettingRoomMessages}
                        placeholder="Your message"
                        value={draftText}
                        onChange={saveDraftMessage}
                        onPressEnter={handleSendMessage}
                    />
                </Card>
            </>
        </div>
    );
});

ChatRoom.displayName = 'ChatRoom';

export default ChatRoom;