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
    
        this.socket.on('sale_complete', async (data) => {
            console.log('Received sale_complete event:', data);
            try {
                console.log('Starting catalogue reload');
                await State.loadCatalogue();
                console.log('Catalogue reloaded');
                
                if (data.productionHouseId === State.houseData?.houseId) {
                    console.log('This house was the buyer, updating purchased crew');
                    await State.loadPurchasedCrew();
                    console.log('Purchased crew updated');
                    Dashboard.updateHouseInfo();
                    Dashboard.updateStatsAndRequirements();
                }
            } catch (error) {
                console.error('Error handling sale_complete:', error);
            }
        });
    
        this.socket.on('house_budget_updated', async (data) => {
            console.log('Received house_budget_updated event:', data);
            if (data.houseId === State.houseData?.houseId) {
                console.log('Updating house budget:', data.budget);
                State.houseData.budget = data.budget;
                await State.loadPurchasedCrew();
                Dashboard.updateHouseInfo();
                CatalogueManager.updateCatalogue();
            }
        });
    }

    static disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}