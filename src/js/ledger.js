const apiKey = "AIzaSyD7eX6VGCDHXBzF63CAHDfaP1-WFp3jcoI";
const spreadsheetId = "1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng";
const productRange = "Products!B2:C";
const sellRange = "Sell!A2:F";
const purchaseRange = "Purchases!A2:F";

document.addEventListener('DOMContentLoaded', () => {
    fetchProductNames();
    fetchYears();
});

// ---------- PRODUCT FETCH ----------
function fetchProductNames() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${productRange}?key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            populateProductList(data.values);
        })
        .catch(error => console.error('Error fetching product data:', error));
}

// NEW UTILITY FUNCTION for custom sorting logic
/**
 * Assigns a numerical priority based on product type keywords.
 * Priority order: 1 (Tab.), 2 (Cap.), 3 (Syp.), 4 (Other).
 * Lower number means higher priority (comes first).
 * @param {string} productName The product name string (row[1]).
 * @returns {number} The priority order.
 */
function getProductTypeOrder(productName) {
    if (!productName) return 99; // Handles empty names
    const name = productName.toLowerCase();

    // 1. Tablet (Tab.) - Highest Priority
    if (name.includes('tab.')) return 1;

    // 2. Capsule (Cap.)
    if (name.includes('cap.')) return 2;

    // 3. Syrup (Syp.)
    if (name.includes('syp.')) return 3;

    // 4. Other Products - Lowest Priority
    return 4;
}

function populateProductList(data) {
    const productList = document.getElementById('productList');
    const productDropdown = document.getElementById('productDropdown');
    productList.innerHTML = '';
    productDropdown.innerHTML = '<option value="">Select a product...</option>';

    // MODIFIED: Custom sort logic: First by type priority, then alphabetically.
    data.sort((a, b) => {
        const nameA = a[1] ? String(a[1]).trim() : '';
        const nameB = b[1] ? String(b[1]).trim() : '';
        
        const orderA = getProductTypeOrder(nameA);
        const orderB = getProductTypeOrder(nameB);

        // 1. Sort by custom type order (Ascending: 1, 2, 3, 4)
        if (orderA !== orderB) {
            return orderA - orderB;
        }

        // 2. If types are the same, sort alphabetically (Ascending A-Z)
        return nameA.localeCompare(nameB);
    });
    // --- End Custom Sort ---

    data.forEach(row => {
        const productId = row[0];
        const productName = row[1];

        // ---- Desktop List ----
        const item = document.createElement('div');
        item.textContent = productName;
        item.className = 'product-item';
        item.dataset.productId = productId;
        item.onclick = () => {
            document.querySelectorAll('.product-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            showLedger(productName, productId);
            productDropdown.value = productId; // sync dropdown with desktop selection
        };
        productList.appendChild(item);

        // ---- Mobile Dropdown ----
        const option = document.createElement('option');
        option.value = productId;
        option.textContent = productName;
        productDropdown.appendChild(option);
    });

    // Mobile dropdown change handler
    productDropdown.onchange = function () {
        const selectedId = this.value;
        if (!selectedId) return;
        const selectedName = this.options[this.selectedIndex].text;

        // Highlight in desktop list also
        document.querySelectorAll('.product-item').forEach(i => {
            i.classList.remove('selected');
            if (i.dataset.productId === selectedId) {
                i.classList.add('selected');
            }
        });

        showLedger(selectedName, selectedId);
    };
}

// search

// ---------- YEAR FETCH ----------
function fetchYears() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sellRange}?key=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const years = new Set();
            data.values.forEach(row => {
                const date = parseDate(row[0]);
                if (date) years.add(date.getFullYear());
            });

            const yearSelect = document.getElementById('yearSelect');
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching years:', error));
}

// ---------- FILTER BUTTON ----------
document.getElementById('filterButton').addEventListener('click', () => {
    const selectedMonth = document.getElementById('monthSelect').value;
    const selectedYear = document.getElementById('yearSelect').value;

    // Check desktop selection
    let selectedProduct = document.querySelector('.product-item.selected');
    let productId, productName;

    // If not selected on desktop, check mobile dropdown
    if (selectedProduct) {
        productId = selectedProduct.dataset.productId;
        productName = selectedProduct.textContent;
    } else {
        const dropdown = document.getElementById('productDropdown');
        if (dropdown.value) {
            productId = dropdown.value;
            productName = dropdown.options[dropdown.selectedIndex].text;
        }
    }

    if (productId && productName) {
        showLedger(productName, productId, selectedMonth, selectedYear);
    } else {
        alert('Please select a product first.');
    }
});

// ------------- REST OF YOUR CODE -------------
// (keep everything from showLedger() onwards unchanged)



// ---------- LEDGER ----------
function showLedger(productName, productId, selectedMonth = '', selectedYear = '') {
    document.getElementById('loading').style.display = 'block';

    Promise.all([
        fetchSheetData(sellRange, productId, 'sell'),
        fetchSheetData(purchaseRange, productId, 'purchase')
    ]).then(([sellData, purchaseData]) => {
        const filteredSellData = filterDataByDate(sellData, selectedMonth, selectedYear);
        const filteredPurchaseData = filterDataByDate(purchaseData, selectedMonth, selectedYear);

        let previousMonthTotalSell = 0;
        let previousMonthTotalPurchase = 0;
        let previousMonthRemainingQuantity = 0;
        let previousYearRemainingQuantity = 0;

        if (selectedMonth && selectedYear) {
            const previousMonth = selectedMonth == 1 ? 12 : selectedMonth - 1;
            const previousYear = selectedMonth == 1 ? selectedYear - 1 : selectedYear;

            const previousMonthSellData = filterDataByDate(sellData, previousMonth, previousYear);
            const previousMonthPurchaseData = filterDataByDate(purchaseData, previousMonth, previousYear);

            previousMonthTotalSell = previousMonthSellData.reduce((acc, { quantity }) => acc + quantity, 0);
            previousMonthTotalPurchase = previousMonthPurchaseData.reduce((acc, { quantity }) => acc + quantity, 0);

            if (previousMonthSellData.length || previousMonthPurchaseData.length) {
                const combinedPreviousMonthData = combineData(previousMonthSellData, previousMonthPurchaseData);
                if (combinedPreviousMonthData.length > 0) {
                    previousMonthRemainingQuantity = combinedPreviousMonthData[combinedPreviousMonthData.length - 1].remainingQuantity;
                }
            }

            const previousYearSellData = filterDataByDate(sellData, '', previousYear);
            const previousYearPurchaseData = filterDataByDate(purchaseData, '', previousYear);

            previousYearRemainingQuantity = previousYearPurchaseData.reduce((acc, { quantity }) => acc + quantity, 0) -
                previousYearSellData.reduce((acc, { quantity }) => acc + quantity, 0);
        }

        const ledgerData = combineData(filteredSellData, filteredPurchaseData, previousMonthRemainingQuantity, previousYearRemainingQuantity);

        let title = `<strong>${productName}</strong>`;
        if (selectedMonth && selectedYear) {
            const monthName = getMonthName(selectedMonth);
            title += ` | <strong>${monthName} ${selectedYear}</strong>`;
        } else if (selectedMonth) {
            const monthName = getMonthName(selectedMonth);
            title += ` | <strong>${monthName}</strong>`;
        } else if (selectedYear) {
            title += ` | <strong>${selectedYear}</strong>`;
        } else {
            title += ' | <strong>All Data</strong>';
        }

        if (ledgerData.length === 0 && previousMonthTotalSell === 0 && previousMonthTotalPurchase === 0) {
            document.getElementById('ledgerTitle').innerHTML = `
                <p style="text-align: center;">
                    ${title}<br><br><br><br><br>
                    <span>No data found</span>
                </p>
            `;
            document.getElementById('ledgerTable').style.display = 'none';
        } else {
            populateLedgerTable(ledgerData, productName, selectedMonth, selectedYear, {
                previousMonthTotalSell,
                previousMonthTotalPurchase,
                previousMonthRemainingQuantity
            });
            document.getElementById('ledgerTitle').innerHTML = title;
            document.getElementById('ledgerTable').style.display = 'table';
        }

        document.getElementById('loading').style.display = 'none';
    }).catch(error => {
        console.error('Error fetching data:', error);
        document.getElementById('loading').style.display = 'none';
    });
}

// ---------- COMBINE DATA ----------
function combineData(sellData, purchaseData, previousMonthRemainingQuantity = 0, previousYearRemainingQuantity = 0) {
    const combinedData = {};

    const addDataToCombined = (data, type) => {
        data.forEach(({ date, quantity }) => {
            if (!date) return; // skip invalid dates
            const dateKey = date.toLocaleDateString('en-GB');
            if (!combinedData[dateKey]) combinedData[dateKey] = { date: dateKey, sellQuantity: 0, purchaseQuantity: 0 };
            combinedData[dateKey][`${type}Quantity`] = (combinedData[dateKey][`${type}Quantity`] || 0) + quantity;
        });
    };

    addDataToCombined(sellData, 'sell');
    addDataToCombined(purchaseData, 'purchase');

    const dataArray = Object.values(combinedData).sort((a, b) => {
        const [aDay, aMonth, aYear] = a.date.split('/').map(Number);
        const [bDay, bMonth, bYear] = b.date.split('/').map(Number);
        return aYear - bYear || aMonth - bMonth || aDay - bDay;
    });

    let previousRemainingQuantity = previousMonthRemainingQuantity;
    let previousYearQuantity = previousYearRemainingQuantity;

    return dataArray.map(item => {
        const [day, month, year] = item.date.split('/').map(Number);
        const currentDate = new Date(year, month - 1, day);
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        let remainingQuantity = previousRemainingQuantity + item.purchaseQuantity - item.sellQuantity;

        if (currentMonth === 0) {
            remainingQuantity += previousYearQuantity;
            previousYearQuantity = remainingQuantity;
        }

        previousRemainingQuantity = remainingQuantity;

        return {
            ...item,
            remainingQuantity
        };
    });
}

// ---------- DATE HANDLING ----------
function parseDate(dateStr) {
    if (!dateStr) return null;

    // If format is yyyy-mm-dd or yyyy/mm/dd
    let match = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));

    // If format is dd/mm/yyyy (with optional time)
    match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));

    console.error('Invalid date string:', dateStr);
    return null;
}

function filterDataByDate(data, month, year) {
    return data.filter(({ date }) => {
        if (!date) return false;
        const matchesMonth = month ? (date.getMonth() + 1) === parseInt(month) : true;
        const matchesYear = year ? date.getFullYear() === parseInt(year) : true;
        return matchesMonth && matchesYear;
    });
}

// ---------- MONTH NAME ----------
function getMonthName(monthNumber) {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
    ];
    return monthNumber ? monthNames[monthNumber - 1] : 'All Months';
}

// ---------- SHEET DATA ----------
function fetchSheetData(range, productId, type) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            return data.values
                .filter(row => row[1] === productId)
                .map(row => ({
                    date: parseDate(row[0]),
                    quantity: parseFloat(row[3]) || 0
                }));
        });
}

// ---------- REST OF YOUR CODE ----------


function parseDate(dateStr) {
    const datePart = dateStr.split(',')[0];
    const [day, month, year] = datePart.split('/').map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
        console.error('Invalid date string:', dateStr);
        return null;
    }
    return new Date(year, month - 1, day);
}

function filterDataByDate(data, month, year) {
    return data.filter(({ date }) => {
        const matchesMonth = month ? (date.getMonth() + 1) === parseInt(month) : true;
        const matchesYear = year ? date.getFullYear() === parseInt(year) : true;
        return matchesMonth && matchesYear;
    });
}

function populateLedgerTable(ledgerData, productName, selectedMonth, selectedYear, previousMonthData) {
    const tableBody = document.getElementById('ledgerTable').getElementsByTagName('tbody')[0];
    const tfoot = document.getElementById('ledgerTable').getElementsByTagName('tfoot')[0];
    
    tableBody.innerHTML = '';
    tfoot.innerHTML = '';

    let previousMonth = selectedMonth - 1;
    let previousYear = selectedYear;

    if (previousMonth === 0) {
        previousMonth = 12;
        previousYear -= 1;
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const previousMonthName = monthNames[previousMonth - 1];

    let totalRemainingQuantity = previousMonthData ? previousMonthData.previousMonthRemainingQuantity : 0;

    if (selectedMonth && selectedYear && previousMonthData) {
        const previousMonthTotals = document.createElement('tr');
        previousMonthTotals.innerHTML = `
            <td>${previousMonthName}, ${previousYear}</td>
            <td><strong>${previousMonthData.previousMonthTotalSell.toFixed(0)}</strong></td>
            <td><strong>${previousMonthData.previousMonthTotalPurchase.toFixed(0)}</strong></td>
            <td><strong>${previousMonthData.previousMonthRemainingQuantity.toFixed(0)}</strong></td>
        `;
        tableBody.appendChild(previousMonthTotals);
    }

    let totalSell = 0;
    let totalPurchase = 0;

    ledgerData.forEach(row => {
        totalSell += row.sellQuantity;
        totalPurchase += row.purchaseQuantity;

        totalRemainingQuantity = totalRemainingQuantity + row.purchaseQuantity - row.sellQuantity;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.date}</td>
            <td>${row.sellQuantity.toFixed(0)}</td>
            <td>${row.purchaseQuantity.toFixed(0)}</td>
            <td>${totalRemainingQuantity.toFixed(0)}</td>
        `;
        tableBody.appendChild(tr);
    });

    const totalFooterRow = document.createElement('tr');
    totalFooterRow.innerHTML = `
        <td><strong>Total:</strong></td>
        <td><strong>${totalSell.toFixed(0)}</strong></td>
        <td><strong>${totalPurchase.toFixed(0)}</strong></td>
        <td><strong>${totalRemainingQuantity.toFixed(0)}</strong></td>
    `;
    tfoot.appendChild(totalFooterRow);
}

// Event listeners and additional functions for print and export
document.getElementById('printButton').addEventListener('click', printLedger);
document.getElementById('searchInput').addEventListener('input', searchProducts);

function searchProducts() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const productItems = document.querySelectorAll('.product-item');

    productItems.forEach(item => {
        const productName = item.textContent.toLowerCase();
        item.style.display = productName.includes(query) ? 'block' : 'none';
    });
}

// Print functionality implementation remains the same as in your original code
// Add the print and export functions here from your original code

function formatDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-GB');
}
function printLedger() {
    const printWindow = window.open('', '', 'height=600,width=800');
    const headerHtmlPromise = generatePrintHeader();

    // Fetch selected product name, month, and year
    const selectedProduct = document.querySelector('.product-item.selected');
    const productName = selectedProduct ? selectedProduct.textContent : 'Product Name';
    const selectedMonth = document.getElementById('monthSelect').value;
    const selectedYear = document.getElementById('yearSelect').value;
    const monthYearText = `<strong>${getMonthName(selectedMonth)} ${selectedYear}</strong>`;

    headerHtmlPromise.then(headerHtml => {
        const tableHtml = document.getElementById('ledgerTable').outerHTML;

        printWindow.document.open();
        printWindow.document.write(`
            <html>
                <head>
                    <title>${productName} - ${getMonthName(selectedMonth)} ${selectedYear} Ledger</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 10px;
                        }
                        .print-header {
                            display: flex;
                            align-items: center;
                            margin-bottom: 20px;
                            border-bottom: 1px solid #000;
                            padding-bottom: 5px;
                            font-size: 12px;
                        }
                        .print-header .org-logo {
                            display: flex;
                            align-items: center;
                        }
                        .print-header img {
                            height: 70px;
                            margin-right: 8px;
                        }
                        .vertical-line {
                            width: 1px;
                            background-color: #000;
                            height: 30px;
                            margin-right: 8px;
                        }
                        .print-header .header-text {
                            flex: 1;
                        }
                        .print-header .organization {
                            font-size: 16px;
                            font-weight: bold;
                            margin: 0;
                        }
                        .print-header .office,
                        .print-header .record-keeper,
                        .print-header .designation {
                            font-size: 12px;
                            margin: 2px 0;
                        }
                        .print-header .date {
                            font-size: 10px;
                            margin-top: 4px;
                            color: #555;
                        }
                        .ledger-title {
                            font-size: 14px;
                            font-weight: normal;
                            margin-bottom: 10px;
                            text-align: center;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 10px;
                        }
                        th, td {
                            border: 1px solid #000;
                            padding: 4px;
                            text-align: center;
                        }
                        th {
                            background-color: #f2f2f2;
                        }
                        @page {
                            size: A4;
                            margin: 10mm;
                        }
                        .print-footer {
                            position: fixed;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            border-top: 1px solid #000;
                            display: flex;
                            justify-content: space-between;
                            padding: 5px;
                            font-size: 10px;
                        }
                        .print-footer .footer-left {
                            display: flex;
                            align-items: center;
                        }
                        .print-footer .footer-left span {
                            margin-right: 5px;
                        }
                        .print-footer .footer-right {
                            text-align: right;
                        }
                    </style>
                </head>
                <body>
                    ${headerHtml}
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span><strong>${productName}</strong></span>
                        <span>${monthYearText}</span>
                    </div>
                    ${tableHtml}
                    <div class="print-footer">
                        <div class="footer-left">
                            <span><strong>${productName}</strong> |</span>
                            <span>${monthYearText}</span>
                        </div>
                        <div class="footer-right">
                            <script>
                                document.write("Page " + (window.pageNumber || 1) + " of " + Math.ceil(document.body.scrollHeight / window.innerHeight));
                            </script>
                        </div>
                    </div>
                    <script>
                        setTimeout(() => {
                            window.print();
                            window.onafterprint = function() {
                                window.close();
                            };
                        }, 500);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    }).catch(error => {
        console.error('Error generating print header:', error);
        alert('Failed to generate print header.');
    });
}

function generatePrintHeader() {
    return fetchHeaderData().then(headerData => {
        const { logo, organizationName, officeName, recordKeeper, designation } = headerData;
        const printDate = new Date().toLocaleDateString('en-GB');
        
        return `
            <div class="print-header">
                <div class="org-logo">
                    <img src="./src/DGHS Logo.png" alt="Organization Logo">
                    <div class="vertical-line"></div>
                </div>
                <div class="header-text">
                    <div class="organization">${organizationName}</div>
                    <div class="office">${officeName}</div>
                    <div class="record-keeper">Record Keeper: ${recordKeeper}</div>
                    <div class="designation">Designation: ${designation}</div>
                    <div class="date">Print Date: ${printDate}</div>
                </div>
            </div>
        `;
    });
}

function fetchHeaderData() {
    const headerRange = "Settings!A2:F";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${headerRange}?key=${apiKey}`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            const row = data.values[0];
            return {
                logo: row[4],
                organizationName: row[5],
                officeName: row[2],
                recordKeeper: row[0],
                designation: row[1]
            };
        });
}

function exportToExcel() {
    const selectedProduct = document.querySelector('.product-item.selected');
    if (!selectedProduct) {
        alert('Please select a product.');
        return;
    }

    const productName = selectedProduct.textContent;
    const selectedMonth = document.getElementById('monthSelect').value;
    const selectedYear = document.getElementById('yearSelect').value;
    const monthName = getMonthName(selectedMonth);
    const fileName = `${productName}, ${monthName}, ${selectedYear}.xlsx`;

    Promise.all([getLedgerData(), fetchHeaderData()]).then(([ledgerData, headerData]) => {
        const wsData = [];

        // Add header data
        wsData.push(['Organization Name: ' + headerData.organizationName]);
        wsData.push(['Office Name: ' + headerData.officeName]);
        wsData.push(['Record Keeper: ' + headerData.recordKeeper]);
        wsData.push(['Designation: ' + headerData.designation]);
        wsData.push([]);  // Empty row

        // Add product and period information
        wsData.push([`Product Name: ${productName}`]);
        wsData.push([`Month: ${monthName}`]);
        wsData.push([`Year: ${selectedYear}`]);
        wsData.push([]);  // Empty row

        // Add table headers
        const header = ['Date', 'Sell Quantity', 'Purchase Quantity', 'Remaining Quantity'];
        wsData.push(header);

        // Add ledger data
        ledgerData.forEach(row => {
            wsData.push([
                formatDate(row.date),
                row.sellQuantity.toFixed(0),
                row.purchaseQuantity.toFixed(0),
                row.remainingQuantity.toFixed(0)
            ]);
        });

        // Add totals
        const totalSell = ledgerData.reduce((acc, { sellQuantity }) => acc + sellQuantity, 0);
        const totalPurchase = ledgerData.reduce((acc, { purchaseQuantity }) => acc + purchaseQuantity, 0);
        const finalRemainingQuantity = ledgerData.length > 0 ? 
            ledgerData[ledgerData.length - 1].remainingQuantity : 0;

        wsData.push([]);  // Empty row
        wsData.push(['Total', totalSell.toFixed(0), totalPurchase.toFixed(0), finalRemainingQuantity.toFixed(0)]);

        // Create workbook and add worksheet
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Ledger');

        // Set column widths
        ws['!cols'] = wsData[5].map((_, i) => ({
            width: Math.max(...wsData.slice(5).map(row => row[i] ? row[i].toString().length : 0))
        }));

        // Style the header row
        for (let col = 0; col < header.length; col++) {
            const cell_address = { c: col, r: 5 };
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if (!ws[cell_ref]) ws[cell_ref] = {};
            ws[cell_ref].s = {
                fill: { fgColor: { rgb: "B8CCE4" } },
                border: {
                    top: { style: 'thin', color: { rgb: "ADD8E6" } },
                    bottom: { style: 'thin', color: { rgb: "ADD8E6" } },
                    left: { style: 'thin', color: { rgb: "ADD8E6" } },
                    right: { style: 'thin', color: { rgb: "ADD8E6" } }
                },
                alignment: { horizontal: 'center', vertical: 'center' }
            };
        }

        // Style data cells
        for (let row = 5; row < wsData.length; row++) {
            for (let col = 0; col < wsData[row].length; col++) {
                const cell_address = { c: col, r: row };
                const cell_ref = XLSX.utils.encode_cell(cell_address);
                if (!ws[cell_ref]) ws[cell_ref] = {};
                ws[cell_ref].s = {
                    border: {
                        top: { style: 'thin', color: { rgb: "ADD8E6" } },
                        bottom: { style: 'thin', color: { rgb: "ADD8E6" } },
                        left: { style: 'thin', color: { rgb: "ADD8E6" } },
                        right: { style: 'thin', color: { rgb: "ADD8E6" } }
                    },
                    alignment: { horizontal: 'center', vertical: 'center' }
                };
            }
        }

        // Generate Excel file
        XLSX.writeFile(wb, fileName);
    }).catch(error => {
        console.error('Error fetching data for export:', error);
        alert('Failed to export data.');
    });
}

function getLedgerData() {
    return new Promise((resolve, reject) => {
        const selectedProduct = document.querySelector('.product-item.selected');
        if (!selectedProduct) {
            reject('No product selected');
            return;
        }

        const productId = selectedProduct.dataset.productId;
        const selectedMonth = document.getElementById('monthSelect').value;
        const selectedYear = document.getElementById('yearSelect').value;

        showLedger(selectedProduct.textContent, productId, selectedMonth, selectedYear);
        
        // Get table data
        const table = document.getElementById('ledgerTable');
        const rows = table.querySelectorAll('tbody tr');
        const ledgerData = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            ledgerData.push({
                date: cells[0].textContent,
                sellQuantity: parseFloat(cells[1].textContent),
                purchaseQuantity: parseFloat(cells[2].textContent),
                remainingQuantity: parseFloat(cells[3].textContent)
            });
        });

        resolve(ledgerData);
    });
}

// Add event listener for export button
document.getElementById('exportButton').addEventListener('click', exportToExcel);

// Add event listener for the new download PDF button

// --- Helper Function: Draws the Organization Header and Title on the PDF ---
// NOTE: This assumes a function named fetchHeaderData exists and returns a promise resolving to an object 
// with { organization, office, recordKeeper, designation, logoUrl }.
// --- Helper Function: Draws the Organization Header and Title on the PDF ---
function drawHeaderOnPage(doc, pageNumber, totalPages, headerData, productName, monthYearText) {
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = margin; // Starting Y position
    
    // --- 1. Draw Header Content (Vector Graphics) ---
    
    // Organization Name (uses headerData.organizationName)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(headerData.organizationName, margin, y);
    y += 5;
    
    // Office, Record Keeper, Designation (uses custom keys)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Office: ${headerData.officeName}`, margin, y);
    y += 4;
    doc.text(`Record Keeper: ${headerData.recordKeeper}`, margin, y);
    y += 4;
    doc.text(`Designation: ${headerData.designation}`, margin, y);
    
    // Horizontal Line (Matches print format's border-bottom)
    doc.setLineWidth(0.3);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 8;

    // --- 2. Draw Ledger Title/Product Info ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    
    // Product Name (Left aligned)
    doc.text(productName, margin, y);
    
    // Month/Year (Right aligned)
    doc.text(monthYearText, pageWidth - margin, y, { align: 'right' });
    
    // --- 3. Draw Footer (Page Number) ---
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const footerY = doc.internal.pageSize.getHeight() - (margin / 2);
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
}

// --- Main Download Function ---
// --- Main Download Function ---
document.getElementById('downloadPdfButton').addEventListener('click', downloadPdf);

async function downloadPdf() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) loadingElement.style.display = 'block';

    try {
        const table = document.getElementById('ledgerTable');
        
        if (!table || table.style.display === 'none' || table.querySelector('tbody').children.length === 0) {
            throw new Error('No ledger data to export to PDF. Please select a product and filter.');
        }

        // --- 1. Fetch Organization Data and Prepare Metadata ---
        // Await the header data fetch using your existing function
        const headerData = await fetchHeaderData(); 

        const selectedProduct = document.querySelector('.product-item.selected');
        const productName = selectedProduct ? selectedProduct.textContent : 'Ledger';
        const selectedMonth = document.getElementById('monthSelect').value;
        const selectedYear = document.getElementById('yearSelect').value;
        // Uses getMonthName() which you should have defined elsewhere
        const monthYearText = `${getMonthName(selectedMonth)} ${selectedYear}`; 
        const fileName = `${productName}, ${getMonthName(selectedMonth)}, ${selectedYear}.pdf`;
        
        // --- 2. Prepare Table Data for Autotable ---
        const tableHeaders = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
        
        // Body rows
        const tableBody = Array.from(table.querySelectorAll('tbody tr')).map(row => 
            Array.from(row.querySelectorAll('td')).map(td => td.textContent)
        );
        // Footer rows (Total)
        const tableFoot = Array.from(table.querySelectorAll('tfoot tr')).map(row => 
            Array.from(row.querySelectorAll('th')).map(th => th.textContent)
        );

        // --- 3. Initialize and Configure PDF ---
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4'); 
        const margin = 10;
        
        doc.autoTable({
            head: [tableHeaders],
            body: tableBody,
            foot: tableFoot,
            startY: 50, // Leaves space for the custom header
            theme: 'grid',
            styles: { 
                fontSize: 9, 
                cellPadding: 3,
                font: 'helvetica'
            },
            headStyles: {
                fillColor: [242, 242, 242], // #f2f2f2
                textColor: [0, 0, 0],
                fontStyle: 'bold'
            },
            footStyles: {
                fontStyle: 'bold',
                fillColor: [255, 255, 255]
            },
            margin: { top: 50, bottom: 20, left: margin, right: margin },
            
            // CRITICAL: Hook to draw the custom header/footer on every page
            didDrawPage: (data) => {
                const totalPages = doc.internal.getNumberOfPages();
                const pageNumber = data.pageNumber;
                // Pass the fetched headerData object to the drawing function
                drawHeaderOnPage(doc, pageNumber, totalPages, headerData, productName, monthYearText);
            }
        });

        // 4. Save the PDF
        doc.save(fileName);

    } catch (error) {
        console.error('PDF Generation Error:', error);
        alert(error.message || 'An unknown error occurred during PDF generation.');
    } finally {
        if (loadingElement) loadingElement.style.display = 'none';
    }
}
// NOTE: Ensure your existing getMonthName() function is available in Ledger.js
// NOTE: Ensure your existing generatePrintHeader() logic is integrated into 
//       the drawHeaderOnPage function (currently using placeholder data).