// Function to add a new row to the product table
function addRow() {
    var table = document.getElementById("product");
    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);
  
    var serialNumber = rowCount; // Dynamic serial number
  
    // Insert cells to the new row
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);
  
    // Populate cells with content
    cell1.innerHTML = serialNumber;
    cell2.innerHTML = '<input type="text" name="product_name[]" list="productNamesList" required autocomplete="off"><datalist id="productNamesList"></datalist>';
    cell3.innerHTML = '<select name="product_type[]" required><option value="">Select</option><option value="Tablet">Tablet</option><option value="Capsule">Capsule</option><option value="Syrup">Syrup</option><option value="Injection">Injection</option><option value="Infusion">Infusion</option><option value="Suppository">Suppository</option><option value="Lotion">Lotion</option><option value="Sachet">Sachet</option><option value="Spray">Spray</option><option value="Surgicals">Surgicals</option><option value="Others">Others</option></select>';
    cell4.innerHTML = '<input type="text" name="generic_name[]" list="genericNamesList" required autocomplete="off">';
    cell5.innerHTML = '<input type="text" name="company_name[]" list="companyNamesList" required autocomplete="off">';
    var cell6 = row.insertCell(5);
    cell6.innerHTML = '<button type="button" class="btn btn-danger" onclick="removeRow(this)">Remove</button>';
  }
  
  // Function to remove a row from the product table
  function removeRow(button) {
    var row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    
    // Update serial numbers after deletion
    var table = document.getElementById("product");
    for (var i = 1; i < table.rows.length; i++) {
      table.rows[i].cells[0].innerHTML = i;
    }
  }
  
  // Function to handle form submission
  document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the form submission
    document.getElementById('productForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission
  
        // Create the loading spinner
        var spinner = document.createElement('div');
        spinner.classList.add('spinner');
        document.body.appendChild(spinner);
  
        // Submit form data asynchronously
        var formData = new FormData(this);
        fetch(this.action, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            document.body.removeChild(spinner);
            if (data.success) {
                var successBox = document.createElement('div');
                successBox.classList.add('popup');
                successBox.innerHTML = '<p>Product added successfully.</p>';
  
                var okButton = document.createElement('button');
                okButton.textContent = 'OK';
  
                okButton.addEventListener('click', function() {
                    location.reload();
                });
  
                successBox.appendChild(okButton);
                document.body.appendChild(successBox);
            } else {
                console.error('Failed to add Product.');
            }
        })
        .catch(error => {
            document.body.removeChild(spinner);
            console.error('Error:', error);
        });
    });
  
    populateGenericNamesList();
    populateCompanyNamesList();
  });
  
  // Function to fetch generic names from Google Sheets and populate the data list
  async function populateGenericNamesList() {
    const apiKey = 'AIzaSyD7eX6VGCDHXBzF63CAHDfaP1-WFp3jcoI';
    const sheetId = '1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng';
    const range = 'Generics!C2:C'; // Sheet range for generic names
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      const genericNamesList = document.getElementById('genericNamesList');
      genericNamesList.innerHTML = ''; // Clear previous options
  
      data.values.forEach(row => {
        const name = row[0]; 
        if (name) {
          const option = document.createElement('option');
          option.value = name;
          genericNamesList.appendChild(option);
        }
      });
  
    } catch (error) {
      console.error('Error fetching generic names:', error);
    }
  }
  
  // Function to fetch company names from Google Sheets and populate the data list
  async function populateCompanyNamesList() {
    const apiKey = 'AIzaSyD7eX6VGCDHXBzF63CAHDfaP1-WFp3jcoI';
    const sheetId = '1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng';
    const range = 'Companies!C2:C'; 
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      const companyNamesList = document.getElementById('companyNamesList');
      companyNamesList.innerHTML = ''; 
  
      data.values.forEach(row => {
        const name = row[0]; 
        if (name) {
          const option = document.createElement('option');
          option.value = name;
          companyNamesList.appendChild(option);
        }
      });
  
    } catch (error) {
      console.error('Error fetching company names:', error);
    }
  }
  

  
// Function to fetch product names from Google Sheets using Google Sheets API
// Function to fetch product names from Google Sheets using Google Sheets API
async function fetchProductNames() {
  const apiKey = 'AIzaSyD7eX6VGCDHXBzF63CAHDfaP1-WFp3jcoI';
  const sheetId = '1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng';
  const productRange = "Products!C2:C"; // Adjust range to only include product names if necessary

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${productRange}?key=${apiKey}`;
  
  try {
      const response = await fetch(url);
      const data = await response.json();
      const productNames = data.values.flat(); // Flatten the array if it contains nested arrays

      const datalist = document.getElementById('productNamesList');
      
      productNames.forEach(name => {
          let option = document.createElement('option');
          option.value = name;
          datalist.appendChild(option);
      });
  } catch (error) {
      console.error('Error fetching product names:', error);
  }
}

// Call the function to fetch and populate product names
fetchProductNames();
