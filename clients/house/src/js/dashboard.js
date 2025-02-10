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

        // Update house name and budget
        document.getElementById('houseName').textContent = State.houseData.houseName;
        document.getElementById('totalBudget').textContent = (State.houseData.budget / 10000000).toFixed(2);
        const remainingBudget = State.calculateRemainingBudget() / 10000000;
        document.getElementById('remainingBudget').textContent = remainingBudget.toFixed(2);

        // Get stats from leaderboard data
        const houseStats = State.getHouseStats();
        if (houseStats) {
            document.getElementById('avgRating').textContent = 
                houseStats.average_rating ? houseStats.average_rating.toFixed(2) : 'N/A';
            document.getElementById('totalCrew').textContent = houseStats.crew_count || 0;

            // Update requirements
            const requirementsGrid = document.getElementById('requirementsGrid');
            if (requirementsGrid) {
                const requirements = [
                    { name: 'Lead Actor', required: 3, current: houseStats.lead_actors || 0 },
                    { name: 'Supporting Actor', required: 2, current: houseStats.supporting_actors || 0 },
                    { name: 'Musician', required: 1, current: houseStats.musicians || 0 },
                    { name: 'Director', required: 1, current: houseStats.directors || 0 },
                    { name: 'Nepo Kid', required: 1, current: houseStats.nepo_kids || 0 },
                    { name: 'Comedic Relief', required: 1, current: houseStats.comedic_relief || 0 }
                ];

                requirementsGrid.innerHTML = requirements.map(req => `
                    <div class="requirement-card ${req.current >= req.required ? 'fulfilled' : 'pending'}">
                        <div class="title">${req.name}</div>
                        <div class="count">${req.current}/${req.required}</div>
                    </div>
                `).join('');
            }
        }

        // Update budget color
        const budgetElement = document.querySelector('.budget');
        if (budgetElement) {
            const remainingPercentage = (remainingBudget * 10000000 / State.houseData.budget) * 100;
            if (remainingPercentage < 20) {
                budgetElement.style.background = '#f44336';
            } else if (remainingPercentage < 50) {
                budgetElement.style.background = '#ff9800';
            } else {
                budgetElement.style.background = '#4caf50';
            }
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