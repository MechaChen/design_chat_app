import { Card, Alert } from 'antd';

const ChatBubble = ({ children, isUser }) => {
    return (
        <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
            <Card 
                style={{
                    display: 'inline-block',
                    padding: '5px 10px',
                    marginBottom: '10px',
                    borderColor: isUser ? '#91caff' : '#f0f2f5',
                }}
                bodyStyle={{ padding: 0 }}
            >
                {children}
            </Card>
        </div>
    );
};

const ChatRoom = ({ roomId, selectedRoom, setSelectedRoom }) => {
    return (
        <Card style={{ width: '58%' }}>
            <ChatBubble isUser={true}>Hello</ChatBubble>
            <ChatBubble isUser={false}>Hello</ChatBubble>
        </Card>
    );
};

export default ChatRoom;