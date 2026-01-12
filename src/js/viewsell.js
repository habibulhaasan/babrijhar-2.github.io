// API Configuration (No Change)
        const API_KEY = "AIzaSyD7eX6VGCDHXBzF63CAHDfaP1-WFp3jcoI";
        const SHEET_ID = "1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng";
        const SHEET_RANGE = "Sell!A2:D"; 
        const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`;
        const MAX_RETRIES = 5;

        // Global variable to hold the full, unfiltered sales data
        let allSalesData = [];
        
        // MODIFIED: Global variable to track the current active filters
        let currentFilters = {
            startDate: '', // YYYY-MM-DD from input
            endDate: '',   // YYYY-MM-DD from input
            product: ''    // Search term
        };

        // --- Utility Functions ---

        /**
         * Utility function to safely parse a DD/MM/YYYY formatted string into a Date object, 
         * normalized to midnight (00:00:00) for accurate date comparisons.
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
            
            // Use the Date constructor: Date(YYYY, MM-1, DD) and normalize time to 00:00:00
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                const date = new Date(year, month - 1, day); 
                date.setHours(0, 0, 0, 0); // Normalize time
                return date;
            }
            return null;
        }

        /**
         * Formats the date string from the sheet to DD/MM/YYYY for display, ignoring time.
         * (No Change)
         */
        function formatDateDisplay(dateString) {
            if (!dateString) return 'N/A';
            const datePartMatch = dateString.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
            return datePartMatch ? datePartMatch[0] : dateString;
        }


        /**
         * Helper function to determine the sorting priority of a product based on its type.
         * (No Change)
         */
        function getProductTypePriority(productName) {
            if (!productName) return 4;
            const name = productName.toLowerCase();
            if (name.includes('tablet')) return 1;
            if (name.includes('capsule')) return 2;
            if (name.includes('syrup')) return 3;
            return 4; // Other
        }

        /**
         * Custom sort function for sales data: Sort by Date (most recent first) using safe parsing.
         * (No Change)
         */
        function sortSalesData(data) {
            if (!data || data.length === 0) return [];
            
            return data.sort((a, b) => {
                // Safely parse dates for accurate comparison
                // Use a different parsing method for sorting to ensure time component is considered for same day ordering (if needed)
                // For this scenario, keeping the old time-sensitive sort is better for order within the day.
                const dateA = new Date(a[0]?.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'))?.getTime() || 0;
                const dateB = new Date(b[0]?.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'))?.getTime() || 0;

                // 1. Sort by Date Descending (Newest first)
                if (dateA !== dateB) {
                    return dateB - dateA;
                }

                // 2. Sort by Product Type Priority Ascending
                const priorityA = getProductTypePriority(a[2]);
                const priorityB = getProductTypePriority(b[2]);
                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }

                // 3. Sort by Product Name Alphabetically
                const nameA = a[2] ? a[2].toLowerCase() : '';
                const nameB = b[2] ? b[2].toLowerCase() : '';
                return nameA.localeCompare(nameB);
            });
        }

        /**
         * NEW: Calculates the total sold quantity for the displayed data.
         * @param {Array<Array<string>>} data The filtered sales data.
         * @returns {number} The total quantity.
         */
        function calculateTotalQuantity(data) {
            return data.reduce((total, row) => {
                // row[3] is Quantity
                const quantity = parseInt(row[3], 10);
                return total + (isNaN(quantity) ? 0 : quantity);
            }, 0);
        }

        // --- Data Filtering Logic ---

        /**
         * Renders the sales data based on the current filters (date range and product search).
         */
        function renderFilteredData() {
            let filteredData = allSalesData;
            
            const startDateValue = currentFilters.startDate; // YYYY-MM-DD
            const endDateValue = currentFilters.endDate;     // YYYY-MM-DD
            const productSearchTerm = currentFilters.product;

            // 1. Apply Date Range Filter
            if (startDateValue || endDateValue) {
                // Parse filter inputs and normalize to midnight for comparison
                const targetStartDate = startDateValue ? new Date(startDateValue) : null;
                if (targetStartDate) targetStartDate.setHours(0, 0, 0, 0);

                const targetEndDate = endDateValue ? new Date(endDateValue) : (targetStartDate || null); 
                // If only start date is set, end date equals start date (single-day filter)
                if (targetEndDate) targetEndDate.setHours(0, 0, 0, 0); 

                filteredData = filteredData.filter(row => {
                    // row[0] is sheet string (e.g., "03/08/2025 10:00:00")
                    const sheetDate = createDateFromDDMMYYYYString(row[0]);
                    if (!sheetDate) return false;

                    // If both dates are set
                    if (targetStartDate && targetEndDate) {
                         // Must be >= Start Date AND <= End Date
                         return sheetDate.getTime() >= targetStartDate.getTime() && 
                                sheetDate.getTime() <= targetEndDate.getTime();
                    } 
                    // This case is implicitly covered above, but kept for clarity:
                    // If only start date is set, targetEndDate = targetStartDate, resulting in single-day match
                    return false; // Should not happen with current logic, but as fallback
                });
            }
            
            // 2. Apply Product Search Filter (No Change)
            if (productSearchTerm) {
                const term = productSearchTerm.toLowerCase();
                filteredData = filteredData.filter(row => {
                    const productId = row[1] ? String(row[1]).toLowerCase() : '';
                    const productName = row[2] ? String(row[2]).toLowerCase() : '';
                    
                    return productId.includes(term) || productName.includes(term);
                });
            }

            // 3. Sort the final filtered data
            const finalData = sortSalesData(filteredData);
            
            // 4. Render the results
            renderDataHTML(finalData);
        }

        // --- Filter Control Functions ---

        /**
         * NEW: Updates the date range filter (or single date filter) and triggers a re-render.
         */
        function applyDateRangeFilter() {
            const startDateInput = document.getElementById('date-filter-start');
            const endDateInput = document.getElementById('date-filter-end');
            
            currentFilters.startDate = startDateInput ? startDateInput.value.trim() : '';
            currentFilters.endDate = endDateInput ? endDateInput.value.trim() : '';

            renderFilteredData();
        }
        
        /**
         * Updates the product search term and triggers a re-render.
         * (No Change, but function name is now accurate)
         */
        function applyProductSearch() {
            const searchInput = document.getElementById('product-search');
            currentFilters.product = searchInput ? searchInput.value.trim() : '';
            renderFilteredData();
        }

        // --- Data Fetching (No Change) ---
        // ... (fetchDataAndRender remains the same)

        async function fetchDataAndRender() {
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
                        allSalesData = data.values; 
                        renderFilteredData(); 
                        if (searchInput) searchInput.disabled = false; 
                    } else {
                        dataContainer.innerHTML = `<div class="header-card alert alert-warning" role="alert" style="border-left: 4px solid #f59e0b;">
                            <strong>No Data Found.</strong> The 'Sell' sheet appears to be empty or the range is incorrect.
                        </div>`;
                    }
                    return; // Success
                } catch (error) {
                    console.error(`Attempt ${i + 1} failed:`, error);
                    if (i === MAX_RETRIES - 1) {
                        if (loadingIndicator) loadingIndicator.classList.add('hidden');
                        dataContainer.innerHTML = `
                            <div class="header-card alert alert-error" role="alert" style="border-top: 4px solid #ef4444;">
                                <strong>Error!</strong> Failed to load sales data. Check API Key or Sheet ID/Range: ${SHEET_RANGE}.
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


        // --- HTML Rendering (MODIFIED) ---

        /**
         * Generates and inserts the HTML structure for the filtered sales data, and displays total quantity.
         */
        function renderDataHTML(data) {
            const dataContainer = document.getElementById('data-container');
            const totalQuantityValueSpan = document.getElementById('total-quantity-value');

            // NEW: Calculate and display total quantity
            const totalQuantity = calculateTotalQuantity(data);
            if (totalQuantityValueSpan) {
                totalQuantityValueSpan.textContent = totalQuantity.toLocaleString(); // Add locale string for number formatting
            }
            
            // Check for no results after filtering
            if (!data || data.length === 0) {
                let message = 'No sales records found.';
                if (currentFilters.startDate || currentFilters.endDate || currentFilters.product) {
                    message = 'No records match the current filters.';
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
            const header = ['Date', 'Product ID', 'Product Name', 'Sold QTY'];
            
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
                // Indices: Date=0, Product ID=1, Product Name=2, Quantity=3
                const date = formatDateDisplay(row[0]);
                // Apply the Bangla date formatting from your user settings if the date is displayed in a google sheet.
                // Since the date formatting happens client-side and is a complex feature based on a Google Sheet input, 
                // I will apply the date as is, and keep the original logic for now, as it's not clear which date should be translated.
                // If you want me to translate the final rendered `date` value into Bangla text, let me know!
                const productId = row[1] ? String(row[1]).trim() : 'N/A';
                const productName = row[2] ? String(row[2]).trim() : 'N/A';
                const quantity = row[3] ? String(row[3]).trim() : '0';

                tableHTML += `
                    <tr>
                        <td>${date}</td>
                        <td>${productId}</td>
                        <td class="font-semibold">${productName}</td>
                        <td class="text-blue font-bold">${quantity}</td>
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
                // Indices: Date=0, Product ID=1, Product Name=2, Quantity=3
                const date = formatDateDisplay(row[0]);
                const productId = row[1] ? String(row[1]).trim() : 'N/A';
                const productName = row[2] ? String(row[2]).trim() : 'N/A';
                const quantity = row[3] ? String(row[3]).trim() : '0';

                cardHTML += `
                    <div class="data-card-mobile">
                        <div class="card-row card-row-header">
                            <span class="font-bold">${productName}</span>
                            <span class="value text-green font-bold" style="color: red; font-weight:bold">${quantity}</span>
                        </div>
                        <div class="card-row">
                             <span class="label">Date:</span>
                            <span class="value">${date}</span>
                        </div>
                        </div>
                `;
            });

            cardHTML += `
                </div>
            `;

            dataContainer.innerHTML = tableHTML + cardHTML;
        }

        // --- Initialization and Event Setup (MODIFIED) ---
        window.addEventListener('load', function() {
            
            initializeLayout('view-sell-standalone'); 
            
            fetchDataAndRender();
            
            // 3. Setup event handlers for filtering (MODIFIED)
            const startDateInput = document.getElementById('date-filter-start');
            const endDateInput = document.getElementById('date-filter-end');
            const clearFilterBtn = document.getElementById('clear-filter-btn');
            const productSearchInput = document.getElementById('product-search'); 

            // Use the new function for both date inputs
            startDateInput.addEventListener('change', applyDateRangeFilter);
            endDateInput.addEventListener('change', applyDateRangeFilter);

            clearFilterBtn.addEventListener('click', () => {
                startDateInput.value = ''; // Clear start date input
                endDateInput.value = '';   // Clear end date input
                currentFilters.startDate = ''; // Clear state
                currentFilters.endDate = '';   // Clear state
                
                if (productSearchInput) productSearchInput.value = ''; 
                currentFilters.product = ''; 
                
                renderFilteredData(); // Trigger full re-render
            });

            if (productSearchInput) {
                productSearchInput.addEventListener('keyup', applyProductSearch);
            }
        });