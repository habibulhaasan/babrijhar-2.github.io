 // ADD, View Sell App Script Code //

        //* Sell Html to Google Sheet *//

        function postSellData(e) {
          var ss = SpreadsheetApp.openById("1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng");
          var sellSheet = ss.getSheetByName("Sell");

          // Get the current date and time in the specified format "dd/mm/yyyy, hh:mm:ss a" with UTC+6 time zone
          var currentDateTime = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', hour12: true });

          // Get the number of rows submitted in the form
          var numRows = e.parameters['product_id[]'].length;

          // Loop through the rows and append each row separately
          for (var i = 0; i < numRows; i++) {
              var productId = e.parameters['product_id[]'][i];
              var productName = e.parameters['product_name[]'][i];
              var sellQuantity = e.parameters['sell_quantity[]'][i];
              var sellPrice = e.parameters['sell_price[]'][i];
              var totalPrice = e.parameters['total_price[]'][i];

              // Append data along with submission date and time to the specified sheet
              sellSheet.appendRow([currentDateTime, productId, productName, sellQuantity, sellPrice, totalPrice]);
          }

          // Return success message as JSON
          return ContentService.createTextOutput(JSON.stringify({ success: true }));
      }


// Post sell data mobile with date picker

function postSellDataMobilewithDate(e) {
  var ss = SpreadsheetApp.openById("1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng");
  var sellSheet = ss.getSheetByName("Sell");

  // Get the date selected from the date picker (format: yyyy-mm-dd)
  var sellDateParam = e.parameter.sell_date || "";
  var sellDate;

  if (sellDateParam) {
    // Convert picked date to JavaScript Date object
    var dateObj = new Date(sellDateParam);
    sellDate = formatDateTime(dateObj);
  } else {
    // If no date picked, use current date and time
    sellDate = formatDateTime(new Date());
  }

  // Get the number of rows submitted in the form
  var numRows = e.parameters['product_id[]'].length;

  // Loop through the rows and append each row separately
  for (var i = 0; i < numRows; i++) {
    var productId = e.parameters['product_id[]'][i];
    var productName = e.parameters['product_name[]'][i];
    var sellQuantity = e.parameters['sell_quantity[]'][i];
    var sellPrice = e.parameters['sell_price[]'][i];
    var totalPrice = e.parameters['total_price[]'][i];

    // Append data → [Formatted Date, Product ID, Product Name, Quantity, Price, Total]
    sellSheet.appendRow([sellDate, productId, productName, sellQuantity, sellPrice, totalPrice]);
  }

  // Return success message as JSON
  return ContentService.createTextOutput(JSON.stringify({ success: true }));
}

// Helper function to format date-time as "dd/mm/yyyy, h:mm:ss am/pm"
function formatDateTime(date) {
  var dd = ("0" + date.getDate()).slice(-2);
  var mm = ("0" + (date.getMonth() + 1)).slice(-2);
  var yyyy = date.getFullYear();

  var hours = date.getHours();
  var minutes = ("0" + date.getMinutes()).slice(-2);
  var seconds = ("0" + date.getSeconds()).slice(-2);
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // convert 0 to 12

  return dd + '/' + mm + '/' + yyyy + ', ' + hours + ':' + minutes + ':' + seconds + ' ' + ampm;
}

// Post Purchase data mobile with date picker

function postPurchaseDataMobilewithDate(e) {
  var ss = SpreadsheetApp.openById("1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng");
  var purchaseSheet = ss.getSheetByName("Purchases");

  // Get the date selected from the date picker (format: yyyy-mm-dd)
  var purchaseDateParam = e.parameter.purchase_date || "";
  var purchaseDate;

  if (purchaseDateParam) {
    // Convert picked date to JavaScript Date object
    var dateObj = new Date(purchaseDateParam);
    purchaseDate = purchaseformatDateTime(dateObj);
  } else {
    // If no date picked, use current date and time
    purchaseDate = purchaseformatDateTime(new Date());
  }

  // Get the number of rows submitted in the form
  var numRows = e.parameters['product_id[]'].length;

  // Loop through the rows and append each row separately
  for (var i = 0; i < numRows; i++) {
    var productId = e.parameters['product_id[]'][i];
    var productName = e.parameters['product_name[]'][i];
    var purchaseQuantity = e.parameters['quantity[]'][i];
    var purchasePrice = e.parameters['unit_price[]'][i];
    var totalPrice = e.parameters['total_price[]'][i];

    // Append data → [Formatted Date, Product ID, Product Name, Quantity, Price, Total]
    purchaseSheet.appendRow([purchaseDate, productId, productName, purchaseQuantity, purchasePrice, totalPrice]);
  }

  // Return success message as JSON
  return ContentService.createTextOutput(JSON.stringify({ success: true }));
}

// Helper function to format date-time as "dd/mm/yyyy, h:mm:ss am/pm"
function purchaseformatDateTime(date) {
  var dd = ("0" + date.getDate()).slice(-2);
  var mm = ("0" + (date.getMonth() + 1)).slice(-2);
  var yyyy = date.getFullYear();

  var hours = date.getHours();
  var minutes = ("0" + date.getMinutes()).slice(-2);
  var seconds = ("0" + date.getSeconds()).slice(-2);
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // convert 0 to 12

  return dd + '/' + mm + '/' + yyyy + ', ' + hours + ':' + minutes + ':' + seconds + ' ' + ampm;
}




//* View Sale data on html *//

    function getSellData() {
    var ss = SpreadsheetApp.openById("1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng");
    var sellSheet = ss.getSheetByName("Sell");
    var numRows = sellSheet.getLastRow() - 1; // Exclude header row
    var numCols = sellSheet.getLastColumn();
    var data = sellSheet.getRange(2, 1, numRows, numCols).getValues();

    // Reverse the order of the data array
    data.reverse();

    // Format date in the data array to "dd/mm/yyyy, hh:mm:ss a"
    for (var i = 0; i < data.length; i++) {
        var originalDateString = data[i][0];
        console.log('Original date:', originalDateString);

        // Split the date string into components
        var dateComponents = originalDateString.split(/[/, ]/);
        var day = dateComponents[0];
        var month = dateComponents[1];
        var year = dateComponents[2];
        var time = dateComponents[3] + ' ' + dateComponents[4]; // Including AM/PM

        // Create a new Date object in the correct format
        var parsedDate = new Date(`${year}-${month}-${day}T${time}`);

        // Format the date using toLocaleString with 'en-GB' locale
        var currentDateTime = parsedDate.toLocaleString('en-GB', {
            timeZone: 'Asia/Dhaka',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        console.log('Formatted date:', currentDateTime);
        data[i][0] = currentDateTime;
    }

    return data;
}




// ADD, View Companies App Script Code //
      
  //* Company Html to Google Sheet *//

          function postCompanyData(e) {
              var ss = SpreadsheetApp.openById("1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng");
              var companySheet = ss.getSheetByName("Companies");

              var currentDateTime = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', hour12: true });

              var lastRow = companySheet.getLastRow();
              var lastCompanyID = companySheet.getRange(lastRow, 2).getValue();

              var lastIDNumber = parseInt(lastCompanyID.substring(1)); // Remove 'C' and parse as number
              var nextIDNumber = lastIDNumber + 1;
              var nextCompanyID = 'C' + nextIDNumber.toString();

              var numRows = e.parameters['company_name[]'].length;

              for (var i = 0; i < numRows; i++) {
                  var companyId = nextCompanyID;
                  var companyName = e.parameters['company_name[]'][i];

                  var newRow = [
                      currentDateTime,
                      companyId,
                      companyName
                  ];

                  companySheet.appendRow(newRow);

                  var lastIDNumber = parseInt(companyId.substring(1));
                  nextCompanyID = 'C' + (lastIDNumber + 1).toString();
              }

              return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
          }

        
        //* View Company data on html *//
        
          function getCompanyData() {
              var ss = SpreadsheetApp.openById("1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng");
              var companySheet = ss.getSheetByName("Companies");
              var numRows = companySheet.getLastRow() - 1; // Exclude header row
              var numCols = companySheet.getLastColumn();
              var data = companySheet.getRange(2, 1, numRows, numCols).getValues();

              // Reverse the order of the data array
              data.reverse();

              // Format date in the data array to "dd/mm/yyyy, hh:mm:ss PM"
              for (var i = 0; i < data.length; i++) {
                  var date = new Date(data[i][0]);
                  var formattedDate = date.toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                  data[i][0] = formattedDate;
              }

              return data;
          }


// ADD, View Purchases App Script Code //
    
    //* Purchases Html to Google Sheet *//

        function postPurchasesData(e) {
            var ss = SpreadsheetApp.openById("1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng");
            var purchaseSheet = ss.getSheetByName("Purchases");
        
            // Get the current date and time in the specified format "dd/mm/yyyy, hh:mm:ss a" with UTC+6 time zone
           var currentDateTime = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', hour12: true });
        
            // Get the number of rows submitted in the form
            var numRows = e.parameters['product_id[]'].length;
        
            // Loop through the rows and append each row separately
            for (var i = 0; i < numRows; i++) {
            var productId = e.parameters['product_id[]'][i];
            var productName = e.parameters['product_name[]'][i];
            var quantity = e.parameters['quantity[]'][i];
            var unitPrice = e.parameters['unit_price[]'][i];
            var totalPrice = e.parameters['total_price[]'][i];
        
            // Append data along with submission date and time to the specified sheet
            purchaseSheet.appendRow([currentDateTime.toString(), productId, productName, quantity, unitPrice, totalPrice]);
            }
        
            // Return success message as JSON
            return ContentService.createTextOutput(JSON.stringify({ success: true }));
        }
        
        //* View Purchases data on html *//
        
        function getPurchaseData() {
            var ss = SpreadsheetApp.openById("1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng");
            var purchaseSheet = ss.getSheetByName("Purchases");
            var numRows = purchaseSheet.getLastRow() - 1; // Exclude header row
            var numCols = purchaseSheet.getLastColumn();
            var data = purchaseSheet.getRange(2, 1, numRows, numCols).getValues();
        
            // Reverse the order of the data array
            data.reverse();

            // Format date in the data array to "dd/mm/yyyy, hh:mm:ss a"
              for (var i = 0; i < data.length; i++) {
                  var currentDateTime = new Date(data[i][0]).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                  data[i][0] = currentDateTime;
              }
        
            return data;
        }
        

// ADD, View Generics App Script Code //

        //* Generic Html to Google Sheet *//

                function postGenericData(e) {
    var ss = SpreadsheetApp.openById("1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng");
    var genericSheet = ss.getSheetByName("Generics");

    var currentDateTime = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', hour12: true });

    var lastRow = genericSheet.getLastRow();
    var lastGenericID = genericSheet.getRange(lastRow, 2).getValue();

    var lastIDNumber = parseInt(lastGenericID.substring(1)); // Remove 'G' and parse as number
    var nextIDNumber = lastIDNumber + 1;
    var nextGenericID = 'G' + nextIDNumber.toString();

    var numRows = e.parameters['generic_name[]'].length;

    for (var i = 0; i < numRows; i++) {
        var genericId = nextGenericID; 
        var genericName = e.parameters['generic_name[]'][i];
        var genericInfo = e.parameters['generic_info[]'][i];

        var newRow = [
            currentDateTime, 
            genericId, 
            genericName, 
            genericInfo
        ];

        genericSheet.appendRow(newRow);

        var lastIDNumber = parseInt(genericId.substring(1));
        nextGenericID = 'G' + (lastIDNumber + 1).toString();
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
}


        // View Generic data New //

        function getGenericData() {
              var spreadsheetId = '1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng';
              var sheetName = 'Generics';
              var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);

              // Check if the sheet exists
              if (!sheet) {
                  return '<p>Error: Sheet "' + sheetName + '" not found.</p>';
              }

              var range = sheet.getDataRange();
              var values = range.getValues();

              var html = '<table>';
              // Start iterating from index 1 to exclude the first row
              for (var i = 1; i < values.length; i++) {
                  var row = values[i];
                  html += '<tr>';
                  row.forEach(function(cell, index) {
                      if (index === 0) {
                          // Format date column
                          var date = new Date(cell);
                          var formattedDate = date.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                          html += '<td>' + formattedDate + '</td>';
                      } else if (index === 3 && cell.toString().startsWith('http')) {
                          // Check if the cell content starts with 'http' to identify URLs
                          html += '<td><a href="' + cell + '" target="_blank">Read More</a></td>';
                      } else {
                          html += '<td>' + cell + '</td>';
                      }
                  });
                  html += '</tr>';
              }
              html += '</table>';

              return html;
          }



// ADD, View Products App Script Code //

        //* Product Html to Google Sheet *//

        function postProductData(e) {
    var ss = SpreadsheetApp.openById("1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng");
    var productSheet = ss.getSheetByName("Products");

    var currentDateTime = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', hour12: true });

    var lastRow = productSheet.getLastRow();
    var lastProductID = productSheet.getRange(lastRow, 2).getValue();

    var lastIDNumber = parseInt(lastProductID.substring(1)); // Remove 'P' and parse as number
    var nextIDNumber = lastIDNumber + 1;
    var nextProductID = 'P' + nextIDNumber.toString();

    var numRows = e.parameters['product_name[]'].length;

    for (var i = 0; i < numRows; i++) {
        var productId = nextProductID; 
        var productName = e.parameters['product_name[]'][i];
        var productType = e.parameters['product_type[]'][i];
        var genericName = e.parameters['generic_name[]'][i];
        var companyName = e.parameters['company_name[]'][i];

        var newRow = [
            currentDateTime, 
            productId, 
            productName, 
            productType, 
            genericName, 
            companyName
        ];

        productSheet.appendRow(newRow);

        var lastIDNumber = parseInt(productId.substring(1));
        nextProductID = 'P' + (lastIDNumber + 1).toString();
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
}



                    
        //* View Product data on html *//
        
          function getProductData() {
              var ss = SpreadsheetApp.openById("1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng");
              var productSheet = ss.getSheetByName("Products");
              var numRows = productSheet.getLastRow() - 1; // Exclude header row
              var numCols = productSheet.getLastColumn();
              var data = productSheet.getRange(2, 1, numRows, numCols).getValues();

              // Reverse the order of the data array
              data.reverse();

              // Format date in the data array to "dd/mm/yyyy, hh:mm:ss PM"
              for (var i = 0; i < data.length; i++) {
                  var date = new Date(data[i][0]);
                  var formattedDate = date.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                  data[i][0] = formattedDate;
              }

              return data;
          }

        
// View Stock App Script Code //

    //* View Stock data on html *//
            function getStockData() {
            var ss = SpreadsheetApp.openById("1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng");
            var stockSheet = ss.getSheetByName("Stock");
            var range = stockSheet.getDataRange();
            var numRows = range.getNumRows();
            var numCols = range.getNumColumns();
            var data = range.getValues();
            var filteredData = [];

            // Iterate through the data, skip the first row, and skip empty rows and cells containing formulas
            for (var i = 1; i < numRows; i++) {
                var rowData = [];
                for (var j = 0; j < numCols; j++) {
                    var cell = range.getCell(i + 1, j + 1); // Adjusted row index by adding 1
                    if (cell.getValue() !== "" && !cell.isPartOfMerge()) {
                        rowData.push(cell.getValue());
                    }
                }
                if (rowData.length > 0) {
                    filteredData.push(rowData);
                }
            }

            return filteredData;
        }

// Company Name Datalist //

      function getCompanyNames() {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("companies");
        var data = sheet.getRange("C:C").getValues(); // Assuming company names are in column C
        var companyNames = [];
        
        for (var i = 0; i < data.length; i++) {
          if (data[i][0]) { // Check if cell is not empty
            companyNames.push(data[i][0]);
          }
        }
        
        return companyNames;
      }

// Generic Name Datalist //


      function getGenericNames() {
          var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("generics");
          var data = sheet.getRange("C:C").getValues(); // Assuming generic names are in column C
          var genericNames = [];
          
          for (var i = 0; i < data.length; i++) {
            if (data[i][0]) { // Check if cell is not empty
              genericNames.push(data[i][0]);
            }
          }
          
          return genericNames;
        }

// Product ID to Product Name //


      function getProductDetails(productId) {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("products");
        var data = sheet.getRange("B:C").getValues(); // Assuming product IDs are in column B and product names are in column C

        for (var i = 0; i < data.length; i++) {
          if (data[i][0] == productId) {
            return data[i][1]; // Return the product name (assuming it's in column C)
          }
        }

        return "Product not found"; // Return a default message if product ID is not found
      }

// Stock Report Chart  //

      function getStockChart() {
        var sheetId = "1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng";
        var sheetName = "Stock";
        var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
        
        // Select columns A to F, excluding column C
        var dataRange = sheet.getRange('A:F').getValues().map(row => [row[0], row[1], row[3], row[4], row[5]]);

        // Filter out rows with blank cells or cells containing only whitespace
        var filteredValues = dataRange.filter(row => row.some(cell => cell.toString().trim() !== ""));
        
        // Skip the first row
        var data = filteredValues.slice(1); // Remove the first row
        
        return JSON.stringify(data);
      }


// Setting to update User info //

    // Save user data html to sheet

                function settingsForm(e) {
                var formData = e.parameter; // Access form data directly
                
                var sheetId = "1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng"; // Replace with your Google Sheet ID
                var sheetName = "Settings"; // Replace with your sheet name
                
                var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
                
                if (!sheet) {
                    return ContentService.createTextOutput("Error: Sheet not found").setMimeType(ContentService.MimeType.TEXT);
                }
                
                // Clear existing data in cells A2:C2
                sheet.getRange("A2:C2").clearContent();
                
                // Write form data to cells A2:C2
                sheet.getRange("A2").setValue(formData.username);
                sheet.getRange("B2").setValue(formData.designation);
                sheet.getRange("C2").setValue(formData.company);
                
                return ContentService.createTextOutput("Form data submitted successfully").setMimeType(ContentService.MimeType.TEXT);
            }

            
    // Get User info //
          function getUserInfo() {
            var sheet = SpreadsheetApp.openById('1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng').getSheetByName('Settings');
            var userInfo = {
                username: sheet.getRange('A2').getValue(),
                designation: sheet.getRange('B2').getValue(),
                company: sheet.getRange('C2').getValue(),
                profilePicture: sheet.getRange('D2').getValue()
            };
            return userInfo;
        }


// Message Content //


    // Function to fetch messages from Google Sheet and serve as JSON
    function getMessages() {
        var sheetId = "1lLzGvnJBQKPFpRPSRYjb_Q6N80G9mB_7_sLPR-0N5Ng";
        var sheetName = "Message";
        var range = sheetName + "!A:A";
  
        var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
        var values = sheet.getRange(range).getValues();
        var messages = [];
  
        // Loop through each value in column A and add it to the messages array
        values.forEach(function(row) {
          if (row[0] !== "") {
            messages.push(row[0]);
          }
        });
  
        // Return messages as JSON
        return ContentService.createTextOutput(JSON.stringify({ messages: messages }))
          .setMimeType(ContentService.MimeType.JSON);
      }


      
// Jump to specific View function //

    function doGet(e) {
      if (e.parameter.function == "getSellData") {
          var data = getSellData();
          return ContentService.createTextOutput(JSON.stringify(data));
      } else if (e.parameter.function == "getCompanyData") {
          var data = getCompanyData();
          return ContentService.createTextOutput(JSON.stringify(data));
      } else if (e.parameter.function == "getPurchaseData") {
          var data = getPurchaseData();
          return ContentService.createTextOutput(JSON.stringify(data));
      } else if (e.parameter.function == "getGenericData") {
          return ContentService.createTextOutput(getGenericData()).setMimeType(ContentService.MimeType.HTML);
      } else if (e.parameter.function == "getProductData") {
          var data = getProductData();
          return ContentService.createTextOutput(JSON.stringify(data));
      } else if (e.parameter.function == "getStockData") {
          var data = getStockData();
          return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
      } else if (e.parameter.function == "getCompanyNames") {
          var companyNames = getCompanyNames();
          return ContentService.createTextOutput(JSON.stringify(companyNames));
      } else if (e.parameter.function == "getGenericNames") {
          var genericNames = getGenericNames();
          return ContentService.createTextOutput(JSON.stringify(genericNames));
      } else if (e.parameter.function == "getProductDetails") {
          var productId = e.parameter.productId;
          var productName = getProductDetails(productId);
          return ContentService.createTextOutput(productName);
      } else if (e.parameter.function == "getStockChart") {
          var output = ContentService.createTextOutput();
          output.setMimeType(ContentService.MimeType.JSON);
          output.setContent(getStockChart());
          return output;
      } else if (e.parameter.function == "getMessages") {
            return getMessages();
      } else if (e.parameter.function == "getUserInfo") {
          var userInfo = getUserInfo();
          return ContentService.createTextOutput(JSON.stringify(userInfo)).setMimeType(ContentService.MimeType.JSON);
      
      
      // Handle invalid function name
      } else {
        return ContentService.createTextOutput("Invalid view function specified");
      }
    }

// Jump to specific Post function //

    function doPost(e) {
      var functionName = e.parameter.function;

      // Check the value of the function parameter and call the appropriate function
      if (functionName == "postSellData") {
          return postSellData(e);
      } else if (functionName == "postCompanyData") {
          return postCompanyData(e);
      } else if (functionName == "postPurchasesData") {
          return postPurchasesData(e);
      } else if (functionName == "postGenericData") {
          return postGenericData(e);
      } else if (functionName == "postProductData") {
          return postProductData(e);
      } else if (functionName == "settingsForm") {
          return settingsForm(e);
      } else if (functionName == "postSellDataMobilewithDate") {
          return postSellDataMobilewithDate(e);
      } else if (functionName == "postPurchaseDataMobilewithDate") {
          return postPurchaseDataMobilewithDate(e);


    // Handle invalid function name
      } else {
        return ContentService.createTextOutput("Invalid post function name specified");
      }
    }

