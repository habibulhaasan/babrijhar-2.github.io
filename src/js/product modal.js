async function showProductList() {
    const apiKey = 'AIzaSyD7eX6VGCDHXBzF63CAHDfaP1-WFp3jcoI';
    const sheetId = '1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng';
    const range = 'Products!A2:F'; // Sheet range for product data
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Product Data:', data); // Log the retrieved product data

        // Map the data to extract product ID and name
        const productData = data.values.map(row => ({
            productId: row[1], // Assuming product ID is in the first column (A)
            productName: row[2]  // Assuming product name is in the second column (B)
        }));

        const productTableBody = document.getElementById('productTableBody');
        productTableBody.innerHTML = ''; // Clear previous data

        productData.forEach(product => {
            const row = document.createElement('tr');
            const cellId = document.createElement('td');
            const cellName = document.createElement('td');

            cellId.textContent = product.productId;
            cellName.textContent = product.productName;

            row.appendChild(cellId);
            row.appendChild(cellName);
            productTableBody.appendChild(row);
        });

        const modal = document.getElementById('productListModal');
        modal.style.display = 'block';

        const closeButton = document.querySelector('.close');
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });

    } catch (error) {
        console.error('Error fetching product data:', error);
    }
}

// Event listener for the button to show the product list
document.getElementById('showProductListBtn').addEventListener('click', showProductList);
