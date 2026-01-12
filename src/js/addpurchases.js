// Constants
const apiKey = "AIzaSyD7eX6VGCDHXBzF63CAHDfaP1-WFp3jcoI";
const spreadsheetId = "1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng";
const productRange = "Products!B2:C";
const stockRange = "Stock!A:F";

let productData = [];

// Fetch product data and store it in memory
function fetchProductData() {
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${productRange}?key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            productData = data.values.map(row => ({ id: row[0], name: row[1] }));
            initializeFirstRow(); // Initialize first row after fetching data
        })
        .catch(error => console.error("Error fetching product list:", error));
}

// Populate datalist with product options
function populateDatalist(input) {
    const datalist = document.getElementById("productList");
    datalist.innerHTML = ""; // Clear existing options

    // Add products to the datalist
    productData.forEach(product => {
        const option = document.createElement("option");
        option.value = product.name; // Display product name
        datalist.appendChild(option);
    });
}

// Select a product and fill in related details
function selectProduct(input) {
    const row = input.closest("tr");
    const product = productData.find(p => p.name === input.value);

    if (product) {
        row.querySelector('input[name="product_id[]"]').value = product.id;

        // Fetch and set stock quantity
        fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${stockRange}?key=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const stockRow = data.values.find(row => row[0] === product.id);
                const stockQuantity = stockRow ? stockRow[5] : "0";
                row.querySelector('input[name="current_stock[]"]').value = stockQuantity;
            })
            .catch(error => console.error("Error fetching stock data:", error));
    }
}

// Add a new row to the Sell table
function addRow() {
    const table = document.getElementById("purchase");
    const rowCount = table.rows.length;
    const row = table.insertRow(rowCount);

    const serialNumber = rowCount; // Dynamic serial number

    // Insert cells into the new row
    row.insertCell(0).textContent = serialNumber;
    row.insertCell(1).innerHTML = `
        <input type="text" name="product_name[]" list="productList" onfocus="populateDatalist(this)" onchange="selectProduct(this)" oninput="selectProduct(this)" autocomplete="off" required>
        <datalist id="productList"></datalist>
    `;
    row.insertCell(2).innerHTML = '<input type="text" name="product_id[]" required readonly>';
    row.insertCell(3).innerHTML = '<input type="number" name="quantity[]" required oninput="calculateTotal(this)">';
    row.insertCell(4).innerHTML = '<input type="number" name="unit_price[]" readonly value="0" oninput="calculateTotal(this)">';
    row.insertCell(5).innerHTML = '<input type="text" name="total_price[]" readonly>';
    row.insertCell(6).innerHTML = '<button type="button" class="btn btn-danger" onclick="removeRow(this)">Remove</button>';
}

// Add 20 new rows to the Purchase table
function addTwentyRows() {
    const table = document.getElementById("purchase");
    const currentRowCount = table.rows.length;

    for (let i = 0; i < 20; i++) {
        const row = table.insertRow(currentRowCount + i);

        const serialNumber = currentRowCount + i; // Dynamic serial number

        // Insert cells into the new row

        row.insertCell(0).textContent = serialNumber;
        row.insertCell(1).innerHTML = `
            <input type="text" name="product_name[]" list="productList" onfocus="populateDatalist(this)" onchange="selectProduct(this)" oninput="selectProduct(this)" autocomplete="off" required>
            <datalist id="productList"></datalist>
        `;
        row.insertCell(2).innerHTML = '<input type="text" name="product_id[]" required readonly>';
        row.insertCell(3).innerHTML = '<input type="number" name="quantity[]" required oninput="calculateTotal(this)">';
        row.insertCell(4).innerHTML = '<input type="number" name="unit_price[]" readonly value="0" oninput="calculateTotal(this)">';
        row.insertCell(5).innerHTML = '<input type="text" name="total_price[]" readonly>';
        row.insertCell(6).innerHTML = '<button type="button" class="btn btn-danger" onclick="removeRow(this)">Remove</button>';
    }
}


// Remove a row from the Purchase table
function removeRow(button) {
    const row = button.closest("tr");
    row.parentNode.removeChild(row);

    // Update serial numbers
    const table = document.getElementById("purchase");
    for (let i = 1; i < table.rows.length; i++) {
        table.rows[i].cells[0].textContent = i;
    }
}

// Calculate total price for a single row
function calculateTotal(input) {
    const row = input.closest("tr");
    const quantity = parseFloat(row.querySelector('input[name="quantity[]"]').value) || 0;
    const price = parseFloat(row.querySelector('input[name="unit_price[]"]').value) || 0;
    const total = quantity * price;
    row.querySelector('input[name="total_price[]"]').value = total.toFixed(2);
}



// Initialize the first row
function initializeFirstRow() {
    const firstRow = document.getElementById("row1");
    const productInput = firstRow.querySelector('input[name="product_name[]"]');
    productInput.onfocus = () => populateDatalist(productInput);
    productInput.onchange = () => selectProduct(productInput);
    productInput.oninput = () => selectProduct(productInput);

    const quantityInput = firstRow.querySelector('input[name="quantity[]"]');
    const priceInput = firstRow.querySelector('input[name="unit_price[]"]');
    quantityInput.oninput = () => calculateTotal(quantityInput);
    priceInput.oninput = () => calculateTotal(priceInput);
}

// Handle form submission with spinner and popup
document.addEventListener("DOMContentLoaded", () => {
    fetchProductData(); // Load product data once

    document.getElementById('PurchaseForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        // Create the loading spinner
        const spinner = document.createElement('div');
        spinner.classList.add('spinner');
        document.body.appendChild(spinner);

        // Submit form data asynchronously
        const formData = new FormData(this);
        fetch(this.action, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            document.body.removeChild(spinner); // Remove spinner
            if (data.success) {
                // Show success popup
                const successBox = document.createElement('div');
                successBox.classList.add('popup');
                successBox.innerHTML = '<p>Purchase added successfully.</p>';

                const okButton = document.createElement('button');
                okButton.textContent = 'OK';
                okButton.addEventListener('click', () => location.reload());
                successBox.appendChild(okButton);
                document.body.appendChild(successBox);
            } else {
                console.error('Failed to add Purchase.');
            }
        })
        .catch(error => {
            document.body.removeChild(spinner); // Remove spinner
            console.error('Error:', error);
        });
    });
});
