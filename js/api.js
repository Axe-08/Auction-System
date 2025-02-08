class API {
    static async loadHouseData(accessCode) {
        const response = await fetch(`${config.API_URL}/api/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ accessCode })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Authentication failed');
        }
        
        return response.json();
    }

    static async loadCatalogue() {
        const response = await fetch(`${config.API_URL}/api/crew`);
        return response.json();
    }

    static async loadPurchasedCrew(houseId) {
        const response = await fetch(`${config.API_URL}/api/production-house/${houseId}`);
        return response.json();
    }
}