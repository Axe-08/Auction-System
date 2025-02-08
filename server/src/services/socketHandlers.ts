// server/src/services/socketHandlers.ts
import { Server, Socket } from 'socket.io';
import { socketHouses, connectedClients } from '../config/socket';
import db from '../config/database';
import { ProductionHouseWithBudget } from '../types';
import { debugLog } from '../utils/debuglogger';

export class SocketHandlers {
    constructor(private io: Server) {}

    setupHandlers(socket: Socket) {
        this.handleAuthentication(socket);
        this.handleDisconnect(socket);
        this.handleBudgetUpdate(socket);
        this.handleBidUpdate(socket);
    }

    private handleAuthentication(socket: Socket) {
        socket.on('authenticate', (accessCode: string) => {
            db.get(
                "SELECT id, name FROM production_houses WHERE access_code = ?",
                [accessCode],
                (err, house: ProductionHouseWithBudget | undefined) => {
                    if (err || !house) {
                        socket.emit('auth_error', 'Invalid access code');
                        return;
                    }

                    // Store house ID for this socket
                    socketHouses.set(socket.id, house.id);

                    // Count connections for this house
                    const houseConnections = Array.from(socketHouses.values())
                        .filter(id => id === house.id).length;

                    debugLog(`Production House ${house.name} has ${houseConnections} active connections`);

                    socket.emit('auth_success', {
                        houseId: house.id,
                        houseName: house.name,
                        activeConnections: houseConnections
                    });

                    // Add to connected clients
                    connectedClients.set(socket.id, {
                        productionHouseId: house.id,
                        connectionTime: new Date(),
                        lastActivity: new Date()
                    });
                }
            );
        });
    }

    private handleDisconnect(socket: Socket) {
        socket.on('disconnect', () => {
            const houseId = socketHouses.get(socket.id);
            socketHouses.delete(socket.id);
            connectedClients.delete(socket.id);

            if (houseId) {
                const houseConnections = Array.from(socketHouses.values())
                    .filter(id => id === houseId).length;
                debugLog(`Production House ${houseId} now has ${houseConnections} active connections`);
            }
            debugLog(`Client disconnected (ID: ${socket.id})`);
            debugLog(`Total connections: ${socketHouses.size}`);
        });
    }

    private handleBudgetUpdate(socket: Socket) {
        socket.on('budget_update', (houseId: number) => {
            db.get(
                "SELECT id, name, budget FROM production_houses WHERE id = ?",
                [houseId],
                (err, house: ProductionHouseWithBudget | undefined) => {
                    if (err || !house) return;
                    this.io.emit('house_budget_updated', {
                        houseId: house.id,
                        budget: house.budget
                    });
                }
            );
        });
    }

    private handleBidUpdate(socket: Socket) {
        socket.on('bid_update', (data: { crewId: number; newBid: number }) => {
            const { crewId, newBid } = data;
            db.run(
                "UPDATE crew_members SET current_bid = ? WHERE id = ? AND status != 'sold'",
                [newBid, crewId],
                (err) => {
                    if (err) {
                        debugLog('Error updating bid: ' + err.message);
                        return;
                    }
                    this.io.emit('bid_updated', { crewId, newBid });
                }
            );
        });
    }
}