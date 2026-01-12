const userProfile = {
    name: "Hasan",
    email: "hasanthp@gmail.com",
    designation: "Pharmacist",
    office: "Babrijhar Health Seb Center",
    imgUrl: "src/User Profile.png" // Placeholder image
    // imgUrl: "https://lh3.googleusercontent.com/rd-d/ALs6j_FIV24Zp4ab1K2WF1RkBY068uxrbOYgk7DV6vI_6bzOwaABgjvUYY8qOFcIA59TKcHmqHfcULbAbucyONWc9RLYaUjsQpXdmdEQoGqG8le3z6G0J9hOUa9AtOMIWv-MqeGbODXHgScGedCaScsX0yZEMsvEjjaudtyMNd4_JiA24M87VY57Gq2TqgT9zFMfCLxNTNaSm17YO-_UJBaibTeYZYQHOLO3baKdfaxZotKGZg-1Q8uMsLqfBiHr9bY1SR0nS_e7qI3oia1cvVD0UtrKPtsydrVT3MsbQwlUq5hlAx_dXgel50krIXcmwN-wTZrpIUpXMjqhhFIvZla75NV4aFF9T2tjLjPjmoX23PGn0gnvwRTmpG7c9_i4zNIVNwDVk2qtEsrCeAqM4bWodRZROzQqfhQV1VfFQGhXxEsqQ1AMk1xnjFZuoGquleGlQbD5NEyWc00WRvcNP9OOT3IJ8S42Zjz3Lev6HbWPU7T5LzJxAuTApR0dwtxdeXRwuHG3zzG5yrt7oyXLLx4hnlZVuqDY_jEenz-eLrkMyq201aHgLvmAtD1D4EsNd7JOvEOBz5GgLMXB2pDLyleTXys7TFEnPXELiOAPinNOr9Ws7dy1uKlqrHGAijuhUSmfSjfam6RNGE7BeY8PhQ1v1NwOBxel2BL-ayeTCQwxicRgQa_vwTTnzOWeWT3FAFb5txvZ8AkvTQR6EwR9BqyKGfo5TlEuzxT4C-l6qr95IszkUUmcBD_fEaPzX90oCaVlZu6tCo3PLhuyOpvyka_wcNHYDkBq4Z86mbFGZzg6c77nW2o4NQqb9whzHtJpyVplPSUoI2DcJEZkxDOpKNrgTMhzfpJTOi-LNOKefh285z6z-OPzTBZaBDHR4ecEmoMu2FHA8tkcVloBhI14SsUuESBW46ZVjI4JMYa9oPXxWsyLap4N6hegfsxXM0CiaWcWudh5WVA_cxXR2KxOFz1t7aOaMJ4e5hvPmzScF41wQPdNZVm4bo_BpbfOPLP-giVWDwhu3t3y5zmBZiIcEeQfKZZOgzeKcmdd9W3pigp5Gm5eik-YzNo" // Placeholder image
};

function logout() {
    console.log('Logging out user...');
    // Clear the session flag
    localStorage.removeItem('isLoggedIn'); 
    
    // Redirect to the login page (index.html)
    window.location.replace('index.html'); 
}

// Attach the global logout function to the window object so it can be called directly
// from an HTML onclick attribute (e.g., in dashbioar.html's profile dropdown).
window.logout = logout; 

const navigationLinks = [
    { 
        name: "Dashboard", 
        icon: "fa-solid fa-dashboard", 
        href: "dashboard.html", 
        pageId: "dashboard-standalone", 
        sub: [] 
    },
    { 
        name: "Action", 
        icon: "fa-solid fa-plus-circle", 
        href: "#action", 
        pageId: "action-group",
        sub: [
            { 
                name: "Sell Mobile", 
                href: "Add Sell Mobile.html", 
                pageId: "add-sell-mob-standalone" }, 
            { 
                name: "Purchase Mobile", 
                href: "Add Purchases Mobile.html", 
                pageId: "add-purchase-mob-standalone"  },
            { 
                name: "Main Stock Purchase ", 
                href: "Add Main Purchases.html", 
                pageId: "add-main-purchase-standalone"  },
            // { 
            //     name: "Main Stock Sell", 
            //     href: "Add Main Sell.html", 
            //     pageId: "add-main-sell-standalone"  },
            { 
                name: "Add Sell", 
                href: "Add Sell.html", 
                pageId: "add-sell-standalone"  },
            { 
                name: "Add Purchase", 
                href: "Add Purchases.html", 
                pageId: "add-purchase-standalone"  },
            { 
                name: "Add Product", 
                href: "Add Products.html", 
                pageId: "add-product-standalone"  },
            { 
                name: "Add Generic", 
                href: "Add Generics.html", 
                pageId: "add-generic-standalone" }, 
            { 
                name: "Add Company", 
                href: "Add Companies.html", 
                pageId: "add-company-standalone" }, 
        ]
    },
    { 
        name: "View", 
        icon: "fa-solid fa-eye", 
        href: "#view", 
        pageId: "view-group",
            sub: [

            { 
                name: "View Purchase", 
                href: "View Purchases.html",
                pageId: "view-purchase-standalone"  },
            { 
                name: "View Main Purchase", 
                href: "View Main Purchases.html",
                pageId: "view-main-purchase-standalone"  },
            { 
                name: "View Sell", 
                href: "View Sell.html",
                pageId: "view-sell-standalone"   },
            { 
                name: "View Product", 
                href: "View Products.html",
                pageId: "view-pruducts-standalone"    },
            { 
                name: "View Generic", 
                href: "View Generics.html",
                pageId: "view-generic-standalone"    },
            { 
                name: "View Company", 
                href: "View Companies.html",
                pageId: "view-company-standalone"    },
            { 
                name: "View Stock", 
                href: "View Stock.html",
                pageId: "view-stock-standalone"    },
            { 
                name: "View Main Stock", 
                href: "View Main Stock.html",
                pageId: "view-Main-stock-standalone"    },
        ]
    },
    { 
        name: "Reports", 
        icon: "fa-solid fa-chart-line", 
        href: "#reports", 
        pageId: "reports-group",
        sub: [
            { 
                name: "Ledger", 
                href: "Ledger.html",
                pageId: "ledger-standalone"    },
            { 
                name: "Sell Reports", 
                href: "Report Sell.html",
                pageId: "report-sell-standalone"    },
            { 
                name: "Purchases Reports", 
                href: "Report Purchases.html",
                pageId: "report-purchase-standalone"    },
        ]
    },
    { 
        name: "Info", 
        icon: "fa-solid fa-circle-info", 
        href: "#info", 
        pageId: "info-group",
        sub: [
            { 
                name: "Developer", 
                href: "Developer.html",
                pageId: "developer-standalone"    },
            { 
                name: "FAQ", 
                href: "FAQ.html",
                pageId: "faq-standalone"    },
            {
                name: "Requirements", 
                href: "Requirement.html",
                pageId: "requirement-standalone"    },
            {
                name: "Feedback", 
                href: "Feedback.html",
                pageId: "feedback-standalone"    },
            { 
                name: "Messages", 
                href: "Message.html",
                pageId: "message-standalone"    },
        ]
    },
    { 
        name: "Settings", 
        icon: "fa-solid fa-gear", 
        href: "Settings.html", 
        pageId: "settings-standalone", 
        sub: [] },
];

// --- HTML Templates ---

const generateHeaderHTML = (isCollapsed) => `
    <header class="main-header">
        <div class="header-left">
            <button class="menu-toggle-btn" id="menu-toggle" aria-label="Toggle Menu">
                <i class="fa-solid fa-bars"></i>
            </button>
            <h1 class="header-title">Babrijhar USC</h1>
        </div>
        <div class="header-right">
            <div class="dropdown-wrapper">
                <button class="icon-btn" id="notifications-btn" aria-expanded="false" aria-controls="notifications-menu" aria-label="Notifications">
                    <i class="fa-solid fa-bell"></i>
                </button>
                <ul class="dropdown-menu notification-dropdown hidden" id="notifications-menu">
                    <li class="no-notifications">No new notifications.</li>
                </ul>
            </div>

            <div class="dropdown-wrapper">
                <button class="profile-btn" id="profile-btn" aria-expanded="false" aria-controls="profile-menu" aria-label="User Profile">
                    <div class="profile-img-container">
                        <img src="${userProfile.imgUrl}" alt="User Avatar" class="profile-img">
                    </div>
                    <span class="username-text">${userProfile.name}</span>
                    <i class="fas fa-caret-down text-arrow"></i>
                </button>
                <div class="dropdown-menu hidden" id="profile-menu">
                    <div class="profile-details-top">
                        <img src="${userProfile.imgUrl}" alt="User Avatar" class="profile-img" style="width: 2.5rem; height: 2.5rem;">
                        <div>
                            <p class="user-name-small">${userProfile.name}</p>
                            <p class="user-info-small">${userProfile.email}</p>
                            <p class="user-info-small">${userProfile.designation}</p>
                            <p class="user-info-small">${userProfile.office}</p>
                        </div>
                    </div>
                    <div class="dropdown-link-area">
                        <button class="logout-btn" onclick="logout();">Log Out</button>
                    </div>
                </div>
            </div>
        </div>
    </header>
`;

const generateSidebarHTML = (currentPageId, isCollapsed) => {
    let navHtml = `
        <div class="menu-header">
            <h2>Inventory App</h2>
            <p class="app-info">v2.0</p>
        </div>
        <div class="sidebar-nav-scroll no-scrollbar">
            <ul class="menu-list">
    `;

    navigationLinks.forEach(item => {
        let isActive = currentPageId === item.pageId;
        const hasSubmenu = item.sub.length > 0;
        
        // Check if any submenu link matches the current page
        if (hasSubmenu) {
            const standaloneCompanyLink = item.sub.find(sub => sub.pageId === currentPageId);
            if (standaloneCompanyLink) {
                isActive = true;
            }
        }

        const activeClass = isActive ? 'active' : '';
        const submenuToggleClass = hasSubmenu ? 'submenu-toggle' : '';

        navHtml += `
            <li class="menu-item ${activeClass}" data-page="${item.pageId}">
                <a href="${item.href}" class="menu-link ${submenuToggleClass}">
                    <span class="menu-link-icon-text">
                        <i class="menu-icon ${item.icon}"></i>
                        <span class="menu-text">${item.name}</span>
                    </span>
                    ${hasSubmenu ? `<i class="fa-solid fa-angle-down submenu-arrow"></i>` : ''}
                </a>
        `;

        if (hasSubmenu) {
            navHtml += `<ul class="submenu">`;
            item.sub.forEach(subItem => {
                const subIsActive = subItem.pageId === currentPageId ? 'active-link' : '';
                navHtml += `
                    <li class="${subIsActive}">
                        <a href="${subItem.href}" class="submenu-link">${subItem.name}</a>
                    </li>
                `;
            });
            navHtml += `</ul>`;
        }
        navHtml += `</li>`;
    });

    navHtml += `
            </ul>
        </div>
        <div class="user-profile-container-nav">
            <div class="profile-info-nav">
                <img src="${userProfile.imgUrl}" alt="User Avatar" class="profile-img">
                <div class="nav-user-details">
                    <p class="user-name-small">${userProfile.name}</p>
                    <p class="user-info-small">Pharmacist</p>
                    <p class="user-info-small">Babrijhar Health Sub Center</p>
                </div>
            </div>
        </div>
    `;

    return `<nav class="sidebar ${isCollapsed ? 'collapsed' : ''}" id="sidebar">${navHtml}</nav>`;
};


// --- Initialization and Event Handling ---

function initializeLayout(currentPageId) {
    // FIX 5: Set default state to collapsed if no preference is saved
let isSidebarCollapsed = localStorage.getItem('sidebarCollapsed');

    // Store the saved preference (or default to true)
    let savedPreference = true; // Default state: collapsed
    if (isSidebarCollapsed !== null) {
        savedPreference = (isSidebarCollapsed === 'true');
    } else {
        localStorage.setItem('sidebarCollapsed', 'true'); // Save the default preference
    }

    // *** NEW LOGIC: Always start as collapsed upon page load, 
    // regardless of the saved state, to ensure it closes after navigation. ***
    isSidebarCollapsed = true; 
    
    // The rest of the initialization uses `isSidebarCollapsed = true`

    // 1. Inject HTML
    document.getElementById('header-placeholder').innerHTML = generateHeaderHTML(isSidebarCollapsed);
    document.getElementById('sidebar-placeholder').innerHTML = generateSidebarHTML(currentPageId, isSidebarCollapsed);

    // 2. Initial Collapse State
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.getElementById('main-content');

    // Helper to control the sidebar state on mobile
    const closeSidebar = () => {
        // Find the actual sidebar element (important for mobile closing)
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
             // In your original CSS, the mobile state likely involves removing a class like 'active' or adding 'hidden'
             // Since we don't have the CSS, we stick to the existing class toggles for desktop
             // For mobile, we might just rely on the CSS that hides the sidebar below 768px when 'collapsed' is true, 
             // but here we ensure the desktop state is maintained
        }
    };

    // Apply initial state
    if (isSidebarCollapsed) {
        sidebar.classList.add('collapsed');
        if (mainContent) mainContent.classList.add('collapsed');
    }

    // 3. Attach Event Listeners

    // Toggle Menu (Header Button)
    document.getElementById('menu-toggle').addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        if (mainContent) mainContent.classList.toggle('collapsed');
        const newState = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', newState);
    });

    // Submenu Toggle (Navigation)
    document.querySelectorAll('.submenu-toggle').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Always prevent default for submenu toggles
            
            const parentItem = link.closest('.menu-item');
            const isCurrentlyActive = parentItem.classList.contains('active'); 

            // Handle first click to open collapsed sidebar on desktop
            if (sidebar.classList.contains('collapsed') && window.innerWidth >= 768) {
                sidebar.classList.remove('collapsed');
                if (mainContent) mainContent.classList.remove('collapsed');
                localStorage.setItem('sidebarCollapsed', 'false');
                return; 
            }
            
            if (isCurrentlyActive) {
                parentItem.classList.remove('active');
            } else {
                // Close all other open menus
                document.querySelectorAll('.menu-item.active').forEach(item => {
                    if (item !== parentItem) {
                        item.classList.remove('active');
                    }
                });
                // Then, open the current menu
                parentItem.classList.add('active');
            }
        });
    });

    // New logic: Close sidebar on mobile when a submenu link is clicked
    document.querySelectorAll('.submenu-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                closeSidebar();
            }
        });
    });

    // New logic: Close sidebar on mobile when a top-level link (without submenu) is clicked
    document.querySelectorAll('.menu-link:not(.submenu-toggle)').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                closeSidebar();
            }
        });
    });

    // Dropdown Toggles (Header)
    function setupDropdown(buttonId, menuId) {
        const button = document.getElementById(buttonId);
        const menu = document.getElementById(menuId);
        if (button && menu) {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const isHidden = menu.classList.contains('hidden');
                
                // Close all other dropdowns
                document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden'));
                
                if (isHidden) {
                    menu.classList.remove('hidden');
                    
                    // *** CRITICAL FIX: Load notifications when the button is clicked ***
                    if (buttonId === 'notifications-btn' && typeof window.renderNotifications === 'function') {
                        window.renderNotifications();
                    }
                    // *****************************************************************
                }
            });
            document.addEventListener('click', (e) => {
                if (!button.contains(e.target) && !menu.contains(e.target)) {
                    menu.classList.add('hidden');
                }
            });
        }
    }
    setupDropdown('notifications-btn', 'notifications-menu');
    setupDropdown('profile-btn', 'profile-menu');
}

window.initializeLayout = initializeLayout;
