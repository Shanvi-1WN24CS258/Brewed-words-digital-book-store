// mylibrary.js - My Library page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    if (window.sharedData && window.sharedData.initThemeToggle) {
        window.sharedData.initThemeToggle();
    }
    
   // Check login with alert
if (!window.sharedData.requireLogin('index.html')) {
    return;
}
const user = window.sharedData.getCurrentUser();  // Change variable name to 'user'
    // Load library
    loadLibrary(user);
    
    // Initialize filter buttons
    initFilterButtons();
});

function loadLibrary(user) {
    const libraryGrid = document.getElementById('libraryGrid');
    const emptyState = document.getElementById('emptyState');
    const libraryStats = document.getElementById('libraryStats');
    const recentlyAddedSection = document.getElementById('recentlyAddedSection');
    const recentlyAddedGrid = document.getElementById('recentlyAddedGrid');
    
    const allBooks = window.sharedData.getAllBooks();
    const libraryBookIds = user.myLibrary || [];
    
    // Get library books
    const libraryBooks = allBooks.filter(book => libraryBookIds.includes(book.id));
    
    // Update stats
    updateLibraryStats(libraryBooks.length);
    
    if (libraryBooks.length === 0) {
        emptyState.style.display = 'block';
        libraryGrid.style.display = 'none';
        recentlyAddedSection.style.display = 'none';
        return;
    }
    
    // Show library
    emptyState.style.display = 'none';
    libraryGrid.style.display = 'grid';
    libraryGrid.innerHTML = '';
    
    // Display library books
    libraryBooks.forEach(book => {
        libraryGrid.innerHTML += createLibraryBookCard(book);
    });
    
    // Add event listeners for the new elements
    addRemoveButtonListeners();
    addStatusSelectListeners();
    
    // Show recently added (last 4 books)
    if (libraryBooks.length > 4) {
        recentlyAddedSection.style.display = 'block';
        recentlyAddedGrid.innerHTML = '';
        
        const recentlyAdded = libraryBooks.slice(-4).reverse(); // Get last 4, newest first
        
        recentlyAdded.forEach(book => {
            recentlyAddedGrid.innerHTML += window.sharedData.createBookCard(book);
        });
    } else {
        recentlyAddedSection.style.display = 'none';
    }
}

function createLibraryBookCard(book) {
    const currentUser = window.sharedData.getCurrentUser();
    const isFavorite = currentUser && currentUser.favorites && currentUser.favorites.includes(book.id);
    
    // Get saved reading status
    let readingStatus = JSON.parse(localStorage.getItem('readingStatus') || '{}');
    const currentStatus = readingStatus[book.id] || 'unread';
    
    return `
        <div class="book-card" data-id="${book.id}" data-genre="${book.genre.toLowerCase()}">
            <div class="book-badge-container">
                ${isFavorite ? '<span class="favorite-badge"><i class="fas fa-heart"></i></span>' : ''}
                <span class="library-badge"><i class="fas fa-bookmark"></i></span>
                <div class="book-actions">
                    <button class="remove-btn" data-book-id="${book.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <img src="${book.image}" alt="${book.title}" class="book-img">
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">${book.author} (${book.year})</p>
                <div class="book-meta">
                    <span class="book-genre">${book.genre}</span>
                    <span class="book-rating">⭐ ${book.rating || '4.0'}</span>
                </div>
                <div class="reading-status">
                    <select class="status-select" data-book-id="${book.id}">
                        <option value="unread" ${currentStatus === 'unread' ? 'selected' : ''}>Not Started</option>
                        <option value="reading" ${currentStatus === 'reading' ? 'selected' : ''}>Currently Reading</option>
                        <option value="completed" ${currentStatus === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
                <button class="overview-btn" onclick="window.location.href='book-details.html?id=${book.id}'">
                    <i class="fas fa-eye"></i> Read Now
                </button>
            </div>
        </div>
    `;
}

function updateLibraryStats(totalBooks) {
    const libraryStats = document.getElementById('libraryStats');
    
    // Get actual reading status from localStorage for more accurate stats
    let readingStatus = JSON.parse(localStorage.getItem('readingStatus') || '{}');
    const user = window.sharedData.getCurrentUser();
    const allBooks = window.sharedData.getAllBooks();
    const libraryBookIds = user.myLibrary || [];
    const libraryBooks = allBooks.filter(book => libraryBookIds.includes(book.id));
    
    // Calculate actual stats
    let readingBooks = 0;
    let completedBooks = 0;
    let unreadBooks = 0;
    
    libraryBooks.forEach(book => {
        const status = readingStatus[book.id] || 'unread';
        if (status === 'reading') readingBooks++;
        else if (status === 'completed') completedBooks++;
        else unreadBooks++;
    });
    
    libraryStats.innerHTML = `
        <div class="stat-card">
            <i class="fas fa-book"></i>
            <div class="stat-number">${totalBooks}</div>
            <div class="stat-label">Total Books</div>
        </div>
        <div class="stat-card">
            <i class="fas fa-book-reader"></i>
            <div class="stat-number">${readingBooks}</div>
            <div class="stat-label">Reading</div>
        </div>
        <div class="stat-card">
            <i class="fas fa-check-circle"></i>
            <div class="stat-number">${completedBooks}</div>
            <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card">
            <i class="fas fa-star"></i>
            <div class="stat-number">${unreadBooks}</div>
            <div class="stat-label">To Read</div>
        </div>
    `;
}

function initFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            filterLibraryBooks(filter);
        });
    });
}

function filterLibraryBooks(filterType) {
    const user = window.sharedData.getCurrentUser();
    const allBooks = window.sharedData.getAllBooks();
    const libraryBookIds = user.myLibrary || [];
    let libraryBooks = allBooks.filter(book => libraryBookIds.includes(book.id));
    
    let filteredBooks = [...libraryBooks];
    
    switch(filterType) {
        case 'recent':
            // Show last 8 books added (based on array order)
            filteredBooks = libraryBooks.slice(-8).reverse();
            break;
        case 'reading':
            // Filter by reading status
            const readingStatus = JSON.parse(localStorage.getItem('readingStatus') || '{}');
            filteredBooks = libraryBooks.filter(book => readingStatus[book.id] === 'reading');
            break;
        case 'completed':
            // Filter by completed status
            const statusData = JSON.parse(localStorage.getItem('readingStatus') || '{}');
            filteredBooks = libraryBooks.filter(book => statusData[book.id] === 'completed');
            break;
        // 'all' shows all books
    }
    
    // Update display
    const libraryGrid = document.getElementById('libraryGrid');
    libraryGrid.innerHTML = '';
    
    if (filteredBooks.length === 0) {
        libraryGrid.innerHTML = '<div class="empty-state"><p>No books match this filter</p></div>';
    } else {
        filteredBooks.forEach(book => {
            libraryGrid.innerHTML += createLibraryBookCard(book);
        });
        
        // Re-add event listeners
        addRemoveButtonListeners();
        addStatusSelectListeners();
    }
}

function addRemoveButtonListeners() {
    const removeButtons = document.querySelectorAll('.remove-btn');
    
    removeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const bookId = parseInt(this.dataset.bookId);
            removeFromLibrary(bookId);
        });
    });
}

function addStatusSelectListeners() {
    const statusSelects = document.querySelectorAll('.status-select');
    
    statusSelects.forEach(select => {
        select.addEventListener('change', function() {
            const bookId = parseInt(this.dataset.bookId);
            const status = this.value;
            updateReadingStatus(bookId, status);
        });
    });
}

function removeFromLibrary(bookId) {
    const user = window.sharedData.getCurrentUser();
    if (!user) return;
    
    // Remove from library
    user.myLibrary = user.myLibrary.filter(id => id !== bookId);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    window.sharedData.showNotification('Removed from library', 'info');
    
    // Reload library
    loadLibrary(user);
}

function updateReadingStatus(bookId, status) {
    // Save to localStorage
    let readingStatus = JSON.parse(localStorage.getItem('readingStatus') || '{}');
    readingStatus[bookId] = status;
    localStorage.setItem('readingStatus', JSON.stringify(readingStatus));
    
    const messages = {
        'unread': 'Marked as not started',
        'reading': 'Marked as currently reading',
        'completed': 'Marked as completed'
    };
    
    window.sharedData.showNotification(messages[status] || 'Status updated', 'success');
    
    // Update stats
    const user = window.sharedData.getCurrentUser();
    loadLibrary(user);
}