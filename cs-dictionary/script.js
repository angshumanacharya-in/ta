// script.js
let activePageKey = 'ALL';

// Boot up setup processes safe after browser finishes structure layout execution
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigationGrid();
    bindActionEvents();
    syncInitialRoute();
});

// Generate and append matching A-Z menu click triggers dynamically
function initializeNavigationGrid() {
    const gridNavContainer = document.getElementById('navigationGrid');
    if (!gridNavContainer) return;

    for (let i = 65; i <= 90; i++) {
        const charStr = String.fromCharCode(i);
        const btn = document.createElement('button');
        btn.className = 'alpha-btn';
        btn.textContent = charStr;
        btn.setAttribute('data-page', charStr);
        
        btn.addEventListener('click', () => navigateToPage(charStr));
        gridNavContainer.appendChild(btn);
    }
}

// Bind action handlers globally using explicit selectors
function bindActionEvents() {
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', toggleSidebar);
    }

    const dashboardSearch = document.getElementById('dashboardSearch');
    if (dashboardSearch) {
        dashboardSearch.addEventListener('input', renderActivePageTableData);
    }

    // Connect pre-existing core navigation elements from base template
    document.querySelectorAll('.alpha-btn[data-page]').forEach(btn => {
        const pageTarget = btn.getAttribute('data-page');
        btn.addEventListener('click', () => navigateToPage(pageTarget));
    });

    // Capture standard history forward/back hash routing operations
    window.addEventListener('hashchange', handleUrlHashChange);
}

// Responsive multi-state layout toggle handling
function toggleSidebar() {
    const sidebar = document.getElementById('sidebarPanel');
    if (!sidebar) return;

    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('mobile-expanded');
        sidebar.classList.remove('collapsed');
    } else {
        sidebar.classList.toggle('collapsed');
        sidebar.classList.remove('mobile-expanded');
    }
}

// Primary app router navigation engine
function navigateToPage(targetPageKey) {
    activePageKey = targetPageKey;
    window.location.hash = `page-${targetPageKey}`;

    // Manage visual active state styling indicators across navigation controls
    document.querySelectorAll('.alpha-btn').forEach(btn => {
        const checkAttribute = btn.getAttribute('data-page');
        if (checkAttribute === targetPageKey) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        const displayTitleText = targetPageKey === 'ALL' ? 'All Topics' : `Topics starting with: ${targetPageKey}`;
        pageTitle.innerHTML = `${displayTitleText} <span id="itemCount"></span>`;
    }

    renderActivePageTableData();

    // AUTO-FOLD SYSTEM: Dismiss the sliding interface automatically on selection inside mobile devices
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebarPanel');
        if (sidebar) sidebar.classList.remove('mobile-expanded');
    }
}

// Extract, compile, and merge dictionary values safely
function getFlattenedSortedItems() {
    let processedItems = [];
    
    // Fallback block handles delayed script synchronization bounds gracefully
    if (typeof dictionaryDatabase === 'undefined') return [];

    if (activePageKey === 'ALL') {
        Object.keys(dictionaryDatabase).forEach(key => {
            processedItems.push(...dictionaryDatabase[key]);
        });
    } else if (dictionaryDatabase[activePageKey]) {
        processedItems.push(...dictionaryDatabase[activePageKey]);
    }
    return processedItems.sort((a, b) => a.term.localeCompare(b.term));
}

// Main page rendering method handles live updates and data display parsing
function renderActivePageTableData() {
    const itemsWrapper = document.getElementById('itemsWrapper');
    const emptyState = document.getElementById('tableEmptyState');
    const headerRow = document.getElementById('listHeader');
    const searchInput = document.getElementById('dashboardSearch');
    
    if (!itemsWrapper) return;
    
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';
    itemsWrapper.innerHTML = '';
    let renderedItemCounter = 0;
    
    const targetDataset = getFlattenedSortedItems();

    targetDataset.forEach(item => {
        // Real-time keyword filter evaluation sequence
        if (searchQuery && !item.term.toLowerCase().includes(searchQuery) && !item.definition.toLowerCase().includes(searchQuery)) {
            return;
        }

        const dataRowElement = document.createElement('div');
        dataRowElement.className = 'topic-row';
        dataRowElement.innerHTML = `
            <div class="row-term">${item.term}</div>
            <div class="row-def">${item.definition}</div>
        `;
        itemsWrapper.appendChild(dataRowElement);
        renderedItemCounter++;
    });

    const itemCountLabel = document.getElementById('itemCount');
    if (itemCountLabel) {
        itemCountLabel.textContent = `(${renderedItemCounter} term${renderedItemCounter === 1 ? '' : 's'})`;
    }
    
    // Sync table placeholder structures safely
    if (renderedItemCounter === 0) {
        if (headerRow) headerRow.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
    } else {
        if (headerRow && window.innerWidth > 768) headerRow.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
    }
}

function handleUrlHashChange() {
    const routeHash = window.location.hash.replace('#page-', '');
    if (routeHash && routeHash !== activePageKey) {
        const cleanKey = routeHash === '0-9' ? '0-9' : routeHash.charAt(0).toUpperCase();
        navigateToPage(cleanKey);
    }
}

function syncInitialRoute() {
    const initialRouteHash = window.location.hash.replace('#page-', '');
    if (initialRouteHash) {
        navigateToPage(initialRouteHash);
    } else {
        renderActivePageTableData();
    }
}