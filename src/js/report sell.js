// Google Sheets API Constants
const API_KEY = "AIzaSyD7eX6VGCDHXBzF63CAHDfaP1-WFp3jcoI";
const SHEET_ID = "1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng";
// Assuming the columns are: A=Date, B=Product ID, C=Product Name, D=Quantity
const SHEET_RANGE = "Sell!A2:D"; 

// The element where we will display the date list and then the filtered data
const sellDataContainer = document.getElementById('sell-data');
const showDataButton = document.getElementById('show-data-btn');

// Variable to store all fetched data globally
let allSellData = [];

// --- Helper Functions ---

/**
 * Extracts and cleans the date string from a sheet value, 
 * ensuring only the YYYY-MM-DD part is used for sorting/display.
 * @param {string} rawDate - The raw date string from the spreadsheet.
 * @returns {string} The cleaned date string (e.g., "2025-11-11").
 */
function cleanDate(rawDate) {
    if (!rawDate) return '';
    // Use a regular expression to extract the YYYY-MM-DD part if time is present, 
    // or return the whole string if it looks like just a date.
    const match = rawDate.match(/^(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{4})/);
    return match ? match[0] : rawDate; 
}


/**
 * Renders the list of unique dates fetched from the sales data.
 * @param {Array<Array<string>>} data - The array of all sell rows.
 */
function renderDateList(data) {
    if (!data || data.length === 0) {
        sellDataContainer.innerHTML = '<p class="info-message">No sell data found in the sheet.</p>';
        return;
    }

    // Column A is the Date (index 0)
    const allDates = data.map(row => row[0]);
    
    // Get unique dates and filter out any empty values
    const uniqueDates = [...new Set(allDates)].filter(date => date);

    if (uniqueDates.length === 0) {
        sellDataContainer.innerHTML = '<p class="info-message">No valid dates found in the sell data.</p>';
        return;
    }

    // Sort dates in descending order (most recent first)
    // The sorting is robust even if the raw strings are in different formats
    uniqueDates.sort((a, b) => new Date(b) - new Date(a));

    let html = '<h2>Select a Sell Date</h2><ul class="date-list">';

    uniqueDates.forEach(date => {
        // Use the cleaned date for display (ensures no time shows up)
        const displayDate = cleanDate(date);
        
        html += `
            <li class="date-item" data-date="${date}">
                ${displayDate}
                <i class="fa-solid fa-arrow-right-long list-arrow"></i>
            </li>
        `;
    });

    html += '</ul>';
    sellDataContainer.innerHTML = html;
    
    // Hide the "Show Data" button once the list is loaded
    if (showDataButton) {
        showDataButton.style.display = 'none';
    }

    // Attach click listeners to the newly created date items
    document.querySelectorAll('.date-item').forEach(item => {
        item.addEventListener('click', () => {
            // Filter using the original date string to match sheet data exactly
            const selectedDate = item.getAttribute('data-date'); 
            displaySalesForDate(selectedDate);
        });
    });
}

/**
 * Filters the sell data for a specific date and displays it in a table.
 * @param {string} dateString - The date to filter by (e.g., "2025-11-10").
 */
function displaySalesForDate(dateString) {
    // Filter by the original date string from the sheet
    const filteredData = allSellData.filter(row => row[0] === dateString);
    const displayDate = cleanDate(dateString); // Use the cleaned date for the header

    if (filteredData.length === 0) {
        sellDataContainer.innerHTML = `<p class="info-message">No sales recorded for ${displayDate}.</p>`;
        return;
    }

    let html = `
        <button id="back-to-dates-btn" class="back-btn"><i class="fa-solid fa-arrow-left"></i> Back to Dates</button>
        <h2>Sell Records for ${displayDate}</h2>
        <table class="sell-table">
            <thead>
                <tr>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Quantity</th>
                </tr>
            </thead>
            <tbody>
    `;

    filteredData.forEach(row => {
        // Row indices: 1=Product ID, 2=Product Name, 3=Quantity
        const productId = row[1] || 'N/A';
        const productName = row[2] || 'N/A';
        const quantity = row[3] || '0';
        
        html += `
            <tr>
                <td data-label="Product ID">${productId}</td>
                <td data-label="Product Name">${productName}</td>
                <td data-label="Quantity">${quantity}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;
    sellDataContainer.innerHTML = html;

    // Attach listener to the back button
    document.getElementById('back-to-dates-btn').addEventListener('click', () => {
        renderDateList(allSellData);
    });
}


// --- Main Fetch Function ---

async function fetchSellData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`;
    
    // Clear previous data and show loading state
    allSellData = [];
    sellDataContainer.innerHTML = '<div class="loading-message"><i class="fa-solid fa-spinner fa-spin"></i> Loading sell data...</div>';
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Google Sheets API Error: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.values) {
            // Apply sorting and rendering
            allSellData = data.values;
            renderDateList(allSellData); 
        } else {
            sellDataContainer.innerHTML = '<p class="error-message">Sheet data is empty or range is incorrect.</p>';
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        sellDataContainer.innerHTML = `<p class="error-message">Failed to load data. Check your API key or network connection. (${error.message})</p>`;
    }
}


// --- Event Listener Setup ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Attach the main function to the 'Show Data' button click (for redundancy, though it auto-loads)
    if (showDataButton) {
        showDataButton.addEventListener('click', fetchSellData);
    }
    
    // 2. Automatically load data when the page loads
    fetchSellData(); 
});