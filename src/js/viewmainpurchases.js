// API Configuration (No Change)
        const API_KEY = "AIzaSyD7eX6VGCDHXBzF63CAHDfaP1-WFp3jcoI";
        const SHEET_ID = "1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng";
        // CRITICAL: Updated sheet name to 'Purchase' and using range A2:D
        const SHEET_RANGE = "Main Purchases!A2:D"; // Date, Product ID, Product Name, Quantity (4 columns)
        const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`;
        const MAX_RETRIES = 5;

        // Global variable to hold the full, unfiltered purchase data
        let allPurchaseData = [];
        
        // MODIFIED: Global variable to track the current active filters
        let currentFilters = {
            startDate: '', // YYYY-MM-DD from input
            endDate: '',   // YYYY-MM-DD from input
            product: ''    // Search term
        };


        /**
         * Utility function to format numbers for display.
         * Using standard 'en-US' locale for general clarity.
         * @param {string|number} number The quantity value.
         * @returns {string} The formatted number.
         */
        function formatNumber(number) {
            const num = Number(number);
            if (isNaN(num)) return String(number);
            // Use standard US formatting (optional comma grouping)
            return new Intl.NumberFormat('en-US').format(num); 
        }
        
        /**
         * Utility function to safely parse a DD/MM/YYYY formatted string (with time) into a Date object, 
         * normalized to midnight (00:00:00) for accurate date comparisons. (MODIFIED)
         * @param {string} dateString The full date string from the spreadsheet (DD/MM/YYYY HH:MM:SS).
         * @returns {Date | null} A correctly parsed Date object, normalized to midnight, or null on failure.
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
            
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                const date = new Date(year, month - 1, day); 
                date.setHours(0, 0, 0, 0); // Normalize time for accurate date range comparison
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
         * Custom sort function for purchase data: Sort by Date (most recent first).
         * (No Change)
         */
        function sortPurchaseData(data) {
            if (!data || data.length === 0) return [];
            
            return data.sort((a, b) => {
                // Safely parse dates for accurate comparison.
                const dateA = createDateFromDDMMYYYYString(a[0])?.getTime() || 0; 
                const dateB = createDateFromDDMMYYYYString(b[0])?.getTime() || 0; 

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
         * NEW: Calculates the total purchased quantity for the displayed data.
         * @param {Array<Array<string>>} data The filtered purchase data.
         * @returns {number} The total quantity.
         */
        function calculateTotalQuantity(data) {
            return data.reduce((total, row) => {
                // row[3] is Quantity
                const quantity = parseInt(row[3], 10);
                return total + (isNaN(quantity) ? 0 : quantity);
            }, 0);
        }

        // --- Data Filtering Logic (MODIFIED) ---

        /**
         * Renders the purchase data based on the current filters (date range and product search).
         */
        function renderFilteredData() {
            let filteredData = allPurchaseData;
            
            const startDateValue = currentFilters.startDate; // YYYY-MM-DD
            const endDateValue = currentFilters.endDate;     // YYYY-MM-DD
            const productSearchTerm = currentFilters.product;

            // 1. Apply Date Range Filter (NEW LOGIC)
            if (startDateValue || endDateValue) {
                // Parse filter inputs and normalize to midnight for comparison
                const targetStartDate = startDateValue ? new Date(startDateValue) : null;
                if (targetStartDate) targetStartDate.setHours(0, 0, 0, 0);

                // If only start date is set, end date equals start date (single-day filter)
                const targetEndDate = endDateValue ? new Date(endDateValue) : (targetStartDate || null); 
                if (targetEndDate) targetEndDate.setHours(0, 0, 0, 0); 

                filteredData = filteredData.filter(row => {
                    // row[0] is sheet string (e.g., "03/08/2025 10:00:00")
                    const sheetDate = createDateFromDDMMYYYYString(row[0]);
                    if (!sheetDate) return false;

                    // Ensure sheet date is between start and end (inclusive)
                    if (targetStartDate && targetEndDate) {
                         return sheetDate.getTime() >= targetStartDate.getTime() && 
                                sheetDate.getTime() <= targetEndDate.getTime();
                    } 
                    return false; 
                });
            }
            
            // 2. Apply Product Search Filter (No Change)
            if (productSearchTerm) {
                const term = productSearchTerm.toLowerCase();
                filteredData = filteredData.filter(row => {
                    // Row[1] is Product ID, Row[2] is Product Name
                    const productId = row[1] ? String(row[1]).toLowerCase() : '';
                    const productName = row[2] ? String(row[2]).toLowerCase() : '';
                    
                    // Match against Product ID OR Product Name
                    return productId.includes(term) || productName.includes(term);
                });
            }

            // 3. Sort the final filtered data
            const finalData = sortPurchaseData(filteredData);
            
            // 4. Render the results
            renderDataHTML(finalData);
        }

        // --- Filter Control Functions (MODIFIED) ---

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
         * (Renamed for clarity, but logic is same as before)
         */
        function applyProductSearch() {
            const searchInput = document.getElementById('product-search');
            currentFilters.product = searchInput ? searchInput.value.trim() : '';
            renderFilteredData();
        }

        // --- Data Fetching (Renamed for clarity) ---

        async function fetchPurchaseDataAndRender() {
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
                        allPurchaseData = data.values; 
                        renderFilteredData(); // Render all initially
                        if (searchInput) searchInput.disabled = false;
                    } else {
                        dataContainer.innerHTML = `<div class="header-card alert alert-warning" role="alert" style="border-left: 4px solid #f59e0b;">
                            <strong>No Data Found.</strong> The 'Main Purchases' sheet appears to be empty or the range is incorrect.
                        </div>`;
                    }
                    return; // Success
                } catch (error) {
                    console.error(`Attempt ${i + 1} failed:`, error);
                    if (i === MAX_RETRIES - 1) {
                        if (loadingIndicator) loadingIndicator.classList.add('hidden');
                        dataContainer.innerHTML = `
                            <div class="header-card alert alert-error" role="alert" style="border-top: 4px solid #ef4444;">
                                <strong>Error!</strong> Failed to load purchase data. Check API Key or Sheet ID/Range: ${SHEET_RANGE}.
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
         * Generates and inserts the HTML structure for the filtered purchase data, and displays total quantity.
         */
        function renderDataHTML(data) {
            const dataContainer = document.getElementById('data-container');
            const totalQuantityValueSpan = document.getElementById('total-quantity-value'); // NEW ID

            // NEW: Calculate and display total quantity
            const totalQuantity = calculateTotalQuantity(data);
            if (totalQuantityValueSpan) {
                totalQuantityValueSpan.textContent = totalQuantity.toLocaleString(); 
            }
            
            // Check for no results after filtering
            if (!data || data.length === 0) {
                let message = 'No purchase records found.';
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
            const header = ['Date', 'Product ID', 'Product Name', 'Purchased QTY'];
            
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
                const productId = row[1] ? String(row[1]).trim() : 'N/A';
                const productName = row[2] ? String(row[2]).trim() : 'N/A';
                const quantity = row[3] ? formatNumber(row[3]).trim() : '0';

                tableHTML += `
                    <tr>
                        <td>${date}</td>
                        <td>${productId}</td>
                        <td class="font-semibold">${productName}</td>
                        <td class="text-green font-bold">${quantity}</td>
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
                const quantity = row[3] ? formatNumber(row[3]).trim() : '0';

                cardHTML += `
                    <div class="data-card-mobile">
                        <div class="card-row card-row-header">
                            <span class="font-bold">${productName}</span>
                            <span class="value text-green font-bold" style="color: green; font-weight:bold">${quantity}</span>
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
            // 1. Initialize the layout
            if (typeof initializeLayout === 'function') {
                initializeLayout('view-main-purchase-standalone'); 
            } else {
                console.warn("initializeLayout function not found. Skipping layout initialization.");
            }
            
            // 2. Fetch and render data
            fetchPurchaseDataAndRender();
            
            // 3. Setup event handlers for filtering (MODIFIED)
            const startDateInput = document.getElementById('date-filter-start');
            const endDateInput = document.getElementById('date-filter-end');
            const clearFilterBtn = document.getElementById('clear-filter-btn');
            const productSearchInput = document.getElementById('product-search'); 

            // Use the new function for both date inputs
            if (startDateInput) startDateInput.addEventListener('change', applyDateRangeFilter);
            if (endDateInput) endDateInput.addEventListener('change', applyDateRangeFilter);

            if (clearFilterBtn) clearFilterBtn.addEventListener('click', () => {
                if (startDateInput) startDateInput.value = ''; // Clear start date input
                if (endDateInput) endDateInput.value = '';   // Clear end date input
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