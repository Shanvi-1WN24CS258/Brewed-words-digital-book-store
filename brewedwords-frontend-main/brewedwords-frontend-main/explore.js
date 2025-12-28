// explore.js - Explore page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    if (window.sharedData && window.sharedData.initThemeToggle) {
        window.sharedData.initThemeToggle();
    }
    
   // Check login with alert
if (!window.sharedData.requireLogin('index.html')) {
    return;
}
const currentUser = window.sharedData.getCurrentUser();
    
    // Initialize explore page
    initExplorePage();
});

function initExplorePage() {
    // Get books from shared data
    const allBooks = window.sharedData.getAllBooks();
    
    // Load genres into dropdown
    loadGenres(allBooks);
    
    // Initialize with all books
    loadAllBooks(allBooks);
    
    // Event listeners
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') performSearch();
    });
    
    document.getElementById('sortSelect').addEventListener('change', function() {
        performSearch();
    });
    
    // Toggle dropdown
    document.getElementById('genreDropdownBtn').addEventListener('click', function() {
        const dropdown = document.getElementById('genreDropdown');
        dropdown.classList.toggle('show');
        const icon = this.querySelector('i');
        icon.className = dropdown.classList.contains('show') ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('genreDropdown');
        const dropdownBtn = document.getElementById('genreDropdownBtn');
        
        if (!dropdownBtn.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
            dropdownBtn.querySelector('i').className = 'fas fa-chevron-down';
        }
    });
}

function loadGenres(books) {
    const genreDropdown = document.getElementById('genreDropdown');
    const genres = [...new Set(books.map(book => book.genre))];
    
    // Add "All Genres" option first
    const allCount = books.length;
    genreDropdown.innerHTML = `
        <div class="genre-option active" data-genre="all" onclick="selectGenre('all', ${allCount})">
            <span>All Genres</span>
            <span class="genre-count">${allCount}</span>
        </div>
    `;
    
    // Add individual genres
    genres.forEach(genre => {
        const count = books.filter(book => book.genre === genre).length;
        genreDropdown.innerHTML += `
            <div class="genre-option" data-genre="${genre}" onclick="selectGenre('${genre}', ${count})">
                <span>${genre}</span>
                <span class="genre-count">${count}</span>
            </div>
        `;
    });
}

function loadAllBooks(books) {
    const booksGrid = document.getElementById('booksGrid');
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');
    
    // Clear previous results
    booksGrid.innerHTML = '';
    
    if (books.length === 0) {
        booksGrid.style.display = 'none';
        noResults.style.display = 'block';
        resultsCount.textContent = 'No books found';
        return;
    }
    
    // Show all books
    books.forEach(book => {
        booksGrid.innerHTML += window.sharedData.createBookCard(book);
    });
    
    resultsCount.textContent = `Showing ${books.length} of ${window.sharedData.getAllBooks().length} books`;
    booksGrid.style.display = 'grid';
    noResults.style.display = 'none';
}

function performSearch() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const sortSelect = document.getElementById('sortSelect').value;
    const selectedGenre = document.getElementById('selectedGenre').textContent;
    
    // Close dropdown if open
    const dropdown = document.getElementById('genreDropdown');
    dropdown.classList.remove('show');
    document.getElementById('genreDropdownBtn').querySelector('i').className = 'fas fa-chevron-down';
    
    // Start with ALL books
    let filteredBooks = [...window.sharedData.getAllBooks()];
    
    // Filter by search term
    if (searchInput) {
        filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(searchInput) ||
            book.author.toLowerCase().includes(searchInput) ||
            book.genre.toLowerCase().includes(searchInput) ||
            book.summary.toLowerCase().includes(searchInput)
        );
    }
    
    // Filter by genre (if not "All Genres")
    if (selectedGenre !== 'All Genres') {
        filteredBooks = filteredBooks.filter(book => book.genre === selectedGenre);
    }
    
    // Sort results
    filteredBooks = sortBooks(filteredBooks, sortSelect);
    
    // Update UI
    updateResultsUI(filteredBooks, searchInput, selectedGenre);
}

function sortBooks(books, sortType) {
    const sortedBooks = [...books];
    
    switch(sortType) {
        case 'title':
            return sortedBooks.sort((a, b) => a.title.localeCompare(b.title));
        case 'rating':
            return sortedBooks.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        case 'year':
            return sortedBooks.sort((a, b) => b.year - a.year);
        case 'year-old':
            return sortedBooks.sort((a, b) => a.year - b.year);
        default:
            return sortedBooks;
    }
}

function updateResultsUI(filteredBooks, searchTerm, selectedGenre) {
    const booksGrid = document.getElementById('booksGrid');
    const resultsCount = document.getElementById('resultsCount');
    const resultsTitle = document.getElementById('resultsTitle');
    const noResults = document.getElementById('noResults');
    
    // Clear previous results
    booksGrid.innerHTML = '';
    
    if (filteredBooks.length === 0) {
        booksGrid.style.display = 'none';
        noResults.style.display = 'block';
        resultsCount.textContent = 'No books found';
        
        if (searchTerm) {
            resultsTitle.textContent = `Search: "${searchTerm}"`;
        } else if (selectedGenre !== 'All Genres') {
            resultsTitle.textContent = `Genre: ${selectedGenre}`;
        } else {
            resultsTitle.textContent = 'No Results';
        }
        return;
    }
    
    // Display filtered books
    filteredBooks.forEach(book => {
        booksGrid.innerHTML += window.sharedData.createBookCard(book);
    });
    
    // Update counts and title
    const totalBooks = window.sharedData.getAllBooks().length;
    resultsCount.textContent = `Showing ${filteredBooks.length} of ${totalBooks} books`;
    booksGrid.style.display = 'grid';
    noResults.style.display = 'none';
    
    // Update title
    if (searchTerm) {
        resultsTitle.textContent = `Search: "${searchTerm}" (${filteredBooks.length} books)`;
    } else if (selectedGenre !== 'All Genres') {
        resultsTitle.textContent = `Genre: ${selectedGenre} (${filteredBooks.length} books)`;
    } else {
        resultsTitle.textContent = 'All Books';
    }
}

// Global functions for HTML onclick
window.selectGenre = function(genre, count) {
    // Update selected genre display
    document.getElementById('selectedGenre').textContent = genre === 'all' ? 'All Genres' : genre;
    
    // Update active state in dropdown
    document.querySelectorAll('.genre-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.genre === genre) {
            option.classList.add('active');
        }
    });
    
    // Close dropdown
    const dropdown = document.getElementById('genreDropdown');
    dropdown.classList.remove('show');
    document.getElementById('genreDropdownBtn').querySelector('i').className = 'fas fa-chevron-down';
    
    // Perform search with new genre filter
    performSearch();
};

window.clearFilters = function() {
    // Clear search input
    document.getElementById('searchInput').value = '';
    
    // Reset genre to "All Genres"
    selectGenre('all', window.sharedData.getAllBooks().length);
    
    // Reset sort to default
    document.getElementById('sortSelect').value = 'title';
    
    // Perform search to update results
    performSearch();
};