class CatalogueManager {
    static state = {
        currentPage: 1,
        itemsPerPage: 10,
        sortField: null,
        sortDirection: 'asc',
        filterText: ''
    };

    static updateCatalogue() {
        const tbody = document.getElementById('catalogueList');
        const paginationContainer = document.getElementById('cataloguePagination');
        
        if (!tbody) {
            console.error('Catalogue list element not found');
            return;
        }

        // Get and filter crew members
        let filteredCrew = State.crewMembers || [];
        
        if (this.state.filterText) {
            const searchText = this.state.filterText.toLowerCase();
            filteredCrew = filteredCrew.filter(crew => 
                crew && (
                    (crew.name && crew.name.toLowerCase().includes(searchText)) ||
                    (crew.category && crew.category.toLowerCase().includes(searchText)) ||
                    (crew.status && crew.status.toLowerCase().includes(searchText))
                )
            );
        }

        // Sort if a sort field is selected
        if (this.state.sortField) {
            filteredCrew.sort((a, b) => {
                let aValue = a[this.state.sortField];
                let bValue = b[this.state.sortField];

                // Handle numeric values
                if (this.state.sortField === 'base_price' || 
                    this.state.sortField === 'current_bid' ||
                    this.state.sortField === 'rating') {
                    aValue = Number(aValue) || 0;
                    bValue = Number(bValue) || 0;
                }

                // Handle string values
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                }
                if (typeof bValue === 'string') {
                    bValue = bValue.toLowerCase();
                }

                if (this.state.sortDirection === 'asc') {
                    return aValue > bValue ? 1 : -1;
                } else {
                    return aValue < bValue ? 1 : -1;
                }
            });
        }

        // Calculate pagination
        const totalPages = Math.ceil(filteredCrew.length / this.state.itemsPerPage);
        const startIndex = (this.state.currentPage - 1) * this.state.itemsPerPage;
        const paginatedCrew = filteredCrew.slice(startIndex, startIndex + this.state.itemsPerPage);

        // Update table content
        tbody.innerHTML = paginatedCrew.map(crew => {
            if (!crew) return '';
            return `
                <tr>
                    <td>${crew.name || 'N/A'}</td>
                    <td>${crew.category || 'N/A'}</td>
                    <td>${crew.rating || 'N/A'}</td>
                    <td>${((crew.base_price || 0) / 10000000).toFixed(2)}</td>
                    <td><span class="status ${crew.status || 'available'}">${(crew.status || 'AVAILABLE').toUpperCase()}</span></td>
                    <td>${crew.buyer_name || '-'}</td>
                </tr>
            `;
        }).join('');

        // Update pagination controls
        if (paginationContainer) {
            paginationContainer.innerHTML = this.generatePaginationControls(totalPages);
        }

        // Update counter if it exists
        const counter = document.getElementById('catalogueCounter');
        if (counter) {
            counter.textContent = `Showing ${startIndex + 1}-${Math.min(startIndex + this.state.itemsPerPage, filteredCrew.length)} of ${filteredCrew.length}`;
        }

        // Update sort indicators
        document.querySelectorAll('.catalogue-header').forEach(header => {
            const field = header.getAttribute('onclick')?.match(/sort\('(.+?)'\)/)?.[1];
            if (field === this.state.sortField) {
                header.classList.add('sorted', this.state.sortDirection);
            } else {
                header.classList.remove('sorted', 'asc', 'desc');
            }
        });
    }


    static sortCrew(a, b) {
        let aValue = a[this.state.sortField];
        let bValue = b[this.state.sortField];

        if (this.state.sortField === 'base_price' || this.state.sortField === 'current_bid') {
            aValue = Number(aValue);
            bValue = Number(bValue);
        }

        return this.state.sortDirection === 'asc' 
            ? aValue > bValue ? 1 : -1 
            : aValue < bValue ? 1 : -1;
    }

    static renderCrewRow(crew) {
        return `
            <tr>
                <td>${crew.name}</td>
                <td>${crew.category}</td>
                <td>${crew.rating}</td>
                <td>${(crew.base_price / 10000000).toFixed(2)}</td>
                <td>${(crew.current_bid / 10000000).toFixed(2)}</td>
                <td><span class="status ${crew.status}">${crew.status.toUpperCase()}</span></td>
                <td>${crew.buyer_name || '-'}</td>
            </tr>
        `;
    }

    static generatePaginationControls(totalPages) {
        if (totalPages <= 1) return '';

        let controls = [];
        controls.push(this.renderPaginationButton('Previous', this.state.currentPage - 1, this.state.currentPage === 1));

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= this.state.currentPage - 2 && i <= this.state.currentPage + 2)
            ) {
                controls.push(this.renderPaginationButton(i, i, false, i === this.state.currentPage));
            } else if (
                i === this.state.currentPage - 3 ||
                i === this.state.currentPage + 3
            ) {
                controls.push('<span>...</span>');
            }
        }

        controls.push(this.renderPaginationButton('Next', this.state.currentPage + 1, 
            this.state.currentPage === totalPages));

        return controls.join('');
    }

    static renderPaginationButton(text, page, disabled, active = false) {
        return `
            <button 
                onclick="CatalogueManager.changePage(${page})"
                ${disabled ? 'disabled' : ''}
                class="${active ? 'active' : ''}"
            >${text}</button>
        `;
    }

    static changePage(page) {
        this.state.currentPage = page;
        this.updateCatalogue();
    }

    static sort(field) {
        if (this.state.sortField === field) {
            this.state.sortDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.state.sortField = field;
            this.state.sortDirection = 'asc';
        }
        this.updateCatalogue();
    }

    static filter(text) {
        this.state.filterText = text;
        this.state.currentPage = 1;
        this.updateCatalogue();
    }

    static updateBid(data) {
        const crewIndex = State.crewMembers.findIndex(c => c.id === data.crewId);
        if (crewIndex !== -1) {
            State.crewMembers[crewIndex].current_bid = data.newBid;
            this.updateCatalogue();
        }
    }
}