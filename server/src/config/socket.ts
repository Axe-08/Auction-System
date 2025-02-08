// server/src/config/socket.ts
import { ServerOptions } from 'socket.io';
import { ConnectedClient } from '../types';



export const socketConfig: Partial<ServerOptions> = {
    cors: {
        origin: [
            'https://axe-08.github.io',
            'http://localhost:8080',
            'http://localhost:8081',
            'http://192.168.56.1:8080',
            'http://192.168.56.1:8081'
        ],
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'] as ['websocket', 'polling']
};

export const socketHouses = new Map<string, number>();
export const connectedClients: Map<string, ConnectedClient> = new Map();
