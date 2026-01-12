document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('userForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission
                      // Create the loading spinner
                      var spinner = document.createElement('div');
                      spinner.classList.add('spinner');
              
                      // Add the spinner to the body
                      document.body.appendChild(spinner);

        // Submit form data asynchronously
        var formData = new FormData(this);
        fetch('https://script.google.com/macros/s/AKfycbzc7xWF-Yq7dtW5CnQ_5-95dleOzHxhEC9HofTdt7Wm1ReN9xWOr8wJmB8Yo4tNjbfPaQ/exec?function=settingsForm', { // Replace with your endpoint
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
                                // Remove the spinner
                                document.body.removeChild(spinner);
            if (data === "Form data submitted successfully") {
                // Create the popup message box
                var successBox = document.createElement('div');
                successBox.classList.add('popup');
                successBox.innerHTML = '<p>Information Updated Successfully.</p>';

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
                console.error('Failed to update information.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
