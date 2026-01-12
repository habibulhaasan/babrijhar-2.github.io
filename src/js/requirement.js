   
/* FOrm Submission

fetch('https://script.google.com/macros/s/AKfycbyllShdCeacezQHLD5cxlPjzWqIYQTxX_J73JuVMZ7q7KLtlLXUqw9BFFjVZAAVVdLuiQ/exec?function=getClientData')
  .then(response => response.json())
  .then(data => {
    // Assuming the data from the API is an array of objects, where each object represents a row of data
    
    // Replace the values dynamically
    document.getElementById('reqapp-id').value = data[0].appId; // Assuming the first row's appId is used
    document.getElementById('user-name').value = data[0].userName; // Assuming the first row's userName is used
    document.getElementById('mobile-number').value = data[0].phoneNumber; // Assuming the first row's phoneNumber is used
  })
  .catch(error => console.error('Error fetching data:', error));
*/

// // Function to handle form submission

                document.addEventListener('DOMContentLoaded', function() {
                        // Set App ID and Username values
                    // Fetch services data and populate dropdown options
                    fetch('https://script.google.com/macros/s/AKfycbzI8GzxyL0WUZ4UFtBlt0LiSfQp5OKvDedXzB3nXCcl5kR8wWvU6u8p1sw7fuoEkewofA/exec?function=getServices')
                        .then(response => response.json())
                        .then(data => {
                            const requirementDropdown = document.getElementById('requirement');
                            const paymentGatewayDropdown = document.getElementById('payment-gateway');

                            data.forEach(service => {
                                const option = document.createElement('option');
                                option.value = service['Service Name'];
                                option.textContent = service['Service Name'];
                                requirementDropdown.appendChild(option);
                            });

                            data.forEach(service => {
                                const option = document.createElement('option');
                                const paymentGateway = service['Payment Gateway'].trim();
                                if (paymentGateway) {
                                    option.value = paymentGateway;
                                    option.textContent = paymentGateway;
                                    paymentGatewayDropdown.appendChild(option);
                                }
                            });
                        })
                        .catch(error => console.error('Error fetching services data:', error));

                    // Set dynamic amount based on selected requirement
                    document.getElementById('requirement').addEventListener('change', function() {
                        const selectedRequirement = this.value;
                        fetch('https://script.google.com/macros/s/AKfycbzI8GzxyL0WUZ4UFtBlt0LiSfQp5OKvDedXzB3nXCcl5kR8wWvU6u8p1sw7fuoEkewofA/exec?function=getServices')
                            .then(response => response.json())
                            .then(data => {
                                const service = data.find(service => service['Service Name'] === selectedRequirement);
                                if (service) {
                                    document.getElementById('amount').value = service['Charge'];
                                } else {
                                    document.getElementById('amount').value = '';
                                }
                            })
                            .catch(error => console.error('Error fetching services data:', error));
                    });
                });

   
   
// FOrm Submission
// Function to handle form submission
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('requirement-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

                                // Create the loading spinner
                                var spinner = document.createElement('div');
                                spinner.classList.add('spinner');
                        
                                // Add the spinner to the body
                                document.body.appendChild(spinner);

        // Function to convert file to base64
        function fileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(file);
            });
        }

        // Function to submit the form after converting the file to base64
        async function submitFormWithAttachment() {
            const formData = new FormData(document.getElementById('requirement-form'));
            const fileInput = document.getElementById('profilePicture');
            const attachment = fileInput.files[0]; // Get the file from the input element

            if (attachment) {
                try {
                    const base64String = await fileToBase64(attachment);
                    formData.append('attachment', base64String);
                    formData.append('attachmentName', attachment.name);
                } catch (error) {
                    console.error('Error converting file to base64:', error);
                    return;
                }
            }

            fetch('https://script.google.com/macros/s/AKfycbxtqifKllCGXGIOQ4Cenx1i5crPkQyEotFkH9vgZiB0Jy1fzGRIKnsm04dFAA4BOXP4Xw/exec?function=postRequirement', { // Replace with your endpoint
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                                    // Remove the spinner
                                    document.body.removeChild(spinner);
                                    
                if (data.success) {
                    // Create the popup message box
                    var successBox = document.createElement('div');
                    successBox.classList.add('popup');
                    successBox.innerHTML = '<p>Requirement Submitted successfully.</p>';

                    // Create the OK button
                    var okButton = document.createElement('button');
                    okButton.textContent = 'OK';

                    // Add event listener to the OK button to reload the page
                    okButton.addEventListener('click', function() {
                        location.reload();
                    });

                    // Append the OK button to the popup box
                    successBox.appendChild(okButton);

                    // Append the popup box to the body
                    document.body.appendChild(successBox);
                } else {
                    console.error('Failed to submit requirement.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }

        // Call the function to submit the form with attachment
        submitFormWithAttachment();
    });
});
