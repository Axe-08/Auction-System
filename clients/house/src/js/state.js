// clients/house/src/js/state.js
class State {
    static houseData = null;
    static crewMembers = [];
    static purchasedCrew = [];
    static leaderboardData = null; 

    static async loadCatalogue() {
        try {
            console.log('Loading catalogue...');
            const crew = await API.loadCatalogue();
            console.log('Received catalogue data:', crew);
            this.crewMembers = crew || [];
            CatalogueManager.updateCatalogue();
            console.log('Catalogue updated');
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
            console.log('Loading purchased crew for house:', this.houseData.houseId);
            const data = await API.loadPurchasedCrew(this.houseData.houseId);
            console.log('Received purchased crew data:', data);
            
            if (typeof data.budget === 'number') {
                console.log('Updating budget:', data.budget);
                this.houseData.budget = data.budget;
            }
            
            this.purchasedCrew = data.purchased_crew || [];
            console.log('Updated purchased crew:', this.purchasedCrew);
            
            Dashboard.updateHouseInfo();
            Dashboard.updateStatsAndRequirements();
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

    static async loadHouseStats() {
        try {
            const leaderboard = await API.getLeaderboard();
            const houseStats = leaderboard.find(h => h.id === this.houseData?.houseId);
            if (houseStats) {
                this.leaderboardData = houseStats;
                Dashboard.updateHouseInfo();
            }
        } catch (error) {
            console.error('Failed to load house stats:', error);
        }
    }

    static getHouseStats() {
        return this.leaderboardData;
    }

    static reset() {
        this.houseData = null;
        this.crewMembers = [];
        this.purchasedCrew = [];
    }
}