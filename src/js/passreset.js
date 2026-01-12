// Payment Gateway

document.addEventListener('DOMContentLoaded', function() {
    const paymentGatewaySelect = document.getElementById('paymentGateway');
    const apiURL = "https://script.google.com/macros/s/AKfycbzI8GzxyL0WUZ4UFtBlt0LiSfQp5OKvDedXzB3nXCcl5kR8wWvU6u8p1sw7fuoEkewofA/exec?function=getServices";

    fetch(apiURL)
        .then(response => response.json())
        .then(data => {
            const gateways = new Set();
            data.forEach(service => {
                const paymentGateway = service['Payment Gateway'].trim();
                if (paymentGateway) {
                    gateways.add(paymentGateway);
                }
            });

            gateways.forEach(gateway => {
                const option = document.createElement('option');
                option.value = gateway;
                option.textContent = gateway;
                paymentGatewaySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching payment gateways:', error));
});


// Function to handle password reset form submission
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('forgotPasswordForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission
        
        // Submit form data asynchronously
        var formData = new FormData(this);
        fetch('https://script.google.com/macros/s/AKfycbxwM9J3o7WAYEmjTcHXUrYkCOgm3OBUlgenVrsGAiUUg3jhrM97YmvhccjmXM3DcdyY6A/exec?function=postPassReset', { // Replace with your endpoint
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {

                // Create the popup message box
                      var successBox = document.createElement('div');
                      successBox.classList.add('popup');
                      successBox.innerHTML = '<p>Request Submitted successfully.</p>';

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
                console.error('Failed to submit request.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
