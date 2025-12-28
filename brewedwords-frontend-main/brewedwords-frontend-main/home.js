// home.js - Home page specific functionality

// DOM Elements for home page
const authModal = document.getElementById('authModal');
const closeModal = document.getElementById('closeModal');
const getStartedBtn = document.getElementById('getStartedBtn');
const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const modalTitle = document.getElementById('modalTitle');
const topPicksGrid = document.getElementById('topPicksGrid');
const allBooksGrid = document.getElementById('allBooksGrid');
const userProfile = document.getElementById('userProfile');
const profileBtn = document.getElementById('profileBtn');
const profileDropdown = document.getElementById('profileDropdown');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const libraryCount = document.getElementById('libraryCount');
const favoritesCount = document.getElementById('favoritesCount');
const loginBtn = document.getElementById('loginBtn');

// DEBUG: Check if shared.js loaded
console.log('home.js loading...');
console.log('sharedData exists?', typeof window.sharedData !== 'undefined');
console.log('getTopPicks exists?', window.sharedData && typeof window.sharedData.getTopPicks === 'function');

// Call it directly to test
if (window.sharedData && window.sharedData.getTopPicks) {
    const testBooks = window.sharedData.getTopPicks();
    console.log('Test books from getTopPicks:', testBooks);
}
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme from shared.js
    if (window.sharedData && window.sharedData.initThemeToggle) {
        window.sharedData.initThemeToggle();
    }
    
    // Initialize home page
    initHomePage();
});

function initHomePage() {
    // Load books on home page
    loadHomePageBooks();
    
    // Initialize modal functionality
    initLoginModal();
    
    // Initialize profile dropdown
    initProfileDropdown();
    
    // Check if user is logged in
    const currentUser = window.sharedData.getCurrentUser();
    updateUIForLoginState(currentUser);
}

function loadHomePageBooks() {
    // Get different book sets from shared data
    const topPicks = window.sharedData.getTopPicks();      // 4 featured books
    const homeCollection = window.sharedData.getHomeCollection(); // 12 books
    
    // Clear grids
    topPicksGrid.innerHTML = '';
    allBooksGrid.innerHTML = '';
    
    // Load Top Picks (4 books)
    if (!topPicks || topPicks.length === 0) {
        topPicksGrid.innerHTML = '<p class="loading">No featured books available</p>';
    } else {
        topPicks.forEach(book => {
            topPicksGrid.innerHTML += window.sharedData.createBookCard(book);
        });
    }
    
    // Load Home Collection (12 books)
    if (!homeCollection || homeCollection.length === 0) {
        allBooksGrid.innerHTML = '<p class="loading">No books available</p>';
    } else {
        homeCollection.forEach(book => {
            allBooksGrid.innerHTML += window.sharedData.createBookCard(book);
        });
    }
    
    addBookHoverEffects();
}

function initLoginModal() {
    // Modal functions
    function openModal(isLogin = true) {
        authModal.style.display = 'flex';
        setTimeout(() => {
            authModal.style.opacity = '1';
        }, 10);
        
        if (isLogin) {
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
            modalTitle.textContent = 'Login to Your Account';
        } else {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            modalTitle.textContent = 'Create Your Account';
        }
    }
    
    function closeModalFunc() {
        authModal.style.opacity = '0';
        setTimeout(() => {
            authModal.style.display = 'none';
        }, 300);
    }
    
    // Event listeners
    getStartedBtn.addEventListener('click', () => openModal(true));
    loginBtn.addEventListener('click', () => openModal(true));
    closeModal.addEventListener('click', closeModalFunc);
    switchToSignup.addEventListener('click', () => openModal(false));
    switchToLogin.addEventListener('click', () => openModal(true));
    
    window.addEventListener('click', (e) => {
        if (e.target === authModal) closeModalFunc();
    });
    
    // Login form submission - CONNECTED TO BACKEND
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            // Call YOUR Node.js backend
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Save token and user data from YOUR backend
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('token', data.token);
                localStorage.setItem('currentUser', JSON.stringify({
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                    // Start with empty arrays - users can add books in frontend
                    favorites: [],
                    myLibrary: []
                }));
                
                window.sharedData.showNotification(`Welcome back, ${data.user.name}!`, 'success');
                closeModalFunc();
                
                // Get the updated user
                const currentUser = window.sharedData.getCurrentUser();
                updateUIForLoginState(currentUser);
                loadHomePageBooks(); // Refresh to show badges
                
            } else {
                window.sharedData.showNotification(data.message || 'Login failed!', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            window.sharedData.showNotification('Cannot connect to server. Make sure backend is running!', 'error');
        }
    });
    
    // Signup form submission - CONNECTED TO BACKEND
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            window.sharedData.showNotification('Passwords do not match!', 'error');
            return;
        }
        
        try {
            // Call YOUR Node.js backend
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Auto login after registration
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('token', data.token);
                localStorage.setItem('currentUser', JSON.stringify({
                    id: data.user.id,
                    name: data.user.name,
                    email: data.user.email,
                    // Start with empty arrays
                    favorites: [],
                    myLibrary: []
                }));
                
                window.sharedData.showNotification(`Account created! Welcome ${name}`, 'success');
                closeModalFunc();
                
                // Get the updated user
                const currentUser = window.sharedData.getCurrentUser();
                updateUIForLoginState(currentUser);
                loadHomePageBooks();
                
            } else {
                window.sharedData.showNotification(data.message || 'Registration failed!', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            window.sharedData.showNotification('Cannot connect to server. Make sure backend is running!', 'error');
        }
    });
}

function initProfileDropdown() {
    // Toggle dropdown
    profileBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!profileBtn.contains(event.target) && !profileDropdown.contains(event.target)) {
            profileDropdown.classList.remove('show');
        }
    });
    
    // Logout functionality
    logoutBtn.addEventListener('click', function() {
        // Clear ALL user data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');  // ADD THIS LINE
        
        // Update UI
        updateUIForLoginState(null);
        
        // Show notification
        window.sharedData.showNotification('Logged out successfully!', 'info');
        
        // Close dropdown
        profileDropdown.classList.remove('show');
        
        // Reload books to hide badges
        loadHomePageBooks();
    });
}

function updateUIForLoginState(user) {
    if (user) {
        // User is logged in
        userProfile.classList.remove('hidden');
        loginBtn.style.display = 'none';
        
        // Update profile info
        userName.textContent = user.name;
        userEmail.textContent = user.email;
        libraryCount.textContent = user.myLibrary ? user.myLibrary.length : 0;
        favoritesCount.textContent = user.favorites ? user.favorites.length : 0;
        
        // Update CTA button text
        getStartedBtn.textContent = `Continue Reading, ${user.name.split(' ')[0]}`;
        getStartedBtn.onclick = function() {
            window.location.href = 'explore.html';
        };
    } else {
        // User is not logged in
        userProfile.classList.add('hidden');
        loginBtn.style.display = 'block';
        
        // Reset CTA button
        getStartedBtn.textContent = 'Get Started For Free';
        getStartedBtn.onclick = function() {
            document.getElementById('authModal').style.display = 'flex';
        };
    }
}

function addBookHoverEffects() {
    const bookCards = document.querySelectorAll('.book-card');
    bookCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px) scale(1.02)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Global function for book details navigation
window.showBookDetails = function(bookId) {
    window.location.href = `book-details.html?id=${bookId}`;
};