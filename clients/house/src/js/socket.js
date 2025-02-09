// clients/house/src/js/socket.js
class SocketManager {
    static socket = null;

    static initialize(accessCode) {
        if (this.socket) {
            this.socket.disconnect();
        }
        const WS_URL = config.API_URL.replace(/^https/, "wss");
        this.socket = io(WS_URL, config.SOCKET_OPTIONS);
        this.setupListeners(accessCode);
    }
    static setupListeners(accessCode) {
        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.socket.emit('authenticate', accessCode);
        });

        this.socket.on('auth_success', (data) => {
            console.log('Authentication successful:', data);
            State.houseData = {
                houseId: data.houseId,
                houseName: data.houseName,
                budget: 1000000000
            };
            Dashboard.updateHouseInfo();
        });

        this.socket.on('auth_error', (error) => {
            console.error('Authentication error:', error);
            Auth.showError(error);
        });

        this.socket.on('bid_update', (data) => {
            console.log('Bid update received:', data);
            CatalogueManager.updateBid(data);
        });

        this.socket.on('house_budget_updated', async (data) => {
            console.log('Budget update received:', data);
            if (data.houseId === State.houseData?.houseId) {
                // Update budget in state
                State.houseData.budget = data.budget;
                await State.loadPurchasedCrew();
                Dashboard.updateHouseInfo();
                CatalogueManager.updateCatalogue();
            }
        });
        this.socket.on('sale_complete', async (data) => {
            console.log('Sale complete:', data);
            if (data.productionHouseId === State.houseData?.houseId) {
                await State.loadPurchasedCrew(); // Reload crew data
            }
            await State.loadCatalogue(); // Refresh catalogue regardless of buyer
        });
    }

    static disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}