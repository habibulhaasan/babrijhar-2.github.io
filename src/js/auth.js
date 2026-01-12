/**
 * Authentication Check Script
 * Use this script on all pages that require a user to be logged in.
 */

const LOGIN_URL = 'index.html'; // The required login page is index.html

/**
 * Checks the local storage for the 'isLoggedIn' flag.
 * If the user is not logged in, they are redirected to the login page.
 */
function checkAuthAndRedirect() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    // Check if user is NOT logged in or the flag is not explicitly 'true'
    if (isLoggedIn !== 'true') {
        console.warn('User not authenticated. Redirecting to login page.');
        // Use replace() so the user cannot navigate back to the secured page
        window.location.replace(LOGIN_URL);
    } else {
        console.log('User authenticated. Access granted.');
    }
}

/**
 * Clears the login status from local storage and redirects to the login page.
 */
function logout() {
    console.log('Logging out user...');
    localStorage.removeItem('isLoggedIn');
    // Redirect to login page
    window.location.replace(LOGIN_URL);
}

// Automatically run the check function when the script loads
// This ensures protected pages immediately redirect if the user isn't authenticated.
checkAuthAndRedirect();
