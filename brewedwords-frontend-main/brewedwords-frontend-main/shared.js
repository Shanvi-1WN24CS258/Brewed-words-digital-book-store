// shared.js - Shared functions for all pages

// ========================
// SHARED DATA (same across all pages)
// ========================
const allBooks = [
    // TOP PICKS (4 books - Featured, Highest Rated)
    {
        id: 1,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        genre: "Classic",
        year: 1925,
        summary: "A story of the fabulously wealthy Jay Gatsby...",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: 4.8,
        featured: true,
        category: "top-picks"
    },
    {
        id: 2,
        title: "Harry Potter and the Sorcerer's Stone",
        author: "J.K. Rowling",
        genre: "Fantasy",
        year: 1997,
        summary: "The first novel in the Harry Potter series...",
        image: "https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: 4.9,
        featured: true,
        category: "top-picks"
    },
    {
        id: 3,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        genre: "Fiction",
        year: 1960,
        summary: "The story of racial injustice...",
        image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: 4.7,
        featured: true,
        category: "top-picks"
    },
    {
        id: 4,
        title: "1984",
        author: "George Orwell",
        genre: "Dystopian",
        year: 1949,
        summary: "A dystopian social science fiction novel...",
        image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: 4.6,
        featured: true,
        category: "top-picks"
    },
    
    // HOME PAGE COLLECTION (12 books)
    {
        id: 5,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        genre: "Romance",
        year: 1813,
        summary: "A romantic novel of manners...",
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: 4.5,
        featured: false,
        category: "home-collection"
    },
    {
        id: 6,
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        genre: "Fantasy",
        year: 1937,
        summary: "A fantasy novel about the adventures...",
        image: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: 4.7,
        featured: false,
        category: "home-collection"
    },
    {
        id: 7,
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        genre: "Fiction",
        year: 1951,
        summary: "Story of Holden Caulfield's experiences...",
        image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: 4.0,
        featured: false,
        category: "home-collection"
    },
    {
        id: 8,
        title: "The Lord of the Rings",
        author: "J.R.R. Tolkien",
        genre: "Fantasy",
        year: 1954,
        summary: "Epic high-fantasy novel...",
        image: "https://images.unsplash.com/photo-1544716278-e513176f20b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: 4.9,
        featured: false,
        category: "home-collection"
    },
    {
        id: 9,
        title: "Moby Dick",
        author: "Herman Melville",
        genre: "Adventure",
        year: 1851,
        summary: "The voyage of the whaling ship Pequod...",
        image: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: 4.1,
        featured: false,
        category: "home-collection"
    },
    {
        id: 10,
        title: "War and Peace",
        author: "Leo Tolstoy",
        genre: "Historical",
        year: 1869,
        summary: "Chronicles the French invasion of Russia...",
        image: "https://images.unsplash.com/photo-1563906267088-b029e7101114?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: 4.2,
        featured: false,
        category: "home-collection"
    },
    {
        id: 11,
        title: "The Alchemist",
        author: "Paulo Coelho",
        genre: "Philosophical",
        year: 1988,
        summary: "Follows a young Andalusian shepherd...",
        image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: 4.5,
        featured: false,
        category: "home-collection"
    },
    {
        id: 12,
        title: "The Hunger Games",
        author: "Suzanne Collins",
        genre: "Dystopian",
        year: 2008,
        summary: "In a dystopian future, teenagers fight...",
        image: "https://images.unsplash.com/photo-1531901599638-a89bb60971a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: 4.3,
        featured: false,
        category: "home-collection"
    },
    {
        id: 13,
        title: "The Da Vinci Code",
        author: "Dan Brown",
        genre: "Mystery",
        year: 2003,
        summary: "A mystery thriller novel...",
        image: "https://images.unsplash.com/photo-1531346688376-ab6275c4725e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: 4.0,
        featured: false,
        category: "home-collection"
    },
    {
        id: 14,
        title: "The Shining",
        author: "Stephen King",
        genre: "Horror",
        year: 1977,
        summary: "A horror novel by Stephen King...",
        image: "https://images.unsplash.com/photo-1608889175123-8f362c6b5a7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: 4.4,
        featured: false,
        category: "home-collection"
    },
    {
        id: 15,
        title: "Brave New World",
        author: "Aldous Huxley",
        genre: "Dystopian",
        year: 1932,
        summary: "A dystopian social science fiction novel...",
        image: "https://images.unsplash.com/photo-1539667468225-ebb2c5c3c72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: 4.2,
        featured: false,
        category: "home-collection"
    },
    {
        id: 16,
        title: "The Little Prince",
        author: "Antoine de Saint-Exupéry",
        genre: "Philosophical",
        year: 1943,
        summary: "A poetic tale with watercolour illustrations...",
        image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        rating: 4.5,
        featured: false,
        category: "home-collection"
    }
];

const demoUsers = [
    {
        id: 1,
        name: "Demo Student",
        email: "student@school.com",
        password: "demo123",
        favorites: [1, 3, 7],
        myLibrary: [1, 2, 4, 8]
    },
    {
        id: 2,
        name: "Demo Teacher",
        email: "teacher@school.com",
        password: "demo123",
        favorites: [2, 5, 6],
        myLibrary: [1, 2, 3, 4, 5, 6]
    }
];

let comments = [
    {
        id: 1,
        bookId: 1,
        userId: 1,
        userName: "Demo Student",
        text: "Great book! Loved the characters.",
        date: "2023-10-15"
    },
    {
        id: 2,
        bookId: 1,
        userId: 2,
        userName: "Demo Teacher",
        text: "A classic that everyone should read.",
        date: "2023-10-10"
    }
];

// ========================
// BOOK GETTER FUNCTIONS
// ========================
function getTopPicks() {
    return allBooks.filter(book => book.featured === true).slice(0, 4);
}

function getHomeCollection() {
    return allBooks.filter(book => book.category === "home-collection").slice(0, 12);
}

function getAllBooks() {
    return allBooks;
}

function getBooksByGenre(genre) {
    return allBooks.filter(book => book.genre === genre);
}

function searchBooks(searchTerm) {
    const term = searchTerm.toLowerCase();
    return allBooks.filter(book => 
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term) ||
        book.genre.toLowerCase().includes(term) ||
        book.summary.toLowerCase().includes(term)
    );
}

// ========================
// SHARED FUNCTIONS
// ========================
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) {
        console.error('Theme toggle button not found!');
        return;
    }
    
    console.log('Initializing theme toggle...');
    
    // Get saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply theme to HTML element
    document.documentElement.setAttribute('data-theme', savedTheme);
    console.log('Applied theme:', savedTheme);
    
    // Set initial icon
    const icon = themeToggle.querySelector('i');
    if (savedTheme === 'light') {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
    
    // Add click event
    themeToggle.addEventListener('click', () => {
        // Get current theme from HTML attribute
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        console.log('Changing theme from', currentTheme, 'to', newTheme);
        
        // Apply transition
        document.documentElement.style.transition = 'all 0.5s ease';
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Animate icon
        const icon = themeToggle.querySelector('i');
        icon.style.transform = 'rotate(360deg)';
        icon.style.transition = 'transform 0.5s';
        
        setTimeout(() => {
            icon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            icon.style.transform = 'rotate(0deg)';
        }, 250);
        
        // Save to localStorage
        localStorage.setItem('theme', newTheme);
    });
    
    console.log('Theme toggle initialized successfully');
}

function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error parsing user:', error);
        return null;
    }
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) notification.remove();
    }, 3000);
}

function createBookCard(book) {
    const currentUser = getCurrentUser();
    const isFavorite = currentUser && currentUser.favorites && currentUser.favorites.includes(book.id);
    const inLibrary = currentUser && currentUser.myLibrary && currentUser.myLibrary.includes(book.id);
    
    return `
        <div class="book-card" data-id="${book.id}" data-genre="${book.genre.toLowerCase()}">
            <div class="book-badge-container">
                ${isFavorite ? '<span class="favorite-badge"><i class="fas fa-heart"></i></span>' : ''}
                ${inLibrary ? '<span class="library-badge"><i class="fas fa-bookmark"></i></span>' : ''}
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
                    <i class="fas fa-eye"></i> Overview
                </button>
            </div>
        </div>
    `;
}

function toggleFavorite(bookId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Please login first!', 'warning');
        return false;
    }
    
    let favorites = currentUser.favorites || [];
    const isFavorite = favorites.includes(bookId);
    
    if (isFavorite) {
        favorites = favorites.filter(id => id !== bookId);
    } else {
        favorites.push(bookId);
    }
    
    currentUser.favorites = favorites;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    return !isFavorite;
}

function toggleLibrary(bookId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('Please login first!', 'warning');
        return false;
    }
    
    let myLibrary = currentUser.myLibrary || [];
    const inLibrary = myLibrary.includes(bookId);
    
    if (inLibrary) {
        myLibrary = myLibrary.filter(id => id !== bookId);
    } else {
        myLibrary.push(bookId);
    }
    
    currentUser.myLibrary = myLibrary;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    return !inLibrary;
}

function requireLogin(redirectTo = 'index.html') {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        showNotification('🔒 Please login to access this page!', 'warning');
        setTimeout(() => {
            window.location.href = redirectTo;
        }, 2000);
        return false;
    }
    
    return true;
}

// ========================
// EXPORT TO WINDOW OBJECT
// ========================
window.sharedData = {
    // Data
    allBooks,
    demoUsers,
    comments,
    
    // Book getter functions
    getTopPicks,
    getHomeCollection,
    getAllBooks,
    getBooksByGenre,
    searchBooks,
    
    // Shared functions
    initThemeToggle,
    getCurrentUser,
    showNotification,
    createBookCard,
    requireLogin,
    
    // Book details functions
    toggleFavorite,
    toggleLibrary
};

// Initialize theme on load
document.addEventListener('DOMContentLoaded', function() {
    if (window.sharedData && window.sharedData.initThemeToggle) {
        window.sharedData.initThemeToggle();
    }
});


// Add to shared.js
function isAdmin() {
    return localStorage.getItem('isAdmin') === 'true';
}

function getCurrentAdmin() {
    return JSON.parse(localStorage.getItem('adminUser') || 'null');
}

// Add to window.sharedData
window.sharedData = window.sharedData || {};
window.sharedData.isAdmin = isAdmin;
window.sharedData.getCurrentAdmin = getCurrentAdmin;