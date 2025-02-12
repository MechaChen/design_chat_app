const deleteConnection = ({
    socket,
    userEmail,
}) => {
    if (socket.readyState === WebSocket.OPEN) {
        const deleteConnectionPayload = {
            action: "delete_connection",
            user_id: userEmail,
        };
        socket.send(JSON.stringify(deleteConnectionPayload));
        console.log('Disconnected from the chat room......');
    }
};

export default deleteConnection;