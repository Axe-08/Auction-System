class Dashboard {
    static initialize() {
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('accessCode').addEventListener('keyup', (event) => {
                if (event.key === 'Enter') Auth.login();
            });

            document.querySelectorAll('.nav-tabs .tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabSet = this.closest('.nav-tabs').querySelectorAll('.tab');
                    tabSet.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        });
    }
    static updateHouseInfo() {
        if (!State.houseData) return;

        try {
            // Update house name and budget
            const houseName = document.getElementById('houseName');
            const totalBudget = document.getElementById('totalBudget');
            const remainingBudget = document.getElementById('remainingBudget');

            if (houseName) houseName.textContent = State.houseData.houseName;
            if (totalBudget) totalBudget.textContent = (State.houseData.budget / 10000000).toFixed(2);
            
            const remaining = State.calculateRemainingBudget() / 10000000;
            if (remainingBudget) remainingBudget.textContent = remaining.toFixed(2);

            // Now update stats and requirements
            this.updateStatsAndRequirements();
        } catch (error) {
            console.error('Error updating house info:', error);
        }
    }

    static updateStatsAndRequirements() {
        try {
            // Update average rating
            const avgRating = document.getElementById('avgRating');
            if (avgRating) {
                avgRating.textContent = this.calculateAverageRating();
            }

            // Update total crew
            const totalCrew = document.getElementById('totalCrew');
            if (totalCrew) {
                totalCrew.textContent = State.purchasedCrew.length;
            }

            // Update requirements
            const requirements = this.checkRequirements();
            const requirementsGrid = document.getElementById('requirementsGrid');
            
            if (requirementsGrid) {
                requirementsGrid.innerHTML = Object.entries(requirements).map(([category, data]) => `
                    <div class="requirement-card ${data.current >= data.required ? 'fulfilled' : 'pending'}">
                        <div class="title">${category}</div>
                        <div class="count">${data.current}/${data.required}</div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error updating stats and requirements:', error);
        }
    }

    static checkRequirements() {
        const requirements = {
            'Lead Actor': { required: 3, current: 0 },
            'Supporting Actor': { required: 2, current: 0 },
            'Musician': { required: 1, current: 0 },
            'Director': { required: 1, current: 0 },
            'Nepo Kid': { required: 1, current: 0 },
            'Comedic Relief': { required: 1, current: 0 }
        };

        State.purchasedCrew.forEach(crew => {
            if (requirements[crew.category]) {
                requirements[crew.category].current++;
            }
        });

        return requirements;
    }

    static calculateAverageRating() {
        if (!State.purchasedCrew.length) return 'N/A';
        const totalRating = State.purchasedCrew.reduce((sum, crew) => sum + (crew.rating || 0), 0);
        return (totalRating / State.purchasedCrew.length).toFixed(2);
    }

    static showTab(tabName) {
        try {
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
            document.querySelectorAll('.nav-tabs .tab').forEach(tab => tab.classList.remove('active'));

            const selectedTab = document.getElementById(`${tabName}Tab`);
            const selectedButton = document.querySelector(`.tab[onclick*="${tabName}"]`);

            if (selectedTab) selectedTab.classList.remove('hidden');
            if (selectedButton) selectedButton.classList.add('active');
        } catch (error) {
            console.error('Error switching tabs:', error);
        }
    }

    static updateHouseStats() {
        const container = document.getElementById('houseStats');
        if (!container) return;

        let averageRating = 'N/A';
        if (State.purchasedCrew.length > 0) {
            const totalRating = State.purchasedCrew.reduce((sum, crew) => sum + (crew.rating || 0), 0);
            averageRating = (totalRating / State.purchasedCrew.length).toFixed(2);
        }

        container.innerHTML = `
            <div class="stats-container">
                <div class="stat">
                    <label>Average Rating</label>
                    <span>${averageRating}</span>
                </div>
                <div class="stat">
                    <label>Total Crew</label>
                    <span>${State.purchasedCrew.length}</span>
                </div>
            </div>
        `;
    }
}

// Initialize dashboard
Dashboard.initialize();