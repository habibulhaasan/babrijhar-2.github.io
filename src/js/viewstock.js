// API Configuration
        const API_KEY = "AIzaSyD7eX6VGCDHXBzF63CAHDfaP1-WFp3jcoI";
        const SHEET_ID = "1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng";
        // *** NEW RANGE for Stock sheet and A2:F range ***
        const SHEET_RANGE = "Stock!A2:F"; // Product ID(A), Product Name(B), Generic Name(C), Purchase QTY(D), Sell QTY(E), Remaining QTY(F)
        const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`;
        const MAX_RETRIES = 5;
        const LOW_STOCK_THRESHOLD = 20; // This threshold is no longer used for coloring but remains for reference.

        // Global variable to store all fetched data for filtering
        let allProducts = []; 
        
        // Simple utility to parse number or default to 0
        function parseQty(value) {
            const num = parseFloat(value);
            return isNaN(num) ? 0 : num;
        }

        // --- Custom Sorting Logic ---
        // Function to assign an order priority based on product name keywords
        function getProductTypeOrder(productName) {
            const name = productName ? String(productName).toLowerCase() : '';
            
            // Priority 0: Tablet
            if (name.includes('tab.')) return 0; 
            
            // Priority 1: Capsule
            if (name.includes('cap.')) return 1; 
            
            // Priority 2: Syrup
            if (name.includes('syp.')) return 2; 
            
            // Priority 3: Other products
            return 3; 
        }

        // Function to process and sort the data
        function processStockData(data) {
            if (!data || data.length === 0) return [];

            return data.sort((a, b) => {
                const nameA = a[1] ? String(a[1]).trim() : '';
                const nameB = b[1] ? String(b[1]).trim() : '';

                const orderA = getProductTypeOrder(nameA);
                const orderB = getProductTypeOrder(nameB);

                // 1. Sort by custom type order (0, 1, 2, 3)
                if (orderA !== orderB) {
                    return orderA - orderB;
                }

                // 2. If types are the same, sort alphabetically by product name
                return nameA.localeCompare(nameB);
            });
        }
        // --- End Custom Sorting Logic ---


        // --- NEW SEARCH LOGIC ---

        /**
         * Filters the global stock data based on the search bar input and re-renders the view.
         */
        function filterData() {
            const searchInput = document.getElementById('product-search');
            // Check if search bar is ready and allProducts has data
            if (!searchInput || allProducts.length === 0) return; 

            const searchTerm = searchInput.value.toLowerCase().trim();

            if (searchTerm === '') {
                // If search term is empty, display all sorted products
                renderData(processStockData(allProducts));
                return;
            }

            // Filter the products
            const filteredProducts = allProducts.filter(row => {
                // Indices: Product ID (0), Product Name (1)
                const productId = row[0] ? String(row[0]).toLowerCase() : '';
                const productName = row[1] ? String(row[1]).toLowerCase() : '';

                // Match against Product ID OR Product Name
                return productId.includes(searchTerm) || productName.includes(searchTerm);
            });

            // Display the filtered and sorted results
            renderData(processStockData(filteredProducts));
        }

        // --- END NEW SEARCH LOGIC ---


        // Function to fetch data from Google Sheets API with exponential backoff
        async function fetchStockData() {
            const dataContainer = document.getElementById('data-container');
            const loadingIndicator = document.getElementById('loading-indicator');
            const searchInput = document.getElementById('product-search');

            // Show loading and disable search
            if (loadingIndicator) loadingIndicator.classList.remove('hidden');
            if (searchInput) searchInput.disabled = true;
            dataContainer.innerHTML = ''; // Clear previous content

            for (let i = 0; i < MAX_RETRIES; i++) {
                try {
                    const response = await fetch(API_URL);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    
                    if (loadingIndicator) loadingIndicator.classList.add('hidden');
                    
                    if (data.values) {
                        // Store the raw data globally
                        allProducts = data.values; 
                        
                        // Initial render of all products (sorted)
                        renderData(processStockData(allProducts)); 
                        
                        // Enable the search bar once data is loaded
                        if (searchInput) searchInput.disabled = false;
                    } else {
                        renderData(null); // Handle case where 'values' is missing
                    }
                    return; // Success
                } catch (error) {
                    console.error(`Attempt ${i + 1} failed:`, error);
                    if (i === MAX_RETRIES - 1) {
                        if (loadingIndicator) loadingIndicator.classList.add('hidden');
                        dataContainer.innerHTML = `
                            <div class="alert alert-error" role="alert">
                                <strong>Error!</strong> Failed to load stock data.
                                <p>Please check the API Key, Sheet ID, or Range: ${SHEET_RANGE}.</p>
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

        // Function to render the fetched/filtered data
        function renderData(data) {
            const dataContainer = document.getElementById('data-container');
            
            // If data is null or empty, display a warning
            if (!data || data.length === 0) {
                 const searchInput = document.getElementById('product-search');
                 const searchMessage = searchInput && searchInput.value.trim() !== '' 
                    ? `No products match your search term: <strong>${searchInput.value}</strong>.`
                    : 'No Stock Data Found. Please check your sheet range or data entries.';
                    
                dataContainer.innerHTML = `
                    <div class="alert alert-warning" role="alert">
                        <strong>Data Not Found</strong>
                        <p>${searchMessage}</p>
                    </div>
                `;
                return;
            }

            // Headers for display (A, B, D, E, F) - Generic Name (C) is now skipped
            const header = ['Product ID', 'Product Name', 'Purchased QTY', 'Sold QTY', 'Remaining QTY'];
            
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
                // Indices: A=0, B=1, C=2 (SKIPPED), D=3, E=4, F=5
                const productId = row[0] ? String(row[0]).trim() : 'N/A';
                const productName = row[1] ? String(row[1]).trim() : 'N/A';
                // Generic Name (row[2]) is skipped
                const purchaseQty = parseQty(row[3]);
                const sellQty = parseQty(row[4]);
                const remainingQty = parseQty(row[5]);

                // Remaining QTY is styled by .qty-remaining (blue) and bold if zero
                const remainingQtyClass = remainingQty === 0
                    ? 'font-bold' // Highlight 0 stock strongly
                    : '';

                tableHTML += `
                    <tr>
                        <td>${productId}</td>
                        <td class="font-semibold">${productName}</td>
                        <td>${purchaseQty}</td>
                        <td>${sellQty}</td>
                        <td class="qty-remaining ${remainingQtyClass}">${remainingQty}</td>
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
                const productId = row[0] ? String(row[0]).trim() : 'N/A';
                const productName = row[1] ? String(row[1]).trim() : 'N/A';
                // Generic Name (row[2]) is skipped
                const purchaseQty = parseQty(row[3]);
                const sellQty = parseQty(row[4]);
                const remainingQty = parseQty(row[5]);
                
                // Remaining QTY is styled by .qty-remaining (blue) and bold if zero
                const remainingQtyClass = remainingQty === 0
                    ? 'font-bold'
                    : '';

                cardHTML += `
                    <div class="data-card-mobile">
                        <div class="card-row card-row-header">
                            <span class="font-bold">${productName}</span>
                            <span class="value qty-remaining ${remainingQtyClass}">${remainingQty}</span>
                        </div>
                    </div>
                `;
            });

            cardHTML += `
                </div>
            `;

            dataContainer.innerHTML = tableHTML + cardHTML;
        }

        // Initialize data fetching on load
        window.onload = fetchStockData;