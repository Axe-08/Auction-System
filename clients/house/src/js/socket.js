// clients/house/src/js/socket.js
class SocketManager {
    static socket = null;
    static reconnectAttempts = 0;
    static maxReconnectAttempts = 5;
    static reconnectDelay = 1000;
    static pendingEvents = [];

    static initialize(accessCode) {
        if (this.socket) {
            this.socket.disconnect();
        }

        this.socket = io(config.API_URL, {
            ...config.SOCKET_OPTIONS,
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: this.reconnectDelay,
            timeout: 10000
        });

        this.setupListeners(accessCode);
        this.startHeartbeat();
    }

    static startHeartbeat() {
        setInterval(() => {
            if (this.socket && this.socket.connected) {
                this.socket.emit('heartbeat-response');
            }
        }, 30000);
    }
    static setupListeners(accessCode) {
        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.socket.emit('authenticate', accessCode);

                // Process any pending events
                while (this.pendingEvents.length > 0) {
                    const { event, data } = this.pendingEvents.shift();
                    this.socket.emit(event, data);
                }
        });
        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.handleConnectionError();
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            if (reason === 'io server disconnect') {
                // Server disconnected us, try to reconnect
                this.reconnect();
            }
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.handleConnectionError();
        });
    
        this.socket.on('sale_complete', this.handleSaleComplete.bind(this));
        this.socket.on('house_budget_updated', this.handleBudgetUpdate.bind(this));

        this.socket.on('heartbeat', () => {
            if (this.socket.connected) {
                this.socket.emit('heartbeat-response');
            }
        });
    }

    static handleConnectionError() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => this.reconnect(), 
                this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
        } else {
            console.error('Max reconnection attempts reached');
            Auth.showError('Connection lost. Please refresh the page.');
        }
    }

    static reconnect() {
        if (!this.socket || !this.socket.connected) {
            console.log('Attempting to reconnect...');
            this.socket.connect();
        }
    }

    static emitWithRetry(event, data, maxRetries = 3) {
        return new Promise((resolve, reject) => {
            let attempts = 0;

            const tryEmit = () => {
                if (!this.socket || !this.socket.connected) {
                    this.pendingEvents.push({ event, data });
                    resolve(false);
                    return;
                }

                this.socket.emit(event, data, (response) => {
                    if (response && response.success) {
                        resolve(true);
                    } else if (attempts < maxRetries) {
                        attempts++;
                        setTimeout(tryEmit, 1000);
                    } else {
                        reject(new Error('Failed to emit event'));
                    }
                });
            };

            tryEmit();
        });
    }

    static async handleSaleComplete(data) {
        console.log('Received sale_complete event:', data);
        try {
            await State.loadCatalogue();
            
            if (data.productionHouseId === State.houseData?.houseId) {
                await State.loadPurchasedCrew();
            }
            // Load updated stats after any sale
            await State.loadHouseStats();
        } catch (error) {
            console.error('Error handling sale complete:', error);
        }
    }

    static async retryOperation(operation, maxRetries = 3) {
        let attempts = 0;
        while (attempts < maxRetries) {
            try {
                await operation();
                return;
            } catch (error) {
                attempts++;
                if (attempts === maxRetries) {
                    console.error('Operation failed after max retries');
                    Auth.showError('Failed to update data. Please refresh.');
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
                }
            }
        }
    }

    static async handleBudgetUpdate(data) {
        try {
            console.log('Received budget update:', data);
            if (data.houseId === State.houseData?.houseId) {
                console.log('Updating budget for current house:', data.budget);
                State.houseData.budget = data.budget;
                await State.loadPurchasedCrew();
                Dashboard.updateHouseInfo();
                CatalogueManager.updateCatalogue();
            }
        } catch (error) {
            console.error('Error handling budget update:', error);
            await this.retryOperation(() => State.loadPurchasedCrew());
        }
    }

    static disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}