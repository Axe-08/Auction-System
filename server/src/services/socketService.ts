import { Server, Socket } from 'socket.io';
import { debugLog } from '../utils/debuglogger';

let io: Server;
const connectedClients = new Map<string, { houseId?: number; lastActivity: Date }>();

export const initializeSocket = (socketIo: Server) => {
    debugLog('Initializing Socket.IO');
    io = socketIo;

    // Set up heartbeat
    setInterval(() => {
        io.emit('heartbeat', { timestamp: Date.now() });
    }, 30000);

    // Clean up stale connections
    setInterval(() => {
        const now = Date.now();
        connectedClients.forEach((client, socketId) => {
            if (now - client.lastActivity.getTime() > 60000) { // 1 minute timeout
                const socket = io.sockets.sockets.get(socketId);
                if (socket) {
                    debugLog(`Closing stale connection: ${socketId}`);
                    socket.disconnect(true);
                }
                connectedClients.delete(socketId);
            }
        });
    }, 30000);

    io.on('connection', handleConnection);
};

const handleConnection = (socket: Socket) => {
    debugLog(`New client connected: ${socket.id}`);
    connectedClients.set(socket.id, { lastActivity: new Date() });

    socket.on('disconnect', () => {
        debugLog(`Client disconnected: ${socket.id}`);
        connectedClients.delete(socket.id);
    });

    socket.on('heartbeat-response', () => {
        const client = connectedClients.get(socket.id);
        if (client) {
            client.lastActivity = new Date();
        }
    });
};

export const emitWithRetry = async (event: string, data: any, retries = 3) => {
    if (!io) {
        debugLog('Socket.IO not initialized, cannot emit event');
        return false;
    }

    let attempt = 0;
    while (attempt < retries) {
        try {
            debugLog(`Emitting ${event} (attempt ${attempt + 1}/${retries})`);
            const connectedSockets = await io.fetchSockets();
            if (connectedSockets.length === 0) {
                debugLog('No connected sockets');
                attempt++;
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }

            io.emit(event, data);
            debugLog(`Successfully emitted ${event}`);
            return true;
        } catch (error) {
            debugLog(`Error emitting ${event}: ${error}`);
            attempt++;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    debugLog(`Failed to emit ${event} after ${retries} attempts`);
    return false;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};