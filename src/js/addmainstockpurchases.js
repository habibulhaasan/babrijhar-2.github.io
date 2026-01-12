// Constants
const apiKey = "AIzaSyD7eX6VGCDHXBzF63CAHDfaP1-WFp3jcoI";
const spreadsheetId = "1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng";
const productRange = "Products!B2:C";
const stockRange = "Main Stock!A:F";

let productData = [];
let stockData = {};

// Fetch product and stock data
function fetchData() {
    // Fetch products
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${productRange}?key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            productData = data.values.map(row => ({ id: row[0], name: row[1] }));

            // Sort products by prefix and alphabetically within each prefix
            const priorities = ["Tab.", "Cap.", "Syp."]; // Define prefix priorities
            productData.sort((a, b) => {
                const prefixA = priorities.findIndex(prefix => a.name.startsWith(prefix));
                const prefixB = priorities.findIndex(prefix => b.name.startsWith(prefix));

                if (prefixA !== -1 && prefixB !== -1) {
                    return prefixA === prefixB
                        ? a.name.localeCompare(b.name)
                        : prefixA - prefixB;
                }
                if (prefixA !== -1) return -1;
                if (prefixB !== -1) return 1;

                return a.name.localeCompare(b.name);
            });

            // Fetch stock after fetching products
            fetchStockData();
        })
        .catch(error => console.error("Error fetching product list:", error));
}

// Fetch all stock data
function fetchStockData() {
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${stockRange}?key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            stockData = data.values.reduce((acc, row) => {
                acc[row[0]] = row[5]; // Map product ID to stock quantity
                return acc;
            }, {});
            initializeRows();
        })
        .catch(error => console.error("Error fetching stock data:", error));
}

// Initialize rows based on product and stock data
function initializeRows() {
    const table = document.getElementById("purchase");
    const tableBody = table.querySelector("tbody");

    // Clear all existing rows from the table body
    tableBody.innerHTML = "";

    productData.forEach((product, index) => {
        const row = tableBody.insertRow(-1);

        row.insertCell(0).textContent = index + 1; // Serial number
        row.insertCell(1).innerHTML = `
            <input type="text" name="product_name[]" value="${product.name}" readonly>
            <div class="suggestions-box"></div>`;
        row.insertCell(2).innerHTML = `<input type="text" name="product_id[]" value="${product.id}" readonly>`;
        row.insertCell(3).innerHTML = `<input type="text" name="current_stock[]" value="${stockData[product.id] || 0}" readonly>`;
        row.insertCell(4).innerHTML = `<input type="number" name="quantity[]" required value="0" oninput="calculateTotal(this)">`;
        row.insertCell(5).innerHTML = `<input type="number" name="unit_price[]" readonly value="0" oninput="calculateTotal(this)">`;
        row.insertCell(6).innerHTML = `<input type="text" name="total_price[]" readonly>`;
        row.insertCell(7).innerHTML = `<button type="button" class="btn btn-danger" onclick="removeRow(this)">Remove</button>`;
    });
}

// Add a new row to the purchase table
function addRow() {
    const table = document.getElementById("purchase");
    const rowCount = table.rows.length;
    const row = table.insertRow(rowCount);

    const serialNumber = rowCount; // Dynamic serial number

    // Insert cells into the new row
    row.insertCell(0).textContent = serialNumber;
    row.insertCell(1).innerHTML = `
        <input type="text" name="product_name[]" oninput="showProductSuggestions(this)" autocomplete="off" required>
        <div class="suggestions-box"></div>`;
    row.insertCell(2).innerHTML = '<input type="text" name="product_id[]" required readonly>';
    row.insertCell(3).innerHTML = '<input type="text" name="current_stock[]" readonly>';
    row.insertCell(4).innerHTML = '<input type="number" name="quantity[]" required oninput="calculateTotal(this)">';
    row.insertCell(5).innerHTML = '<input type="number" name="unit_price[]" readonly value="0" oninput="calculateTotal(this)">';
    row.insertCell(6).innerHTML = '<input type="text" name="total_price[]" readonly>';
    row.insertCell(7).innerHTML = '<button type="button" class="btn btn-danger" onclick="removeRow(this)">Remove</button>';
}

// Add 20 new rows to the purchase table
function addTwentyRows() {
    const table = document.getElementById("purchase");
    const currentRowCount = table.rows.length;

    for (let i = 0; i < 20; i++) {
        const row = table.insertRow(currentRowCount + i);

        const serialNumber = currentRowCount + i; // Dynamic serial number

        // Insert cells into the new row
        row.insertCell(0).textContent = serialNumber;
        row.insertCell(1).innerHTML = `
            <input type="text" name="product_name[]" oninput="showProductSuggestions(this)" autocomplete="off" required>
            <div class="suggestions-box"></div>`;
        row.insertCell(2).innerHTML = '<input type="text" name="product_id[]" required readonly>';
        row.insertCell(3).innerHTML = '<input type="text" name="current_stock[]" readonly>';
        row.insertCell(4).innerHTML = '<input type="number" name="quantity[]" required oninput="calculateTotal(this)">';
        row.insertCell(5).innerHTML = '<input type="number" name="unit_price[]" readonly value="0" oninput="calculateTotal(this)">';
        row.insertCell(6).innerHTML = '<input type="text" name="total_price[]" readonly>';
        row.insertCell(7).innerHTML = '<button type="button" class="btn btn-danger" onclick="removeRow(this)">Remove</button>';
    }
}

// Show product suggestions as the user types
function showProductSuggestions(input) {
    const suggestionsBox = input.nextElementSibling; // The div for suggestions
    const searchTerm = input.value.trim().toLowerCase();

    if (searchTerm) {
        const filteredProducts = productData.filter(product =>
            product.name.toLowerCase().includes(searchTerm)
        );

        suggestionsBox.innerHTML = ""; // Clear existing suggestions

        filteredProducts.forEach(product => {
            const suggestionItem = document.createElement("div");
            suggestionItem.textContent = product.name;
            suggestionItem.classList.add("suggestion-item");
            suggestionItem.onclick = () => selectProduct(input, product);
            suggestionsBox.appendChild(suggestionItem);
        });

        suggestionsBox.style.display = filteredProducts.length > 0 ? "block" : "none";
    } else {
        suggestionsBox.style.display = "none";
    }
}

// Select a product from the suggestions box
function selectProduct(input, product) {
    input.value = product.name;
    input.nextElementSibling.style.display = "none"; // Hide suggestions

    const row = input.closest("tr");
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

// Calculate total price for a single row
function calculateTotal(input) {
    const row = input.closest("tr");
    const quantity = parseFloat(row.querySelector('input[name="quantity[]"]').value) || 0;
    const price = parseFloat(row.querySelector('input[name="unit_price[]"]').value) || 0;
    const total = quantity * price;
    row.querySelector('input[name="total_price[]"]').value = total.toFixed(2);
}

// Remove a row from the purchase table
function removeRow(button) {
    const row = button.closest("tr");
    row.parentNode.removeChild(row);

    // Update serial numbers
    const table = document.getElementById("purchase");
    for (let i = 1; i < table.rows.length; i++) {
        table.rows[i].cells[0].textContent = i;
    }
}

// Handle form submission with spinner and skipping rows with quantity = 0
document.addEventListener("DOMContentLoaded", () => {
    fetchData(); // Load product and stock data on page load

    document.getElementById("purchaseForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission

        // Create the loading spinner
        const spinner = document.createElement("div");
        spinner.classList.add("spinner");
        document.body.appendChild(spinner);

        // Gather form data, skipping rows where quantity = 0
        const formData = new FormData();
        const selectedDate = document.getElementById("purchase_date").value;
        formData.append("purchase_date", selectedDate);

        const rows = Array.from(document.querySelectorAll("#purchase tr")).slice(1); // Skip header row
        rows.forEach(row => {
            const quantity = parseFloat(row.querySelector('input[name="quantity[]"]').value) || 0;
            if (quantity > 0) {
                formData.append("product_name[]", row.querySelector('input[name="product_name[]"]').value);
                formData.append("product_id[]", row.querySelector('input[name="product_id[]"]').value);
                formData.append("quantity[]", quantity);
                formData.append("unit_price[]", row.querySelector('input[name="unit_price[]"]').value);
                formData.append("total_price[]", row.querySelector('input[name="total_price[]"]').value);
            }
        });

        // Submit form data asynchronously
        fetch(this.action, {
            method: "POST",
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
                    okButton.onclick = () => window.location.reload();
                    successBox.appendChild(okButton);

                    document.body.appendChild(successBox);
                } else {
                    // Show error popup
                    alert("Error: " + data.error);
                }
            })
            .catch(error => {
                document.body.removeChild(spinner); // Remove spinner
                alert("Error submitting form.");
            });
    });
});