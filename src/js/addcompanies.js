// Function to add a new row to the company table
function addRow() {
    var table = document.getElementById("company");
    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);
  
    var serialNumber = rowCount; // Dynamic serial number
  
    // Insert cells to the new row
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
  
    // Populate cells with content
    cell1.innerHTML = serialNumber;
    cell2.innerHTML = '<input type="text" name="company_name[]" required>';
    cell3.innerHTML = '<button type="button" class="btn btn-danger" onclick="removeRow(this)">Remove</button>';
  }
  
  // Function to remove a row from the company table
  function removeRow(button) {
    var row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
  
    // Update serial numbers after deletion
    var table = document.getElementById("company");
    for (var i = 1; i < table.rows.length; i++) {
      table.rows[i].cells[0].innerHTML = i;
    }
  }
  
  // Function to handle form submission
  document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the form submission
    document.getElementById('companyForm').addEventListener('submit', function(event) {
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
                successBox.innerHTML = '<p>Company added successfully.</p>';
  
                var okButton = document.createElement('button');
                okButton.textContent = 'OK';
  
                okButton.addEventListener('click', function() {
                    location.reload();
                });
  
                successBox.appendChild(okButton);
                document.body.appendChild(successBox);
            } else {
                console.error('Failed to add Company.');
            }
        })
        .catch(error => {
            document.body.removeChild(spinner);
            console.error('Error:', error);
        });
    });
  });
  