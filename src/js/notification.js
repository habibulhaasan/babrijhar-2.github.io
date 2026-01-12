// --- NOTIFICATION CONFIGURATION ---
const NOTIFICATION_SHEET_ID = '1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng';
// Assuming the message is in Column A, and date/time might be implicitly available if needed,
// but for a clean look, we'll focus on the message content and use mock time.
const NOTIFICATION_RANGE = 'Message!A:A'; 
// const API_KEY = 'AIzaSyD7eX6VGCDHXBzF63CAHDfaP1-WFp3jcoI'; 
const MAX_RETRIES = 3; 

// --- UTILITY FUNCTIONS ---

/**
 * Generates a realistic-looking time string (e.g., '5 minutes ago').
 * @param {number} index - Used to create varying times.
 * @returns {string}
 */
function getRelativeTime(index) {
    const minutes = (index + 1) * 3;
    if (minutes < 60) {
        return `${minutes} minutes ago`;
    }
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
}

/**
 * Utility function to handle API fetching with exponential backoff.
 * (Keeping this logic as per your previous code snippet)
 * @param {string} sheetId - The Google Sheet ID.
 * @param {string} range - The A1 notation range (e.g., 'Sheet1!A:A').
 * @returns {Promise<Array<string>|null>} - A promise that resolves to an array of messages.
 */
async function fetchSheetData(sheetId, range) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${API_KEY}`;
    
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await fetch(url);
            
            if (response.status === 429) { 
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                continue; 
            }

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`API error: ${response.status} - ${errorBody.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            // Flatten the 2D array of values and filter out empty messages.
            return data.values ? data.values.map(row => row[0]).filter(msg => msg && msg.trim() !== '') : []; 

        } catch (error) {
            console.error(`Error fetching data for range ${range}:`, error);
            if (i === MAX_RETRIES - 1) {
                return null;
            }
        }
    }
    return null;
}

/**
 * Renders the fetched notifications into the professional HTML structure.
 */
async function renderNotifications() {
    const container = document.getElementById('notifications-menu');
    const btn = document.getElementById('notifications-btn');

    if (!container || !btn) {
        console.error("Notification elements missing from HTML.");
        return;
    }

    // 1. Loading State
    container.innerHTML = '<li class="no-notifications">Loading notifications...</li>';
    
    const messages = await fetchSheetData(NOTIFICATION_SHEET_ID, NOTIFICATION_RANGE);
    
    // 2. Manage Badge (Unchanged)
    let badge = btn.querySelector('.notification-badge');
    if (!badge) {
        badge = document.createElement('span');
        // Tailwind CSS classes for the badge (assuming Tailwind is available)
        badge.classList.add('notification-badge', 'absolute', 'top-0', 'right-0', 'inline-flex', 'items-center', 'justify-center', 'px-2', 'py-1', 'text-xs', 'font-bold', 'leading-none', 'text-red-100', 'transform', 'translate-x-1/2', '-translate-y-1/2', 'bg-red-600', 'rounded-full', 'hidden');
        btn.appendChild(badge);
    }

    container.innerHTML = ''; // Clear loading state
    
    // 3. Render Messages
    if (messages && messages.length > 0) {
        badge.textContent = messages.length; 
        badge.classList.remove('hidden');

        messages.forEach((msg, index) => {
            // Logic for a dynamic, professional-looking item:
            
            // a. Mock Status & Styling (for visual variety)
            const isUnread = index < 3; // Mark the first few as unread
            const itemClass = 'notification-item' + (isUnread ? ' unread' : '');
            
            // Use different icons and colors based on a quick check
            let iconPath = 'M10 6H20M15 12H20M10 18H20M4 6h.01M4 12h.01M4 18h.01'; // Default: Message Dots
            let iconColor = 'var(--secondary-color)'; // Default: Green
            
            if (index === 0) {
                 // Important/Alert
                 iconPath = 'M12 9v3.75m-9.303 3.376c-.866 1.5.309 3.375 2.071 3.375h14.5c1.762 0 2.938-1.875 2.074-3.375l-7.21-12.492a1.875 1.875 0 00-3.213 0l-7.21 12.492z';
                 iconColor = 'var(--danger-color)'; // Red for alerts
            } else if (index % 5 === 0) {
                // Task/Update
                iconPath = 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'; 
                iconColor = 'var(--primary-color)'; // Blue for updates
            }


            const iconHtml = `<div class="icon-container" style="background-color: ${iconColor};">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="${iconPath}" />
                </svg>
            </div>`;
            
            // b. Message Parsing
            // Try to split the message into a short title (first sentence) and a body
            const parts = msg.split(/[\.!\?]/, 2); 
            const titleText = parts[0].trim() || "System Notification";
            const messageBody = parts.length > 1 ? parts.slice(1).join('.').trim() : msg.trim();
            const timeText = getRelativeTime(index); 

            // c. URL Handling
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const matches = msg.match(urlRegex);
            let finalMessage = messageBody;
            let readMoreLink = '';

            if (matches) {
                const url = matches[0];
                // Remove the URL from the message body
                finalMessage = messageBody.replace(url, '').trim(); 
                readMoreLink = `<a href="${url}" target="_blank" class="text-xs font-semibold text-blue-600 hover:text-blue-800 transition mt-2 self-start">View Details &rarr;</a>`;
            }

            // d. Construct the final professional HTML item
            const listItem = document.createElement('li');
            listItem.className = itemClass;
            
            // To ensure the whole item is clickable without breaking CSS, use a div wrapper
            listItem.innerHTML = `
                ${iconHtml}
                <div class="content-text">
                    <span class="title">${titleText}</span>
                    <span class="message">${finalMessage || 'No detailed message provided.'}</span>
                    <span class="time">${timeText}</span>
                    ${readMoreLink}
                </div>
            `;

            container.appendChild(listItem);
        });

        // Add a "View All" footer for completeness
        const footer = document.createElement('a');
        footer.href = '#'; // Placeholder link
        footer.classList.add('notification-footer');
        footer.textContent = 'View All Notifications';
        container.appendChild(footer);

    } else {
        // Handle no messages scenario
        badge.classList.add('hidden');
        const noDataElement = document.createElement('li');
        noDataElement.classList.add('no-notifications');
        noDataElement.textContent = 'No new notifications.';
        container.appendChild(noDataElement);
    }
}

// Expose renderNotifications globally so it can be called by nav-layout.js when the button is clicked.
window.renderNotifications = renderNotifications;
