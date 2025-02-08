class Auth {
    static async login() {
        try {
            const accessCode = document.getElementById('accessCode')?.value;
            if (!accessCode) {
                this.showError('Please enter an access code');
                return;
            }

            const data = await API.loadHouseData(accessCode);
            console.log('Login response:', data);

            // Show dashboard first
            document.getElementById('loginScreen')?.classList.add('hidden');
            document.getElementById('dashboard')?.classList.remove('hidden');

            // Then initialize data
            State.setHouseData(data);
            SocketManager.initialize(accessCode);

            // Load initial data
            await Promise.all([
                State.loadCatalogue(),
                State.loadPurchasedCrew()
            ]);

        } catch (error) {
            console.error('Login error:', error);
            this.showError('Login failed: ' + error.message);
        }
    }

    static showError(message) {
        const errorElem = document.getElementById('loginError');
        if (!errorElem) return;

        errorElem.textContent = message;
        errorElem.classList.remove('hidden');
        setTimeout(() => errorElem.classList.add('hidden'), 3000);
    }

    static logout() {
        SocketManager.disconnect();
        State.reset();
        
        document.getElementById('loginScreen')?.classList.remove('hidden');
        document.getElementById('dashboard')?.classList.add('hidden');
        if (document.getElementById('accessCode')) {
            document.getElementById('accessCode').value = '';
        }
    }
}