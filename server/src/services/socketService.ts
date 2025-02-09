import { Server } from 'socket.io';

let io: Server;

export const initializeSocket = (socketIo: Server) => {
    console.log('Socket.IO initialized');
    io = socketIo;
};

export const getIO = () => {
    if (!io) {
        console.error('Socket.IO not initialized');
        throw new Error('Socket.io not initialized');
    }
    console.log('Socket.IO instance retrieved');
    return io;
};