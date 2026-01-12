        const apiKey = 'AIzaSyDTvwDm19m-xtkMuALsspEJB-NNYV0kdUg';
        const sheetId = '1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng';
        const todayDateGlobal = getTodayDate();

        function getTodayDate() {
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            return `${day}/${month}/${year}`;
        }

        async function fetchData(range) {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                return data.values || [];
            } catch (error) {
                console.error(`Error fetching data for range ${range}:`, error);
                return [];
            }
        }
        
        function parseDateString(dateString) {
            if (!dateString) return null;
            dateString = dateString.trim().replace(',', '');
            const parts = dateString.split(/\s+/);
            if (parts.length < 2) return null;

            const datePart = parts[0];
            let timePart = parts[1];
            let amPm = parts.length > 2 ? parts[2].toUpperCase() : '';

            const [day, month, year] = datePart.split('/').map(Number);
            if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

            let [hours, minutes, seconds] = timePart.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
                hours = 0; minutes = 0; seconds = 0;
            }

            if (amPm === 'PM' && hours < 12) hours += 12;
            if (amPm === 'AM' && hours === 12) hours = 0;
            
            return new Date(year, month - 1, day, hours, minutes, seconds);
        }

        async function calculateTotalRemainingQty() {
            const inventoryData = await fetchData('Stock!A2:H');
            let totalQty = 0;

            if (Array.isArray(inventoryData) && inventoryData.length > 0) {
                totalQty = inventoryData.reduce((sum, item) => {
                    const qty = parseInt(item[5]) || 0;
                    return sum + qty;
                }, 0);
            }
            
            document.getElementById('totalRemainingQty').textContent = totalQty.toLocaleString();
        }

        async function calculateTodaySales() {
            const sellData = await fetchData('Sell!A2:F');
            let totalSalesAmount = 0;
            let totalSalesQty = 0;
            let productSales = {};

            if (Array.isArray(sellData) && sellData.length > 0) {
                sellData.forEach(row => {
                    const dateString = row[0] || '';
                    const productName = row[2] || 'N/A';
                    const quantity = parseInt(row[3]) || 0;
                    const amount = parseFloat(row[5]) || 0;

                    if (dateString.startsWith(todayDateGlobal)) {
                        totalSalesAmount += amount;
                        totalSalesQty += quantity;
                        productSales[productName] = (productSales[productName] || 0) + quantity;
                    }
                });

                let mostSoldName = 'N/A';
                let mostSoldQty = 0;
                for (const name in productSales) {
                    if (productSales[name] > mostSoldQty) {
                        mostSoldQty = productSales[name];
                        mostSoldName = name;
                    }
                }
                
                document.getElementById('mostSoldProductName').textContent = mostSoldName;
                document.getElementById('mostSoldProductQty').textContent = `${mostSoldQty} pieces sold`;
            }
            
            document.getElementById('todaySellTotal').textContent = `৳ ${totalSalesAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            document.getElementById('todaySellQty').textContent = totalSalesQty.toLocaleString();
        }

        async function getStockoutRiskProducts() {
            const inventoryData = await fetchData('Stock!A2:H');
            if (!Array.isArray(inventoryData) || inventoryData.length === 0) return [];

            const productsWithStock = inventoryData
                .map(row => {
                    const stockQty = parseInt(row[5]) || 0;
                    if (stockQty > 0) {
                        return { name: row[1] || 'Unknown Product', stock: stockQty };
                    }
                    return null;
                })
                .filter(product => product !== null);

            productsWithStock.sort((a, b) => a.stock - b.stock);
            return productsWithStock.slice(0, 20);
        }

        async function getTodaySoldProducts(sortOrder) {
            const sellData = await fetchData('Sell!A2:F');
            if (!Array.isArray(sellData) || sellData.length === 0) return [];

            const todaySales = sellData.filter(row => (row[0] || '').startsWith(todayDateGlobal));
            
            const productSalesMap = todaySales.reduce((acc, row) => {
                const productName = row[2] || 'N/A';
                const quantity = parseInt(row[3]) || 0;
                acc[productName] = (acc[productName] || 0) + quantity;
                return acc;
            }, {});

            const productSalesArray = Object.keys(productSalesMap).map(name => ({
                name: name,
                quantity: productSalesMap[name]
            }));

            if (sortOrder === 'top') {
                productSalesArray.sort((a, b) => b.quantity - a.quantity);
            } else {
                productSalesArray.sort((a, b) => a.quantity - b.quantity);
            }

            return productSalesArray.slice(0, 5);
        }

        async function getMonthTopProducts() {
            const sellData = await fetchData('Sell!A2:F');
            if (!Array.isArray(sellData) || sellData.length === 0) return [];

            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();

            const monthSales = sellData.filter(row => {
                const date = parseDateString(row[0]);
                return date && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            });
            
            const productSalesMap = monthSales.reduce((acc, row) => {
                const productName = row[2] || 'N/A';
                const quantity = parseInt(row[3]) || 0;
                acc[productName] = (acc[productName] || 0) + quantity;
                return acc;
            }, {});

            const productSalesArray = Object.keys(productSalesMap).map(name => ({
                name: name,
                quantity: productSalesMap[name]
            }));

            productSalesArray.sort((a, b) => b.quantity - a.quantity);
            return productSalesArray.slice(0, 20);
        }

        function renderList(containerId, loadingId, products, qtyClass) {
            const loadingText = document.getElementById(loadingId);
            const container = document.getElementById(containerId);
            
            if (loadingText) loadingText.style.display = 'none';
            container.innerHTML = '';

            if (products.length > 0) {
                products.forEach((product, index) => {
                    const item = document.createElement('li');
                    item.className = 'list-item';

                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'product-name-list';
                    nameSpan.textContent = `${index + 1}. ${product.name}`;

                    const qtySpan = document.createElement('span');
                    qtySpan.className = `product-qty-list ${qtyClass}`;
                    qtySpan.textContent = `Pcs: ${product.quantity !== undefined ? product.quantity : product.stock}`;

                    item.appendChild(nameSpan);
                    item.appendChild(qtySpan);
                    container.appendChild(item);
                });
            } else {
                const noData = document.createElement('li');
                noData.textContent = 'No data available.';
                noData.style.padding = '10px';
                noData.style.textAlign = 'center';
                noData.style.color = '#4b5563';
                container.appendChild(noData);
            }
        }

        async function displayLists() {
            const riskProducts = await getStockoutRiskProducts();
            renderList('stockout-risk-list', 'stockout-loading-text', riskProducts, 'stockout-qty');

            const top5Products = await getTodaySoldProducts('top');
            renderList('top-products', 'top-5-loading-text', top5Products, 'top-qty');

            const bottom5Products = await getTodaySoldProducts('bottom');
            renderList('bottom-5-products', 'bottom-5-loading-text', bottom5Products, 'bottom-qty');

            const monthTopProducts = await getMonthTopProducts();
            renderList('month-top-products', 'month-top-loading-text', monthTopProducts, 'month-qty');
        }

        async function renderStockTotalChart() {
            const stockData = await fetchData('Stock!A2:H');
            if (!Array.isArray(stockData) || stockData.length < 1) return;

            let totalPurchases = 0;
            let totalSells = 0;
            let totalRemaining = 0;

            stockData.forEach(row => {
                totalPurchases += parseFloat(row[3]) || 0;
                totalSells += parseFloat(row[4]) || 0;
                totalRemaining += parseFloat(row[5]) || 0;
            });

            const ctx = document.getElementById('stockTotalChart').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Total Purchases', 'Total Sells', 'Remaining Stock'],
                    datasets: [{
                        data: [totalPurchases, totalSells, totalRemaining],
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)'
                        ],
                        borderColor: [
                            'rgba(59, 130, 246, 1)',
                            'rgba(16, 185, 129, 1)',
                            'rgba(245, 158, 11, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: { size: 12 }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        },
                        datalabels: {
                            color: '#fff',
                            font: { weight: 'bold', size: 14 },
                            formatter: (value) => value.toFixed(0)
                        }
                    }
                },
                plugins: [ChartDataLabels]
            });
        }

        async function renderDailySalesChart() {
            const sellData = await fetchData('Sell!A2:F');
            if (!Array.isArray(sellData) || sellData.length === 0) return;

            const dailySales = {};
            const today = new Date();
            
            for (let i = 29; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateKey = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                dailySales[dateKey] = 0;
            }

            sellData.forEach(row => {
                const dateString = row[0] || '';
                const datePart = dateString.split(',')[0].trim();
                const quantity = parseInt(row[3]) || 0;
                
                if (dailySales.hasOwnProperty(datePart)) {
                    dailySales[datePart] += quantity;
                }
            });

            const labels = Object.keys(dailySales).map(date => {
                const parts = date.split('/');
                return `${parts[0]}/${parts[1]}`;
            });
            const values = Object.values(dailySales);

            const ctx = document.getElementById('dailySalesChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Daily Sales Quantity (Pcs)',
                        data: values,
                        borderColor: 'rgba(16, 185, 129, 1)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'top' },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return 'Quantity Sold: ' + context.parsed.y + ' pcs';
                                }
                            }
                        },
                        datalabels: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Quantity (Pieces)' },
                            ticks: {
                                callback: function(value) {
                                    return value + ' pcs';
                                }
                            }
                        },
                        x: {
                            title: { display: true, text: 'Date' },
                            ticks: {
                                maxRotation: 45,
                                minRotation: 45
                            }
                        }
                    }
                }
            });
        }

        let productsData = [];
        let myChart;

        async function fetchDataFromSheet() {
            const data = await fetchData('Stock!A2:H');
            productsData = data;
            return productsData;
        }

        function populateDropdown() {
            const select = document.getElementById('product-select');
            select.innerHTML = '';

            const defaultOption = document.createElement('option');
            defaultOption.value = 'all-products';
            defaultOption.textContent = 'All Products Summary';
            select.appendChild(defaultOption);

            productsData.forEach(product => {
                const option = document.createElement('option');
                option.value = product[1];
                option.textContent = product[1];
                select.appendChild(option);
            });
        }

        function calculateTotalValues(data) {
            return data.reduce((totals, row) => {
                totals.purchase += parseInt(row[3]) || 0;
                totals.sell += parseInt(row[4]) || 0;
                totals.remaining += parseInt(row[5]) || 0;
                return totals;
            }, { purchase: 0, sell: 0, remaining: 0 });
        }

        function updateTable(purchase, sell, remaining) {
            document.getElementById('table-purchase').textContent = purchase;
            document.getElementById('table-sell').textContent = sell;
            document.getElementById('table-remaining').textContent = remaining;
        }
        
        function renderChart(labels, purchasesData, sellsData, remainingData) {
            const ctx = document.getElementById('stock-table-bar-chart').getContext('2d');
            
            if (myChart) myChart.destroy();

            myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Purchases',
                            backgroundColor: 'rgba(59, 130, 246, 0.7)',
                            borderColor: 'rgba(59, 130, 246, 1)',
                            borderWidth: 2,
                            data: purchasesData
                        },
                        {
                            label: 'Sells',
                            backgroundColor: 'rgba(16, 185, 129, 0.7)',
                            borderColor: 'rgba(16, 185, 129, 1)',
                            borderWidth: 2,
                            data: sellsData
                        },
                        {
                            label: 'Remaining',
                            backgroundColor: 'rgba(245, 158, 11, 0.7)',
                            borderColor: 'rgba(245, 158, 11, 1)',
                            borderWidth: 2,
                            data: remainingData
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: { mode: 'index', intersect: false },
                        datalabels: { display: false }
                    },
                    scales: {
                        x: { stacked: false },
                        y: { beginAtZero: true, title: { display: true, text: 'Quantity' } }
                    }
                }
            });
        }

        function renderProductData(selectedProduct) {
            if (selectedProduct === 'all-products') {
                const totals = calculateTotalValues(productsData);
                updateTable(totals.purchase, totals.sell, totals.remaining);

                renderChart(
                    productsData.map(product => product[1]),
                    productsData.map(product => parseInt(product[3]) || 0),
                    productsData.map(product => parseInt(product[4]) || 0),
                    productsData.map(product => parseInt(product[5]) || 0)
                );
            } else {
                const product = productsData.find(p => p[1] === selectedProduct);
                if (product) {
                    const purchase = parseInt(product[3]) || 0;
                    const sell = parseInt(product[4]) || 0;
                    const remaining = parseInt(product[5]) || 0;
                    
                    updateTable(purchase, sell, remaining);
                    
                    renderChart(
                        [selectedProduct],
                        [purchase],
                        [sell],
                        [remaining]
                    );
                }
            }
        }

        document.addEventListener('DOMContentLoaded', async () => {
            calculateTotalRemainingQty();
            calculateTodaySales();
            await displayLists();

            renderStockTotalChart();
            renderDailySalesChart();
            
            await fetchDataFromSheet();
            populateDropdown();
            renderProductData('all-products');

            document.getElementById('product-select').addEventListener('change', function() {
                renderProductData(this.value);
            });
        });