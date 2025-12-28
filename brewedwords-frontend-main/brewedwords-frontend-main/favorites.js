// favorites.js - Favorites page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    if (window.sharedData && window.sharedData.initThemeToggle) {
        window.sharedData.initThemeToggle();
    }
    
 // Check login with alert
if (!window.sharedData.requireLogin('index.html')) {
    return;
}
const user = window.sharedData.getCurrentUser();  // Change to 'user'
    // Load favorites
    loadFavorites(user);
    
    // Initialize sort buttons
    initSortButtons();
});

function loadFavorites(user) {
    const favoritesGrid = document.getElementById('favoritesGrid');
    const emptyState = document.getElementById('emptyState');
    const favoriteCount = document.getElementById('favoriteCount');
    const recommendationsSection = document.getElementById('recommendationsSection');
    const recommendationsGrid = document.getElementById('recommendationsGrid');
    
    const allBooks = window.sharedData.getAllBooks();
    const favoriteIds = user.favorites || [];
    
    // Get favorite books
    const favoriteBooks = allBooks.filter(book => favoriteIds.includes(book.id));
    
    // Update count
    favoriteCount.textContent = `${favoriteBooks.length} Favorite Book${favoriteBooks.length !== 1 ? 's' : ''}`;
    
    if (favoriteBooks.length === 0) {
        emptyState.style.display = 'block';
        favoritesGrid.style.display = 'none';
        recommendationsSection.style.display = 'none';
        return;
    }
    
    // Show favorites
    emptyState.style.display = 'none';
    favoritesGrid.style.display = 'grid';
    favoritesGrid.innerHTML = '';
    
    // Display favorite books (sorted by recently added by default)
    const sortedFavorites = sortBooks([...favoriteBooks], 'recent');
    
    sortedFavorites.forEach(book => {
        favoritesGrid.innerHTML += createFavoriteBookCard(book);
    });
    
    // Show recommendations if there are favorites
    if (favoriteBooks.length > 0) {
        recommendationsSection.style.display = 'block';
        showRecommendations(favoriteBooks, allBooks);
    }
    
    // Add remove button event listeners
    addRemoveFavoriteButtonListeners();
}

function createFavoriteBookCard(book) {
    const currentUser = window.sharedData.getCurrentUser();
    const inLibrary = currentUser && currentUser.myLibrary && currentUser.myLibrary.includes(book.id);
    
    return `
        <div class="book-card" data-id="${book.id}" data-genre="${book.genre.toLowerCase()}" data-rating="${book.rating || 0}">
            <div class="book-badge-container">
                <span class="favorite-badge"><i class="fas fa-heart"></i></span>
                ${inLibrary ? '<span class="library-badge"><i class="fas fa-bookmark"></i></span>' : ''}
                <div class="book-actions">
                    <button class="remove-favorite-btn" data-book-id="${book.id}">
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
                <button class="overview-btn" onclick="window.location.href='book-details.html?id=${book.id}'">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        </div>
    `;
}

function initSortButtons() {
    const sortButtons = document.querySelectorAll('.sort-btn');
    
    sortButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            sortButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const sortType = this.dataset.sort;
            sortFavorites(sortType);
        });
    });
}

function sortFavorites(sortType) {
    const user = window.sharedData.getCurrentUser();
    const allBooks = window.sharedData.getAllBooks();
    const favoriteIds = user.favorites || [];
    const favoriteBooks = allBooks.filter(book => favoriteIds.includes(book.id));
    
    const sortedBooks = sortBooks([...favoriteBooks], sortType);
    
    // Update display
    const favoritesGrid = document.getElementById('favoritesGrid');
    favoritesGrid.innerHTML = '';
    
    sortedBooks.forEach(book => {
        favoritesGrid.innerHTML += createFavoriteBookCard(book);
    });
    
    // Re-add event listeners
    addRemoveFavoriteButtonListeners();
}

function sortBooks(books, sortType) {
    switch(sortType) {
        case 'recent':
            // Sort by ID (assuming higher IDs are newer)
            return books.sort((a, b) => b.id - a.id);
        case 'rating':
            return books.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        case 'title':
            return books.sort((a, b) => a.title.localeCompare(b.title));
        default:
            return books;
    }
}

function showRecommendations(favoriteBooks, allBooks) {
    const recommendationsGrid = document.getElementById('recommendationsGrid');
    
    // Get favorite genres
    const favoriteGenres = {};
    favoriteBooks.forEach(book => {
        favoriteGenres[book.genre] = (favoriteGenres[book.genre] || 0) + 1;
    });
    
    // Get top 3 favorite genres
    const topGenres = Object.entries(favoriteGenres)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => entry[0]);
    
    // Find books in favorite genres that aren't already favorites
    let recommendations = [];
    
    topGenres.forEach(genre => {
        const genreBooks = allBooks.filter(book => 
            book.genre === genre && 
            !favoriteBooks.some(fav => fav.id === book.id)
        );
        
        // Take top 2 rated books from each genre
        const topRated = genreBooks
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 2);
        
        recommendations.push(...topRated);
    });
    
    // If not enough recommendations, add random popular books
    if (recommendations.length < 4) {
        const nonFavoriteBooks = allBooks.filter(book => 
            !favoriteBooks.some(fav => fav.id === book.id)
        );
        
        const randomBooks = [...nonFavoriteBooks]
            .sort(() => Math.random() - 0.5)
            .slice(0, 4 - recommendations.length);
        
        recommendations.push(...randomBooks);
    }
    
    // Limit to 4 recommendations
    recommendations = recommendations.slice(0, 4);
    
    // Display recommendations
    recommendationsGrid.innerHTML = '';
    
    if (recommendations.length === 0) {
        recommendationsGrid.innerHTML = '<p>No recommendations available</p>';
        return;
    }
    
    recommendations.forEach(book => {
        recommendationsGrid.innerHTML += window.sharedData.createBookCard(book);
    });
}

function addRemoveFavoriteButtonListeners() {
    const removeButtons = document.querySelectorAll('.remove-favorite-btn');
    
    removeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const bookId = parseInt(this.dataset.bookId);
            removeFromFavorites(bookId);
        });
    });
}

function removeFromFavorites(bookId) {
    const user = window.sharedData.getCurrentUser();
    if (!user) return;
    
    // Remove from favorites
    user.favorites = user.favorites.filter(id => id !== bookId);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    window.sharedData.showNotification('Removed from favorites', 'info');
    
    // Reload favorites
    loadFavorites(user);
}