// App Info
const apiKey = "AIzaSyD7eX6VGCDHXBzF63CAHDfaP1-WFp3jcoI";
const sheetId = '1VXjfK-E1yUdV6xBXsl4xBPzBxTPISewe23z4Pe9D2Ds';
const range = 'ClientList!B3:D3'; // This will get B3, C3, and D3
const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

fetch(url)
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      if (data.values && Array.isArray(data.values) && data.values.length > 0) {
          // The data will be an array of arrays, with the first array being the values from B3:D3
          const [appId, planType] = data.values[0];

          document.getElementById('app-id').textContent = appId;
          document.getElementById('plan-type').textContent = planType;

      } else {
          console.error('Error fetching data: No data found');
      }
  })
  .catch(error => {
      console.error('Error fetching data:', error);
  });


// Update Header User info //

// Fetch user information from Google Sheets
document.addEventListener('DOMContentLoaded', function() {
  // Define the Google Sheets API URL with the appropriate sheet range
  const apiKey = 'AIzaSyD7eX6VGCDHXBzF63CAHDfaP1-WFp3jcoI'; // Your API key
  const sheetId = '1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng'; // Your Sheet ID
  const range = 'Settings!A2:D'; // The range to fetch data from
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

  fetch(url)
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data => {
          if (data.values && Array.isArray(data.values) && data.values.length > 0) { // Check if data contains values array and is not empty
              // Assuming the first row in the range contains the data we need
              const [username, designation, company] = data.values[0];

              // Update username and designation in the header
              document.getElementById('username').textContent = `${username} ▼`;
              document.getElementById('usernameDropdown').textContent = username;
              document.getElementById('designation').textContent = designation;
              document.getElementById('organization').textContent = company;
              document.getElementById('app-id').textContent = company;
              

              // Update profile pictures
              document.getElementById('profilepicture').src = profilePicture;
              document.getElementById('profilepicturedropdown').src = profilePicture;
              
          } else {
              console.error('Error fetching user information: No data found');
          }
      })
      .catch(error => {
          console.error('Error fetching user information:', error);
      });
});


        

// Profile Section, Dropdown 

        const profileContainer = document.getElementById('profileContainer');
        const profileDropdown = document.getElementById('profileDropdown');

        // Function to handle clicks anywhere on the document
        function handleDocumentClick(event) {
          
          // Check if the clicked element is inside the profile container
          if (!profileContainer.contains(event.target)) {
          
            // If not, hide the profile dropdown
            profileDropdown.classList.remove('show');
          
            // Remove the event listener to prevent multiple calls
            document.removeEventListener('click', handleDocumentClick);
          }
        }

        profileContainer.addEventListener('click', (event) => {
          // Toggle the show class on the profile dropdown
          profileDropdown.classList.toggle('show');
          // Prevent the event from propagating to the document
          event.stopPropagation();
          
          // If the profile dropdown is shown, add a click event listener to the document
          if (profileDropdown.classList.contains('show')) {
            document.addEventListener('click', handleDocumentClick);
          }
        });



// Display Notification

          // Function to fetch and display notifications
          function fetchNotifications() {
            const apiKey = 'AIzaSyD7eX6VGCDHXBzF63CAHDfaP1-WFp3jcoI'; // Your API key
            const sheetId = '1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng'; // Your Sheet ID
            const range = 'Message!A2:A'; // The range to fetch data from
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.values && Array.isArray(data.values)) { // Check if the data contains values array
                        const notifications = data.values.map(row => row[0]); // Extract messages from the response
                        const notificationContainer = document.getElementById('notificationContainer');
                        notificationContainer.innerHTML = ''; // Clear existing notifications

                        notifications.forEach(notification => {
                            const notificationElement = document.createElement('div');
                            notificationElement.classList.add('notification-item'); // Add a class for styling

                            const urlPattern = /(https?:\/\/[^\s]+)/g;
                            const urls = notification.match(urlPattern);
                            if (urls) {
                                // If a URL is found, create an anchor element
                                const notificationText = notification.replace(urlPattern, '');
                                notificationElement.textContent = notificationText;

                                urls.forEach(url => {
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.textContent = 'Read More';
                                    link.target = '_blank';
                                    link.style.marginLeft = '5px'; // Optional: Add margin for readability
                                    notificationElement.appendChild(link);
                                });
                            } else {
                                // If no URL is found, just display the notification text
                                notificationElement.textContent = notification;
                            }

                            notificationContainer.appendChild(notificationElement);
                        });

                        // Display the notification container
                        notificationContainer.style.display = 'block';
                    } else {
                        console.error('Error fetching notifications: Unexpected response format');
                    }
                })
                .catch(error => {
                    console.error('Error fetching notifications:', error);
                });
          }

          // Function to toggle display of the notification container
          function toggleNotificationContainer() {
            const notificationContainer = document.getElementById('notificationContainer');
            if (notificationContainer.style.display === 'block') {
                notificationContainer.style.display = 'none'; // Hide the notification container if it's already open
            } else {
                fetchNotifications(); // Fetch notifications when the container is opened
                notificationContainer.style.display = 'block'; // Display the notification container
            }
          }

          // Function to handle clicks outside the notification container
          function handleClickOutside(event) {
            const notificationContainer = document.getElementById('notificationContainer');
            const notificationIcon = document.getElementById('notificationIcon');
            if (
                notificationContainer.style.display === 'block' &&
                !notificationContainer.contains(event.target) &&
                event.target !== notificationIcon
            ) {
                notificationContainer.style.display = 'none'; // Hide the notification container
            }
          }

          // Attach click event listener to the notification icon
          const notificationIcon = document.getElementById('notificationIcon');
          if (notificationIcon) {
            notificationIcon.addEventListener('click', toggleNotificationContainer);
          } else {
            console.error('Notification icon element not found.');
          }

          // Attach click event listener to the document for detecting clicks outside the notification container
          document.addEventListener('click', handleClickOutside);




// Logout Functionality 

      function logout() {
        console.log('Logging out...');
        localStorage.removeItem("authenticated");  // Clear authentication flag
        localStorage.removeItem("user");           // Clear user session (if applicable)         
        sessionStorage.clear();                     // Clear session Storage
        window.location.href = '../index.html';     // Redirect to the login page
      }
      
          
        

