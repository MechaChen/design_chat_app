const endpoint = 'wss://b8zmy3ss44.execute-api.us-east-1.amazonaws.com/production/'

export const connectChatRoomSocket = () => {
    return new WebSocket(endpoint);
}