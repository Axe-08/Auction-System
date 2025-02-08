// server/src/server.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { corsOptions } from './config/cors';
import { socketConfig } from './config/socket';
import { SocketHandlers } from './services/socketHandlers';
import authRoutes from './routes/auth';
import crewRoutes from './routes/crew';
import houseRoutes from './routes/house';
import { debugLog } from './utils/debuglogger';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, socketConfig);
const socketHandlers = new SocketHandlers(io);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    debugLog(`${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api', authRoutes);
app.use('/api', crewRoutes);
app.use('/api', houseRoutes);

// Initialize socket handling
io.on('connection', (socket) => {
    socketHandlers.setupHandlers(socket);
});

// Start server
const PORT: number = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

httpServer.listen(PORT, HOST, () => {
    debugLog(`Server started at ${new Date().toISOString()}`);
    debugLog(`Listening on port ${PORT}`);
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});