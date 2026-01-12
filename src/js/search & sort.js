// Check if the user is authenticated on page load
window.addEventListener("DOMContentLoaded", function() {
    // Check if the authentication flag exists in local storage
    if (!localStorage.getItem("authenticated")) {
        // If not authenticated, redirect to login page
        window.location.href = "index.html";
    }
  });


// Common function for searching data in the table
            function searchTable(inputId, tableId) {
                var input, filter, table, tr, td, i, txtValue;
                input = document.getElementById(inputId);
                filter = input.value.toUpperCase();
                table = document.getElementById(tableId);
                tr = table.getElementsByTagName("tr");

                for (i = 0; i < tr.length; i++) {
                    // Loop through all table rows, and hide those that don't match the search query
                    td = tr[i].getElementsByTagName("td");
                    for (var j = 0; j < td.length; j++) {
                        if (td[j]) {
                            txtValue = td[j].textContent || td[j].innerText;
                            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                                tr[i].style.display = "";
                                break; // Break out of inner loop, as we found a match
                            } else {
                                tr[i].style.display = "none";
                            }
                        }
                    }
                }
            }

            // Example usage:
            // Call this function with the input field ID and table ID where you want to perform searching
            // For example, for view product page:
            // <input type="text" id="searchInputProduct" placeholder="Search..." onkeyup="searchTable('searchInputProduct', 'productTable')">


// Common function for sorting table data
        function sortTable(tableId, columnIndex) {
            var table = document.getElementById(tableId);
            var rows = Array.from(table.getElementsByTagName('tr')).slice(1);
            var sortingDirection = table.rows[0].cells[columnIndex].getAttribute("data-sort") || "asc";
            var isNumericColumn = table.rows[0].cells[columnIndex].classList.contains("numeric");

            // Apply sorting
            rows.sort(function (a, b) {
                var aValue = a.cells[columnIndex].textContent.trim().toLowerCase();
                var bValue = b.cells[columnIndex].textContent.trim().toLowerCase();
                if (isNumericColumn) {
                    aValue = parseFloat(aValue) || 0;
                    bValue = parseFloat(bValue) || 0;
                    return sortingDirection === "asc" ? aValue - bValue : bValue - aValue;
                } else {
                    return sortingDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
            });

            // Reorder table rows
            rows.forEach(function(row) {
                table.tBodies[0].appendChild(row);
            });

            // Remove sorting indicators from all columns
            var headers = table.rows[0].cells;
            for (var i = 0; i < headers.length; i++) {
                headers[i].classList.remove("asc", "desc");
                headers[i].removeAttribute("data-sort"); // Remove sorting direction attribute
            }

            // Update sorting direction attribute of the column header
            if (sortingDirection === "asc") {
                table.rows[0].cells[columnIndex].setAttribute("data-sort", "desc");
                table.rows[0].cells[columnIndex].classList.add("asc");
            } else if (sortingDirection === "desc") {
                table.rows[0].cells[columnIndex].setAttribute("data-sort", "");
                table.rows[0].cells[columnIndex].classList.add("desc");
            } else {
                table.rows[0].cells[columnIndex].setAttribute("data-sort", "asc");
            }
        }

        // Example usage:
        // Call this function with the table ID and the index of the column you want to sort
        // For example, for view product page:
        // <th onclick="sortTable('productTable', 1)">Product ID</th>
