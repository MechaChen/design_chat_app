import { Card, Input, Skeleton, Upload } from 'antd';
import { useEffect, useRef, useState, forwardRef } from 'react';
import { PlusOutlined } from '@ant-design/icons';

import { getRoomMessages } from '../apis/rooms';
import { create_message } from '../config/socketActions';
import { getDraftMessage, initDB, storeDraftMessage } from '../utils/clientStorage';
import debounce from '../utils/debounde';

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

const ChatRoom = forwardRef(({ roomId, userEmail, selectedRoom }, sharedWorkerRef) => {
    const [value, setValue] = useState('');
    const [messages, setMessages] = useState([]);
    const [isGettingRoomMessages, setIsGettingRoomMessages] = useState(false);
    const messagesEndRef = useRef(null);


    const handleSendMessage = () => {
        const messagePayload = {
            action: create_message,
            message: value,
            room_id: roomId,
            sender: userEmail,
        }

        sharedWorkerRef.current?.port.postMessage(messagePayload);
        setValue('');
    }


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


    // file upload
    const [fileList, setFileList] = useState([]);
    const [draftMessageDB, setDraftMessageDB] = useState(null);
    const initDraftMessage = useRef(false);

    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
        storeDraftMessage(draftMessageDB, { userIdAndRoomId: `${userEmail}_${roomId}`, message: value, fileList: newFileList });
    }

    const saveDraftMessage = (e) => {
        setValue(e.target.value)

        const debouncedSaveDraftMessage = debounce(() => {
            storeDraftMessage(
                draftMessageDB,
                { userIdAndRoomId: `${userEmail}_${roomId}`, message: e.target.value, fileList: fileList });
        }, 500);

        debouncedSaveDraftMessage();
    };

    useEffect(() => {
        initDB().then(setDraftMessageDB);
    }, [value, fileList]);

    useEffect(() => {
        if (!draftMessageDB || initDraftMessage.current) return;
        getDraftMessage(draftMessageDB, { userIdAndRoomId: `${userEmail}_${roomId}` }).then((draftMessage) => {
            setValue(draftMessage.message);
            setFileList(draftMessage.fileList);
            initDraftMessage.current = true;
        });
    }, [draftMessageDB, userEmail, roomId]);


    return (
        <div style={{ width: '58%' }}>
            {roomId && (
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
                            fileList={fileList}
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
                            value={value}
                            onChange={saveDraftMessage}
                            onPressEnter={handleSendMessage}
                        />
                    </Card>
                </>
            )}
        </div>
    );
});

ChatRoom.displayName = 'ChatRoom';

export default ChatRoom;