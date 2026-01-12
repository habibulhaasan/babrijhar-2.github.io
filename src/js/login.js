// --- Configuration ---
        const SHEET_ID = '1VXjfK-E1yUdV6xBXsl4xBPzBxTPISewe23z4Pe9D2Ds';
        // Note: The apiKey must be empty, the environment will provide it.
        const API_KEY = 'AIzaSyD7eX6VGCDHXBzF63CAHDfaP1-WFp3jcoI'; 
        // MODIFIED: Fetching only cells B3 (Password) and C3 (Username)
        // B3 contains the password (index 0 in fetched row), C3 contains the username (index 1)
        const SHEET_RANGE = 'ClientList!B3:C3';
        const MAX_RETRIES = 3;
        const DASHBOARD_URL = 'dashboard.html';

        // Check if user is already logged in on page load
        if (localStorage.getItem('isLoggedIn') === 'true') {
            // If logged in, redirect immediately to the dashboard
            window.location.replace(DASHBOARD_URL);
        }

        // --- Utility Functions ---

        /**
         * Custom message box to show feedback instead of using alert().
         * @param {string} message - The message to display.
         * @param {string} type - 'success' or 'error'.
         */
        function showMessage(message, type) {
            const box = document.getElementById('message-box');
            
            // Set message and dynamic class
            box.textContent = message;
            box.className = ''; // Reset classes
            box.classList.add(type === 'success' ? 'msg-success' : 'msg-error');
            box.classList.add('visible');

            // Hide after 4 seconds
            setTimeout(() => {
                box.classList.remove('visible');
            }, 4000);
        }

        /**
         * Fetches credentials from the Google Sheet with exponential backoff.
         * @param {number} retries - Current retry count.
         */
        async function fetchCredentials() {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`;
            
            for (let i = 0; i < MAX_RETRIES; i++) {
                try {
                    const response = await fetch(url);
                    
                    if (response.status === 429) { // Rate limit handling
                        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue; // Retry
                    }

                    if (!response.ok) {
                        const errorBody = await response.json();
                        throw new Error(`API error: ${response.status} - ${errorBody.error?.message || 'Unknown error'}`);
                    }

                    const data = await response.json();
                    // MODIFIED: Return all fetched values (should be the single row B3:C3)
                    return data.values || []; 

                } catch (error) {
                    console.error('Error fetching data from Google Sheets:', error);
                    if (i === MAX_RETRIES - 1) {
                         showMessage('Failed to connect to credential server. Please try again.', 'error');
                         return null;
                    }
                }
            }
            return null;
        }

        // --- Main Login Handler ---

        async function handleLogin(event) {
            event.preventDefault();

            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const loginButton = document.getElementById('loginButton');
            const buttonText = document.getElementById('buttonText');
            const spinner = document.getElementById('spinner');

            const enteredUsername = usernameInput.value.trim();
            const enteredPassword = passwordInput.value.trim();

            // UI feedback for processing
            loginButton.disabled = true;
            buttonText.textContent = 'Authenticating...';
            spinner.classList.remove('hidden');

            try {
                const clientList = await fetchCredentials();

                if (!clientList || clientList.length === 0) {
                    showMessage('Failed to retrieve login credentials.', 'error');
                    return; 
                }

                let isAuthenticated = false;

                // MODIFIED: Check against the single row fetched (B3=Password, C3=Username)
                const singleCredentialRow = clientList[0];
                // singleCredentialRow[0] is the value from B3 (Password)
                const sheetPassword = (singleCredentialRow[0] || '').trim();
                // singleCredentialRow[1] is the value from C3 (Username)
                const sheetUsername = (singleCredentialRow[1] || '').trim();

                if (sheetUsername.toLowerCase() === enteredUsername.toLowerCase() && sheetPassword === enteredPassword) {
                    isAuthenticated = true;
                }
                
                // The original loop is no longer necessary as we only fetch one row.

                if (isAuthenticated) {
                    // 1. Set login status in local storage
                    localStorage.setItem('isLoggedIn', 'true');
                    
                    showMessage(`Login successful for user: ${enteredUsername}! Redirecting...`, 'success');
                    
                    // 2. Redirect to dashboard
                    setTimeout(() => {
                        window.location.replace(DASHBOARD_URL); 
                    }, 1000); 

                } else {
                    showMessage('Invalid Username or App Key. Please check your credentials.', 'error');
                }

            } catch (error) {
                console.error('Login process error:', error);
                showMessage('An unexpected error occurred during login.', 'error');
            } finally {
                // Reset UI state (but do not re-enable if redirection is imminent)
                loginButton.disabled = false;
                buttonText.textContent = 'Login';
                spinner.classList.add('hidden');
            }
        }