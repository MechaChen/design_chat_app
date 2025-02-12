import axios from "axios";

const apiPrefix = 'https://29nf737bue.execute-api.us-east-1.amazonaws.com/dev'

export const getRoomMessages = async (roomId) => {
    const response = await axios.get(`${apiPrefix}/rooms/${roomId}/messages`);
    return response.data;
};