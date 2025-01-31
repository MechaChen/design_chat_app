import axios from 'axios';

const apiPrefix = 'https://29nf737bue.execute-api.us-east-1.amazonaws.com/dev'

export const createUser = async (email) => {
    const response = await axios.post(`${apiPrefix}/chat-room-user`, { email });
    return response.data;
};

export const getUsers = async () => {
    const response = await axios.get(`${apiPrefix}/chat-room-user`);
    return response.data;
};