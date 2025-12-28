// settings.js - Settings page functionality

// DOM Elements
const settingsContent = document.getElementById('settingsContent');
let successMessage, errorMessage;

// Define functions FIRST before they're used in HTML
function showSuccess(message) {
    if (!successMessage) {
        successMessage = document.querySelector('.success-message') || 
                        document.createElement('div');
        successMessage.className = 'success-message';
    }
    
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
    
    // Add to DOM if not already there
    if (!successMessage.parentNode) {
        settingsContent.insertBefore(successMessage, settingsContent.firstChild);
    }
    
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

function showError(message) {
    if (!errorMessage) {
        errorMessage = document.querySelector('.error-message') || 
                      document.createElement('div');
        errorMessage.className = 'error-message';
    }
    
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    if (successMessage) {
        successMessage.style.display = 'none';
    }
    
    // Add to DOM if not already there
    if (!errorMessage.parentNode) {
        settingsContent.insertBefore(errorMessage, settingsContent.firstChild);
    }
    
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
}

async function updateEmail() {
    const newEmail = document.getElementById('userEmail').value;
    const currentUser = window.sharedData.getCurrentUser();
    
    if (!newEmail || !newEmail.includes('@')) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Check if email hasn't changed
    if (newEmail === currentUser.email) {
        showError('Email is the same as current email');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        console.log('Updating email...');
        
        // Get the API endpoint - use fallback if config not available
        let endpoint;
        if (window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.AUTH && window.API_CONFIG.ENDPOINTS.AUTH.UPDATE_EMAIL) {
            endpoint = window.API_CONFIG.ENDPOINTS.AUTH.UPDATE_EMAIL;
        } else {
            // Fallback to default endpoint
            endpoint = 'http://localhost:5000/api/auth/update-email';
        }
        
        console.log('Using endpoint:', endpoint);
        
        // Call backend API to update email
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email: newEmail })
        });
        
        console.log('Update email response status:', response.status);
        
        const data = await response.json();
        console.log('Update email response data:', data);
        
        if (response.ok && data.success) {
            // Update local storage with new email
            if (data.user) {
                currentUser.email = data.user.email;
                currentUser.id = data.user.id;
                currentUser.name = data.user.name;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                showSuccess('Email updated successfully!');
                // Reload settings to show updated email
                loadSettings();
            } else {
                showError('User data not returned from server');
            }
        } else {
            showError(data.message || 'Failed to update email. Server returned status: ' + response.status);
        }
    } catch (error) {
        console.error('Update email error:', error);
        showError('Cannot connect to server. Make sure backend is running! Error: ' + error.message);
    }
}

async function updatePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword) {
        showError('Please enter your current password');
        return;
    }
    
    if (!newPassword || newPassword.length < 6) {
        showError('New password must be at least 6 characters long');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('New passwords do not match');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        console.log('Updating password...');
        
        // Get the API endpoint - use fallback if config not available
        let endpoint;
        if (window.API_CONFIG && window.API_CONFIG.ENDPOINTS && window.API_CONFIG.ENDPOINTS.AUTH && window.API_CONFIG.ENDPOINTS.AUTH.UPDATE_PASSWORD) {
            endpoint = window.API_CONFIG.ENDPOINTS.AUTH.UPDATE_PASSWORD;
        } else {
            // Fallback to default endpoint
            endpoint = 'http://localhost:5000/api/auth/update-password';
        }
        
        console.log('Using endpoint:', endpoint);
        
        // Call backend API to update password
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });
        
        console.log('Update password response status:', response.status);
        
        const data = await response.json();
        console.log('Update password response data:', data);
        
        if (response.ok && data.success) {
            showSuccess('Password updated successfully!');
            
            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } else {
            showError(data.message || 'Failed to update password. Server returned status: ' + response.status);
        }
    } catch (error) {
        console.error('Update password error:', error);
        showError('Cannot connect to server. Make sure backend is running! Error: ' + error.message);
    }
}

function logout() {
    // Clear all user data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    
    // Show notification
    if (window.sharedData && window.sharedData.showNotification) {
        window.sharedData.showNotification('Logged out successfully!', 'info');
    }
    
    // Redirect to home page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Make functions available globally BEFORE DOM loads
window.updateEmail = updateEmail;
window.updatePassword = updatePassword;
window.logout = logout;
window.showSuccess = showSuccess;
window.showError = showError;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Settings page loaded');
    
    // Initialize theme
    if (window.sharedData && window.sharedData.initThemeToggle) {
        window.sharedData.initThemeToggle();
    }
    
    // Check login
    if (!window.sharedData.requireLogin('index.html')) {
        return;
    }
    
    // Update login/settings buttons
    if (window.sharedData.updateLoginButtons) {
        window.sharedData.updateLoginButtons();
    }
    
    // Create messages
    successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    
    errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    
    settingsContent.appendChild(successMessage);
    settingsContent.appendChild(errorMessage);
    
    // Load user settings
    loadSettings();
});

function loadSettings() {
    const currentUser = window.sharedData.getCurrentUser();
    
    if (!currentUser) {
        showError('User not found. Please login again.');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    console.log('Loading settings for user:', currentUser.email);
    
    settingsContent.innerHTML = `
        <div class="settings-section">
            <h3><i class="fas fa-user-circle"></i> Profile Information</h3>
            
            <div class="form-group">
                <label>Name</label>
                <input type="text" id="userName" value="${currentUser.name || ''}" readonly>
            </div>
            
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="userEmail" value="${currentUser.email || ''}">
                <small>You can change your email address</small>
            </div>
            
            <button class="save-btn" onclick="window.updateEmail()">
                <i class="fas fa-save"></i> Update Email
            </button>
        </div>
        
        <div class="settings-section">
            <h3><i class="fas fa-lock"></i> Change Password</h3>
            
            <div class="form-group">
                <label>Current Password</label>
                <input type="password" id="currentPassword" placeholder="Enter current password">
            </div>
            
            <div class="form-group">
                <label>New Password</label>
                <input type="password" id="newPassword" placeholder="Enter new password">
            </div>
            
            <div class="form-group">
                <label>Confirm New Password</label>
                <input type="password" id="confirmPassword" placeholder="Confirm new password">
            </div>
            
            <button class="save-btn" onclick="window.updatePassword()">
                <i class="fas fa-key"></i> Change Password
            </button>
        </div>
        
        <div class="settings-section">
            <h3><i class="fas fa-book"></i> Reading Stats</h3>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem;">
                <div style="text-align: center;">
                    <h4 style="color: var(--primary); font-size: 2rem;">${currentUser.favorites ? currentUser.favorites.length : 0}</h4>
                    <p>Favorite Books</p>
                </div>
                
                <div style="text-align: center;">
                    <h4 style="color: var(--primary); font-size: 2rem;">${currentUser.myLibrary ? currentUser.myLibrary.length : 0}</h4>
                    <p>Books in Library</p>
                </div>
            </div>
        </div>
        
        <div class="logout-section">
            <button class="logout-btn" onclick="window.logout()">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>
    `;
}