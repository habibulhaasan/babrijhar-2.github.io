/* FOrm Submission

fetch('https://script.google.com/macros/s/AKfycbyllShdCeacezQHLD5cxlPjzWqIYQTxX_J73JuVMZ7q7KLtlLXUqw9BFFjVZAAVVdLuiQ/exec?function=getClientData')
  .then(response => response.json())
  .then(data => {
    // Assuming the data from the API is an array of objects, where each object represents a row of data
    
    // Replace the values dynamically
    document.getElementById('feedapp-id').value = data[0].appId; // Assuming the first row's appId is used 
    document.getElementById('user-name').value = data[0].userName; // Assuming the first row's userName is used
  })
  .catch(error => console.error('Error fetching data:', error));
*/

// Function to handle form submission
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('feedback-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission
        
        // Submit form data asynchronously
        var formData = new FormData(this);
        fetch('https://script.google.com/macros/s/AKfycbyz4t7oTK7-w8ohE5LA4Dn4zbOp7ei-qdbclMsDRpVHfjETMRpWksBIFYtu0jrbYxDzbw/exec?function=postFeedback', { // Replace with your endpoint
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {

                // Create the popup message box
                      var successBox = document.createElement('div');
                      successBox.classList.add('popup');
                      successBox.innerHTML = '<p>Feedback Submitted successfully.</p>';

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
                console.error('Failed to submit feedback.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
