// clients/house/src/js/state.js
class State {
    static houseData = null;
    static crewMembers = [];
    static purchasedCrew = [];

    static async loadCatalogue() {
        try {
            const crew = await API.loadCatalogue();
            this.crewMembers = crew || [];
            if (CatalogueManager) {
                CatalogueManager.updateCatalogue();
            }
        } catch (error) {
            console.error('Failed to load catalogue:', error);
            Auth.showError('Failed to load catalogue');
        }
    }

    static async loadPurchasedCrew() {
        try {
            if (!this.houseData?.houseId) {
                console.error('No house data available');
                return;
            }
            const data = await API.loadPurchasedCrew(this.houseData.houseId);
            
            // Update house data
            if (typeof data.budget === 'number') {
                this.houseData.budget = data.budget;
            }
            
            // Update purchased crew
            this.purchasedCrew = data.purchased_crew || [];
            
            // Update UI
            Dashboard.updateHouseInfo();
            Dashboard.updateHouseStats();
            CrewManager.showCrewCategory('all');
            
        } catch (error) {
            console.error('Failed to load crew data:', error);
            Auth.showError('Failed to load crew data');
        }
    }

    static calculateRemainingBudget() {
        const totalBudget = this.houseData?.budget || 0;
        const totalSpent = this.purchasedCrew.reduce((sum, crew) => {
            const price = parseInt(crew.purchase_price) || 0;
            return sum + price;
        }, 0);
        return totalBudget - totalSpent;
    }

    static setHouseData(data) {
        if (!data) return;
        
        this.houseData = {
            houseId: data.id,
            houseName: data.name,
            budget: parseInt(data.budget) || 0  // Ensure budget is parsed as integer
        };
        setTimeout(() => Dashboard.updateHouseInfo(), 0);
     
    }

    static reset() {
        this.houseData = null;
        this.crewMembers = [];
        this.purchasedCrew = [];
    }
}