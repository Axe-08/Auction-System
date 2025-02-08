class CrewManager {
    static showCrewCategory(category) {
        // Update active tab
        document.querySelectorAll('.side-tabs .tab').forEach(button => {
            button.classList.toggle('active', button.textContent.trim().startsWith(category));
        });

        const crewGrid = document.getElementById('crewGrid');
        if (!crewGrid) {
            console.error('Crew grid not found');
            return;
        }

        const filteredCrew = category === 'all'
            ? State.purchasedCrew
            : State.purchasedCrew.filter(crew => crew.category === category);

        crewGrid.innerHTML = filteredCrew.map(this.renderCrewCard).join('');
        Dashboard.updateStatsAndRequirements();
    }

    static renderCrewCard(crew) {
        return `
            <div class="crew-card">
                <h3>${crew.name}</h3>
                <div class="crew-stat">
                    <span>Category:</span>
                    <span>${crew.category}</span>
                </div>
                <div class="crew-stat">
                    <span>Rating:</span>
                    <span>${crew.rating}</span>
                </div>
                <div class="crew-stat">
                    <span>Purchase Price:</span>
                    <span>₹${(crew.purchase_price / 10000000).toFixed(2)} Cr</span>
                </div>
            </div>
        `;
    }
    static updateCategoryTabs(activeCategory) {
        document.querySelectorAll('#purchasedTab .tab').forEach(tab => {
            if (tab.textContent.includes(activeCategory)) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }
}