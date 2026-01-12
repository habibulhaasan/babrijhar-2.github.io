// API Configuration
        const API_KEY = "AIzaSyD7eX6VGCDHXBzF63CAHDfaP1-WFp3jcoI";
        const SHEET_ID = "1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng";
        // *** NEW RANGE for Generics sheet and B2:E range ***
        // Columns: Generic ID (B), Generic Name (C), Detail Link (D), Notes (E)
        const SHEET_RANGE = "Generics!B2:E"; 
        const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`;
        const MAX_RETRIES = 5;

        // Global variable to hold the full, unfiltered generic data (REQUIRED for search)
        let allGenericsData = [];
        // Global variable to track the current active search term (REQUIRED for search)
        let currentSearchTerm = '';

        // --- Custom Sorting Logic ---
        // Function to process and sort the data ascendingly by Generic Name (column index 1)
        function processGenericData(data) {
            if (!data || data.length === 0) return [];

            return data.sort((a, b) => {
                // Generic Name is at index 1 in the B2:E range
                const nameA = a[1] ? String(a[1]).trim().toUpperCase() : '';
                const nameB = b[1] ? String(b[1]).trim().toUpperCase() : '';
                
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0; // names are equal
            });
        }

        // --- Filtering Logic (Search Functionality Added) ---

        /**
         * Filters the generic data based on the current search term and triggers re-rendering.
         */
        function renderFilteredData() {
            let filteredData = allGenericsData;
            const searchTerm = currentSearchTerm.toLowerCase();

            if (searchTerm) {
                filteredData = filteredData.filter(row => {
                    // Indices: Generic ID(0), Generic Name(1), Detail Link(2), Notes(3)
                    // Convert all relevant fields to string and lowercase for case-insensitive search
                    const genericId = row[0] ? String(row[0]).toLowerCase() : '';
                    const genericName = row[1] ? String(row[1]).toLowerCase() : '';
                    const notes = row[3] ? String(row[3]).toLowerCase() : '';

                    // Check if the search term is included in any key field
                    return genericId.includes(searchTerm) || 
                           genericName.includes(searchTerm) || 
                           notes.includes(searchTerm);
                });
            }

            // Always sort the final filtered data
            const finalData = processGenericData(filteredData);
            
            // Render the results
            renderDataHTML(finalData);
        }

        /**
         * Updates the generic search term and triggers a re-render.
         * This is attached to the input field events.
         */
        function applyGenericSearch() {
            // CRITICAL: The ID must match the HTML input element, assuming 'product-search'
            const searchInput = document.getElementById('product-search'); 
            // Safely get the value if the input exists
            currentSearchTerm = searchInput ? searchInput.value.trim() : '';
            renderFilteredData();
        }

        // --- Data Fetching ---
        
        async function fetchData() {
            const dataContainer = document.getElementById('data-container');
            const loadingIndicator = document.getElementById('loading-indicator');
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
                        allGenericsData = data.values;
                        // Use the new filtering function to render all data initially
                        renderFilteredData();
                        if (searchInput) searchInput.disabled = false;
                    } else {
                        dataContainer.innerHTML = `<div class="header-card alert alert-warning" role="alert" style="border-left: 4px solid #f59e0b;">
                            <strong>No Data Found.</strong> The 'Generics' sheet is empty or the range is incorrect.
                        </div>`;
                    }
                    return; // Success
                } catch (error) {
                    console.error(`Attempt ${i + 1} failed:`, error);
                    if (i === MAX_RETRIES - 1) {
                        if (loadingIndicator) loadingIndicator.classList.add('hidden');
                        dataContainer.innerHTML = `
                            <div class="header-card alert alert-error" role="alert" style="border-top: 4px solid #ef4444;">
                                <strong>Error!</strong> Failed to load generic data. Check API Key or Sheet ID/Range: ${SHEET_RANGE}.
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
                let message = 'No generic records found.';
                if (currentSearchTerm) {
                    message = `No generics matched the search: "${currentSearchTerm}".`;
                }
                dataContainer.innerHTML = `
                    <div class="header-card alert alert-warning" role="alert" style="border-left: 4px solid #f59e0b;">
                        <strong>No Data Found</strong>
                        <p>${message}</p>
                    </div>
                `;
                return;
            }

            // Headers for display
            const header = ['ID', 'Generic Name', 'Notes', 'Detail Link'];
            
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
                // Indices: Generic ID(0), Generic Name(1), Detail Link(2), Notes(3)
                const genericId = row[0] || 'N/A';
                const genericName = row[1] ? String(row[1]).trim() : 'N/A';
                const detailLink = row[2] ? String(row[2]).trim() : '';
                const notes = row[3] ? String(row[3]).trim() : '';

                let linkContent;
                if (detailLink) {
                    // Ensure the 'Read' button is full width
                    linkContent = `<a href="${detailLink}" target="_blank" class="detail-button" style="width: 80%; text-align: center;">Read</a>`;
                } else {
                    linkContent = '-';
                }

                tableHTML += `
                    <tr>
                        <td>${genericId}</td>
                        <td class="font-semibold">${genericName}</td>
                        <td>${notes || '-'}</td>
                        <td>${linkContent}</td>
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
                // Indices: Generic ID(0), Generic Name(1), Detail Link(2), Notes(3)
                const genericId = row[0] || 'N/A';
                const genericName = row[1] ? String(row[1]).trim() : 'N/A';
                const detailLink = row[2] ? String(row[2]).trim() : '';
                const notes = row[3] ? String(row[3]).trim() : '';

                let linkContent;
                if (detailLink) {
                    // Ensure the 'Read' button is full width
                    linkContent = `<a href="${detailLink}" target="_blank" class="detail-button" style="width: 80%; text-align: center;">Read</a>`;
                } else {
                    linkContent = '-';
                }


                cardHTML += `
                    <div class="data-card-mobile">
                        <div class="card-row card-row-header">
                            <!-- Removed .value class to ensure .font-bold has priority and text is strongly bolded -->
                            <span class="font-bold">${genericName}</span>
                            <span class="label">ID: <span class="value">${genericId}</span></span>
                        </div>
                        
                        <div class="card-row">
                            <span class="label">Notes:</span>
                            <span class="value">${notes || '-'}</span>
                        </div>

                       <!-- <div class="card-row card-row-footer">
                            <span class="label">Detail Link:</span>
                            <span class="value">${linkContent}</span>
                        </div> -->
                    </div>
                `;
            });

            cardHTML += `
                </div>
            `;

            dataContainer.innerHTML = tableHTML + cardHTML;
        }

        // Initialize data fetching and event listeners on load
        window.addEventListener('load', function() {
            // Assumes initializeLayout is provided by nav-layout.js
            if (typeof initializeLayout === 'function') {
                initializeLayout('view-generics-standalone'); 
            } else {
                console.warn("initializeLayout function not found. Skipping layout initialization.");
            }

            fetchData();
            
            // 3. Setup event handlers for search
            // NOTE: Using 'product-search' as the ID for the search bar
            const searchInput = document.getElementById('product-search');
            if (searchInput) {
                // Attach event listener for real-time filtering on every key press
                searchInput.addEventListener('keyup', applyGenericSearch);
                // Also listen for change event (useful on some mobile input methods)
                searchInput.addEventListener('change', applyGenericSearch); 
            } else {
                 console.warn("Search input with ID 'product-search' not found. Please ensure this ID is used in your HTML to enable search.");
            }
        });