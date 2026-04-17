import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

const getUserToken = () => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        return JSON.parse(userInfo).token;
    }
    return null;
};

export const socket = io(URL, {
    auth: {
        token: getUserToken()
    },
    autoConnect: false // Connect manually when needed
});
