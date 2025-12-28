<!DOCTYPE html>
<html lang="en" >
<head>
      <script>
// Simple theme initialization that runs immediately
(function() {
    console.log('Theme initialization starting...');
    
    // 1. Apply saved theme immediately (before DOM is fully loaded)
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    console.log('Immediate theme applied:', savedTheme);
    
    // 2. Wait for DOM, then initialize the toggle button
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, setting up theme toggle...');
        
        if (window.sharedData && window.sharedData.initThemeToggle) {
            try {
                window.sharedData.initThemeToggle();
                console.log('Theme toggle initialized via shared.js');
            } catch (error) {
                console.error('Error in shared.js theme toggle:', error);
                initFallbackTheme();
            }
        } else {
            console.warn('shared.js not loaded, using fallback theme');
            initFallbackTheme();
        }
    });
    
    // Fallback theme function
    function initFallbackTheme() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) {
            console.error('Theme toggle button not found for fallback');
            return;
        }
        
        const html = document.documentElement;
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        // Set icon
        const icon = themeToggle.querySelector('i');
        if (savedTheme === 'light') {
            icon.className = 'fas fa-moon';
        } else {
            icon.className = 'fas fa-sun';
        }
        
        // Add click event
        themeToggle.addEventListener('click', function() {
            const currentTheme = html.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Update icon
            const icon = this.querySelector('i');
            if (newTheme === 'light') {
                icon.className = 'fas fa-moon';
            } else {
                icon.className = 'fas fa-sun';
            }
            
            console.log('Fallback theme changed to:', newTheme);
        });
        
        console.log('Fallback theme initialized');
    }
})();
</script>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scholar's Haven | Online Library</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="styles.css">
    <style>
        /* Profile Dropdown Styles */
        .user-profile {
            position: relative;
            margin-left: 1rem;
        }
        
        .profile-btn {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .profile-btn:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .profile-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            background: var(--card-bg);
            border-radius: 10px;
            box-shadow: 0 5px 15px var(--shadow);
            width: 250px;
            z-index: 1000;
            display: none;
            margin-top: 10px;
            overflow: hidden;
        }
        
        .profile-dropdown.show {
            display: block;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .profile-header {
            padding: 1.5rem;
            background: var(--primary);
            color: white;
            text-align: center;
        }
        
        .profile-icon {
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            color: var(--primary);
            font-size: 1.5rem;
        }
        
        .profile-info {
            padding: 1rem;
        }
        
        .profile-item {
            padding: 0.8rem 1rem;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid var(--border);
            transition: all 0.3s;
        }
        
        .profile-item:hover {
            background: var(--light);
        }
        
        .profile-item i {
            width: 20px;
            color: var(--primary);
        }
        
        .logout-btn {
            color: var(--danger);
            cursor: pointer;
        }
        
        .logout-btn:hover {
            background: rgba(220, 53, 69, 0.1);
        }
        
        /* Header layout adjustments */
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 2rem;
            background: var(--primary);
            color: white;
        }
        
        .header-controls {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .theme-toggle {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            transition: all 0.3s;
        }
        
        .theme-toggle:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        /* Hide profile when not logged in */
        .user-profile.hidden {
            display: none;
        }
        
        /* Login button styles */
        .cta-button.small {
            padding: 0.5rem 1.5rem;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <!-- Header with Navigation -->
    <header>
        <div class="logo">
            <a href="index.html" style="color: white; text-decoration: none; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-book-open"></i>
                <span>Brewed Words</span>
            </a>
        </div>
        
        <div class="nav-tabs">
            <a href="#" class="active">Home</a>
            <a href="mylibrary.html" id="myLibraryBtn">My Library</a>
            <a href="favorites.html" id="favoritesBtn">Favorites</a>
            <a href="explore.html" id="exploreBtn">Explore</a>
            <a href="settings.html" id="settingsBtn">Settings</a>
        </div>
        
        <div class="header-controls">
            <button class="theme-toggle" id="themeToggle">
                <i class="fas fa-moon"></i>
            </button>
            
            <!-- User Profile Dropdown (visible when logged in) -->
            <div class="user-profile hidden" id="userProfile">
                <button class="profile-btn" id="profileBtn">
                    <i class="fas fa-user-circle"></i>
                </button>
                <div class="profile-dropdown" id="profileDropdown">
                    <div class="profile-header">
                        <div class="profile-icon">
                            <i class="fas fa-user"></i>
                        </div>
                        <h3 id="userName">John Doe</h3>
                        <p id="userEmail">john@example.com</p>
                    </div>
                    <div class="profile-info">
                        <div class="profile-item">
                            <i class="fas fa-book"></i>
                            <span>My Library: <strong id="libraryCount">0</strong></span>
                        </div>
                        <div class="profile-item">
                            <i class="fas fa-heart"></i>
                            <span>Favorites: <strong id="favoritesCount">0</strong></span>
                        </div>
                        <div class="profile-item logout-btn" id="logoutBtn">
                            <i class="fas fa-sign-out-alt"></i>
                            <span>Logout</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Login button (visible when not logged in) -->
            <button class="cta-button small" id="loginBtn" style="display: none;">
                <i class="fas fa-sign-in-alt"></i> Login
            </button>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <h1>Discover Your Next Favorite Book</h1>
        <p>Explore our vast collection of literature, from timeless classics to contemporary bestsellers. Join our community of readers today.</p>
        <button class="cta-button" id="getStartedBtn">Get Started For Free</button>
    </section>

    <!-- Main Content -->
    <main class="container">
        <!-- Top Picks Section -->
        <h2 class="section-title">Top Picks of the Year</h2>
        <div class="books-grid" id="topPicksGrid">
            <!-- Books will be dynamically loaded here -->
        </div>

        <!-- All Books Section -->
        <h2 class="section-title">Explore Our Collection</h2>
        <div class="books-grid" id="allBooksGrid">
            <!-- Books will be dynamically loaded here -->
        </div>
    </main>

    <!-- Footer -->
    <footer>
        <p>&copy; 2023 Scholar's Haven Online Library. All rights reserved.</p>
        <p>A Web Technology Project</p>
    </footer>

    <!-- Login/Signup Modal -->
    <div class="modal" id="authModal" style="display: none; opacity: 0;">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalTitle">Login to Your Account</h2>
                <button class="close-modal" id="closeModal">&times;</button>
            </div>
            
            <form id="loginForm">
                <div class="form-group">
                    <label for="loginEmail">Email</label>
                    <input type="email" id="loginEmail" required>
                </div>
                
                <div class="form-group">
                    <label for="loginPassword">Password</label>
                    <input type="password" id="loginPassword" required>
                </div>
                
                <button type="submit" class="auth-btn">Login</button>
                
                <div class="form-toggle">
                    Don't have an account? <a href="#" id="switchToSignup">Sign up here</a>
                </div>
            </form>
            
            <form id="signupForm" style="display: none;">
                <div class="form-group">
                    <label for="signupName">Full Name</label>
                    <input type="text" id="signupName" required>
                </div>
                
                <div class="form-group">
                    <label for="signupEmail">Email</label>
                    <input type="email" id="signupEmail" required>
                </div>
                
                <div class="form-group">
                    <label for="signupPassword">Password</label>
                    <input type="password" id="signupPassword" required>
                </div>
                
                <div class="form-group">
                    <label for="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" required>
                </div>
                
                <button type="submit" class="auth-btn">Create Account</button>
                
                <div class="form-toggle">
                    Already have an account? <a href="#" id="switchToLogin">Login here</a>
                </div>
            </form>
        </div>
    </div>

    <script src="shared.js"></script>
    <script src="home.js"></script>
</body>
</html>