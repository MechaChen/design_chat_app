import { Card, Input, Skeleton, Upload } from 'antd';
import { useEffect, useRef, useState, forwardRef, useMemo } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';

import { getRoomMessages } from '../apis/rooms';
import { create_message } from '../config/socketActions';
import { getDraftMessage, initDB, storeDraftMessage } from '../utils/clientStorage';
import debounce from '../utils/debounce';
import messageStatus from '../config/messageStatus';

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

// update message from array data structure to Map

// in-flight message, 
// - auto retry and keep sending time order
// - exponential backoff retry 3 times
// - if failed, make message status as failed
// - if close app, mark it as failed

// success message
// - if message success, find the message in message and mark it as success

// failed message
// - provide retry button in UI
// - store in the indexedDB
// - if new message is send, grab all failed messages and remove from messages list, 
//  add new message to messages list first, then re-add failed messages to the end of the list to have better UX and performance

// const MAX_RETRY_TIMES = 3;

const ChatRoom = forwardRef(({ roomId, userEmail, selectedRoom }, sharedWorkerRef) => {
    const [messages, setMessages] = useState(new Map());
    const [isGettingRoomMessages, setIsGettingRoomMessages] = useState(false);
    const messagesEndRef = useRef(null);


    useEffect(() => {
        const addCurRoomMessageListener = (event) => {
            if (event.data.action === create_message) {

                setMessages(prevMessages => {
                    const newMessages = new Map();
                    Array.from(prevMessages.values()).forEach((message) => {
                        newMessages.set(message.message_id, message);
                    });
                    newMessages.set(event.data.message_id, event.data);

                    return newMessages;
                });
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
                const newMessages = new Map();
                data.data.forEach(message => {
                    newMessages.set(message.message_id, message);
                });
                setMessages(newMessages);
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

    // const retryMessage = (messageId) => {
    //     const message = messages.get(messageId);

    //     // exceed max retry times, set message to failed
    //     if (message.status === messageStatus.inFlight
    //         && message.retryTimes > MAX_RETRY_TIMES
    //     ) {
    //         messages.set(messageId, {
    //             ...message,
    //             status: messageStatus.failed,
    //         });
    //         return;
    //     }

    //     const newRetryTimes = message.retryTimes + 1;
    //     messages.set(messageId, {
    //         ...message,
    //         retryTimes: newRetryTimes,
    //     });

    //     // if within max retry times, retry
    //     if (message.status === messageStatus.inFlight
    //         && message.retryTimes <= MAX_RETRY_TIMES
    //     ) {
    //         setTimeout(() => {
    //             sharedWorkerRef.current?.port.postMessage(message);
    //             retryMessage(messageId);

    //         }, Math.pow(2, newRetryTimes) * 1000);
    //     }
    // }

    const handleSendMessage = () => {
        const newMessagePayload = {
            action: create_message,
            message: draftText,
            message_id: uuidv4(),
            room_id: roomId,
            sender: userEmail,
            status: messageStatus.inFlight,
        }

        sharedWorkerRef.current?.port.postMessage(newMessagePayload);
        // retryMessage(newMessagePayload.message_id);
        setDraftText('');

        setMessages(prevMessages => {
            const newMessages = new Map(prevMessages);
            newMessages.set(newMessagePayload.message_id, newMessagePayload);
            return newMessages;
        });
    }

    const handleFileChange = ({ fileList: newFileList }) => {
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

    const messageArray = useMemo(() => Array.from(messages.values()), [messages]);

    return (
        <div style={{ width: '58%' }}>
            <>
                <Card style={{ marginBottom: '10px', height: '500px', overflowY: 'auto' }}>
                    {isGettingRoomMessages ? <Skeleton active /> : messageArray.map((message) => {
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