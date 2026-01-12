// API Configuration
        const API_KEY = "AIzaSyD7eX6VGCDHXBzF63CAHDfaP1-WFp3jcoI";
        const SHEET_ID = "1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng";
        // *** MODIFIED for Products sheet and A2:F range ***
        const SHEET_RANGE = "Products!A2:F"; // Date(A), Product ID(B), Product Name(C), Product Type(D), Generic Name(E), Company Name(F)
        const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`;
        const MAX_RETRIES = 5;

        // Global variable to hold the full, unfiltered product data (REQUIRED for search)
        let allProducts = [];
        // Global variable to track the current active search term (REQUIRED for search)
        let currentSearchTerm = '';

        // --- Utility Functions ---
        
        /**
         * Utility function to safely parse a DD/MM/YYYY formatted string (with time) into a Date object.
         * This is essential for correct sorting by date.
         * @param {string} dateString The full date string from the spreadsheet (DD/MM/YYYY HH:MM:SS).
         * @returns {Date | null} A correctly parsed Date object, or null on failure.
         */
        function createDateFromDDMMYYYYString(dateString) {
            if (!dateString) return null;
            
            // Extract the date part (DD/MM/YYYY)
            const datePartMatch = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (!datePartMatch) return null;

            // datePartMatch[1]=DD, [2]=MM, [3]=YYYY
            const day = parseInt(datePartMatch[1], 10);
            const month = parseInt(datePartMatch[2], 10);
            const year = parseInt(datePartMatch[3], 10);
            
            // Month is 0-indexed in JavaScript Date (Jan=0, Dec=11)
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                return new Date(year, month - 1, day); 
            }
            return null;
        }

        /**
         * Formats the date string from the sheet to DD/MM/YYYY for display.
         * @param {string} dateString The date string from the spreadsheet (DD/MM/YYYY HH:MM:SS).
         * @returns {string} Formatted date (e.g., "08/03/2025").
         */
        function formatDateDisplay(dateString) {
            if (!dateString) return 'N/A';
            // Match and return the DD/MM/YYYY part
            const datePartMatch = dateString.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
            return datePartMatch ? datePartMatch[0] : dateString;
        }


        // Function to determine custom sort order based on Product Type
        function getProductTypeOrder(type) {
            if (!type) return 4; // Priority 4: Treat empty/N/A as lowest priority
            const cleanType = type.trim().toLowerCase();

            // Custom order Priority: 0 (Highest) -> 1 -> 2 -> 3 (Lowest)
            
            // 0: Tab. (Tablet)
            if (cleanType.includes('tab.') || cleanType.includes('tablet')) return 0; 
            
            // 1: Cap. (Capsule)
            if (cleanType.includes('cap.') || cleanType.includes('capsule')) return 1;
            
            // 2: Syrup/Suspension
            if (cleanType.includes('syrup') || cleanType.includes('suspension')) return 2;

            // 3. Other common forms (Cream, Gel, Injection, etc.)
            return 3; 
        }

        /**
         * Custom sort function for products:
         * 1. By Product Type (custom priority)
         * 2. By Date (most recent first)
         * 3. By Product Name (alphabetical)
         */
        function sortProductData(data) {
            if (!data || data.length === 0) return [];
            
            return data.sort((a, b) => {
                // Indices: Date(0), Product ID(1), Product Name(2), Product Type(3), Generic Name(4), Company Name(5)
                
                // 1. Sort by Product Type Priority Ascending
                const typeOrderA = getProductTypeOrder(a[3]);
                const typeOrderB = getProductTypeOrder(b[3]);
                if (typeOrderA !== typeOrderB) {
                    return typeOrderA - typeOrderB;
                }

                // 2. Sort by Date Descending (Newest first) - Uses safe parsing
                const dateA = createDateFromDDMMYYYYString(a[0])?.getTime() || 0; 
                const dateB = createDateFromDDMMYYYYString(b[0])?.getTime() || 0; 
                if (dateA !== dateB) {
                    return dateB - dateA;
                }
                
                // 3. Sort by Product Name Alphabetically
                const nameA = a[2] ? a[2].toLowerCase() : '';
                const nameB = b[2] ? b[2].toLowerCase() : '';
                return nameA.localeCompare(nameB);
            });
        }
        
        // --- Filtering Logic (Search Functionality Added) ---

        /**
         * Filters the product data based on the current search term and triggers re-rendering.
         */
        function renderFilteredData() {
            let filteredData = allProducts;
            const searchTerm = currentSearchTerm.toLowerCase();

            if (searchTerm) {
                filteredData = filteredData.filter(row => {
                    // Indices: Date(0), Product ID(1), Product Name(2), Product Type(3), Generic Name(4), Company Name(5)
                    // Convert all relevant fields to string and lowercase for case-insensitive search
                    const productId = row[1] ? String(row[1]).toLowerCase() : '';
                    const productName = row[2] ? String(row[2]).toLowerCase() : '';
                    const productType = row[3] ? String(row[3]).toLowerCase() : '';
                    const genericName = row[4] ? String(row[4]).toLowerCase() : '';
                    const companyName = row[5] ? String(row[5]).toLowerCase() : '';

                    // Check if the search term is included in any key field
                    return productId.includes(searchTerm) || 
                           productName.includes(searchTerm) || 
                           productType.includes(searchTerm) ||
                           genericName.includes(searchTerm) ||
                           companyName.includes(searchTerm);
                });
            }

            // Always sort the final filtered data
            const finalData = sortProductData(filteredData);
            
            // Render the results
            renderDataHTML(finalData);
        }

        /**
         * Updates the product search term and triggers a re-render.
         * This is attached to the input field events.
         */
        function applyProductSearch() {
            const searchInput = document.getElementById('product-search'); 
            // Safely get the value if the input exists
            currentSearchTerm = searchInput ? searchInput.value.trim() : '';
            renderFilteredData();
        }


        // --- Data Fetching ---

        async function fetchProductData() {
            const dataContainer = document.getElementById('data-container');
            const loadingIndicator = document.getElementById('loading-indicator');
            // CRITICAL: Ensure the ID matches the expected input element for search
            const searchInput = document.getElementById('product-search'); 
            
            if (loadingIndicator) loadingIndicator.classList.remove('hidden');
            if (searchInput) searchInput.disabled = true;
            dataContainer.innerHTML = ''; 

            for (let i = 0; i < MAX_RETRIES; i++) {
                try {
                    const response = await fetch(API_URL);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    
                    if (loadingIndicator) loadingIndicator.classList.add('hidden');
                    
                    if (data.values && data.values.length > 0) {
                        allProducts = data.values; 
                        renderFilteredData(); // Use the new filtering function to render all initially
                        if (searchInput) searchInput.disabled = false;
                    } else {
                        // English error message
                        dataContainer.innerHTML = `<div class="header-card alert alert-warning" role="alert" style="border-left: 4px solid #f59e0b;">
                            <strong>No Data Found.</strong> The 'Products' sheet is empty or the range is incorrect.
                        </div>`;
                    }
                    return; // Success
                } catch (error) {
                    console.error(`Attempt ${i + 1} failed:`, error);
                    if (i === MAX_RETRIES - 1) {
                        if (loadingIndicator) loadingIndicator.classList.add('hidden');
                        dataContainer.innerHTML = `
                            <div class="header-card alert alert-error" role="alert" style="border-top: 4px solid #ef4444;">
                                <strong>Error!</strong> Failed to load product data. Check API Key or Sheet ID/Range: ${SHEET_RANGE}.
                            </div>
                        `;
                        return; // Final failure
                    }
                    // Exponential backoff
                    const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        // --- HTML Rendering ---

        function renderDataHTML(data) {
            const dataContainer = document.getElementById('data-container');
            
            // Check for no results after filtering
            if (!data || data.length === 0) {
                let message = 'No product records found.';
                if (currentSearchTerm) {
                    message = `No products matched the search: "${currentSearchTerm}".`;
                }
                dataContainer.innerHTML = `
                    <div class="header-card alert alert-warning" role="alert" style="border-left: 4px solid #f59e0b;">
                        <strong>No Data Found</strong>
                        <p>${message}</p>
                    </div>
                `;
                return;
            }

            // Headers for display (ALL ENGLISH)
            const header = ['Date Added', 'ID', 'Product Name', 'Type', 'Generic Name', 'Company'];
            
            // --- 1. Desktop Table View ---
            let tableHTML = `
                <div class="responsive-table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                ${header.map(h => `<th>${h}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            data.forEach(row => {
                // Indices: Date(0), Product ID(1), Product Name(2), Product Type(3), Generic Name(4), Company Name(5)
                const dateAdded = formatDateDisplay(row[0]); // English numbers
                const productId = row[1] || 'N/A'; // English numbers
                const productName = row[2] ? String(row[2]).trim() : 'N/A';
                const productType = row[3] ? String(row[3]).trim() : 'N/A';
                const genericName = row[4] ? String(row[4]).trim() : 'N/A';
                const companyName = row[5] ? String(row[5]).trim() : 'N/A';

                tableHTML += `
                    <tr>
                        <td>${dateAdded}</td>
                        <td>${productId}</td>
                        <td class="font-semibold">${productName}</td>
                        <td class="text-blue">${productType}</td>
                        <td class="text-green">${genericName}</td>
                        <td>${companyName}</td>
                    </tr>
                `;
            });

            tableHTML += `
                        </tbody>
                    </table>
                </div>
            `;


            // --- 2. Mobile Card View ---
            let cardHTML = `
                <div class="mobile-card-view">
            `;

            data.forEach((row) => {
                const dateAdded = formatDateDisplay(row[0]); // English numbers
                const productId = row[1] || 'N/A'; // English numbers
                const productName = row[2] ? String(row[2]).trim() : 'N/A';
                const productType = row[3] ? String(row[3]).trim() : 'N/A';
                const genericName = row[4] ? String(row[4]).trim() : 'N/A';
                const companyName = row[5] ? String(row[5]).trim() : 'N/A';
                
                cardHTML += `
                    <div class="data-card-mobile">
                        <div class="card-row card-row-header">
                            <span class="font-bold">${productName}</span>
                            <span class="label" style="font-weight:normal;">ID: <span class="value">${productId}</span></span>
                        </div>
                        
                        <div class="card-row">
                            <span class="label">Date Added:</span>
                            <span class="value">${dateAdded}</span>
                        </div>
                        
                        <div class="card-row">
                            <span class="label">Product Type:</span>
                            <span class="value text-blue">${productType}</span>
                        </div>
                        
                        <div class="card-row">
                            <span class="label">Generic Name:</span>
                            <span class="value text-green">${genericName}</span>
                        </div>
                        
                        <div class="card-row">
                            <span class="label">Company:</span>
                            <span class="value">${companyName}</span>
                        </div>
                    </div>
                `;
            });

            cardHTML += `
                </div>
            `;

            dataContainer.innerHTML = tableHTML + cardHTML;
        }

        // --- Initialization and Event Setup ---
        window.addEventListener('load', function() {
            // 1. Initialize the layout (for header/sidebar)
            // Assumes initializeLayout is provided by nav-layout.js
            if (typeof initializeLayout === 'function') {
                initializeLayout('view-products-standalone'); 
            } else {
                console.warn("initializeLayout function not found. Skipping layout initialization.");
            }
            
            // 2. Fetch and render data
            fetchProductData();
            
            // 3. Setup event handlers for search
            // NOTE: Assuming your HTML input field has the ID 'product-search'
            const searchInput = document.getElementById('product-search');
            if (searchInput) {
                // Attach event listener for real-time filtering on every key press
                searchInput.addEventListener('keyup', applyProductSearch);
                // Also listen for change event (useful on some mobile input methods)
                searchInput.addEventListener('change', applyProductSearch); 
            } else {
                 console.warn("Search input with ID 'product-search' not found. Please ensure this ID is used in your HTML to enable search.");
            }
        });