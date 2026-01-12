async function fetchMessages() {
  const apiKey = 'AIzaSyD7eX6VGCDHXBzF63CAHDfaP1-WFp3jcoI'; // Your API key
  const sheetId = '1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng'; // Your Sheet ID
  const range = 'Message!A2:A'; // The range to fetch data from
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const messages = data.values ? data.values.map(row => row[0]) : []; // Extract messages from the response

      const messageList = document.getElementById('message-list');
      messageList.innerHTML = ''; // Clear any previous messages

      messages.forEach(message => {
          const listItem = document.createElement('li');
          listItem.classList.add('message-list-item');

          // Extract URLs and replace them with "Read More" links
          const urlPattern = /(https?:\/\/[^\s]+)/g;
          const urls = message.match(urlPattern);
          if (urls) {
              const messageWithoutUrls = message.replace(urlPattern, '');
              listItem.textContent = messageWithoutUrls;

              urls.forEach(url => {
                  const link = document.createElement('a');
                  link.href = url;
                  link.textContent = 'Read More';
                  link.target = '_blank';
                  link.style.marginLeft = '5px'; // Optional: Add margin for readability
                  listItem.appendChild(link);
              });
          } else {
              listItem.textContent = message;
          }

          messageList.appendChild(listItem);
      });
  } catch (error) {
      console.error('Error fetching messages:', error);
  }
}

// Call the function to fetch and display messages
fetchMessages();
