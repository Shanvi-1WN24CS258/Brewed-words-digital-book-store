// config.js - Backend API Configuration

// ========================
// BACKEND API CONFIGURATION
// ========================

// Change this to your backend server URL
// For local development: http://localhost:5000
// For production: https://your-backend-domain.com
const API_BASE_URL = 'http://localhost:5000';

// API Endpoints
const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        REGISTER: `${API_BASE_URL}/api/auth/register`,
        LOGOUT: `${API_BASE_URL}/api/auth/logout`,
        GET_USER: `${API_BASE_URL}/api/auth/me`,
        UPDATE_EMAIL: `${API_BASE_URL}/api/auth/update-email`,
        UPDATE_PASSWORD: `${API_BASE_URL}/api/auth/update-password`
    },
    
    // Comments
    COMMENTS: {
        CREATE: `${API_BASE_URL}/api/comments`,
        GET_BY_BOOK: (bookId) => `${API_BASE_URL}/api/comments/book/${bookId}`,
        DELETE: (commentId) => `${API_BASE_URL}/api/comments/${commentId}`
    },
    
    // User Library/Favorites (if implemented in backend)
    USER: {
        GET_LIBRARY: `${API_BASE_URL}/api/user/library`,
        ADD_TO_LIBRARY: `${API_BASE_URL}/api/user/library`,
        REMOVE_FROM_LIBRARY: `${API_BASE_URL}/api/user/library`,
        GET_FAVORITES: `${API_BASE_URL}/api/user/favorites`,
        ADD_TO_FAVORITES: `${API_BASE_URL}/api/user/favorites`,
        REMOVE_FROM_FAVORITES: `${API_BASE_URL}/api/user/favorites`
    }
};

// Helper function to get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('token');
}

// Helper function to get auth headers
function getAuthHeaders() {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

// Export to window object for global access
// config.js
window.API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    ENDPOINTS: {
        AUTH: {
            REGISTER: 'http://localhost:5000/api/auth/register',
            LOGIN: 'http://localhost:5000/api/auth/login',
            UPDATE_EMAIL: 'http://localhost:5000/api/auth/update-email',
            UPDATE_PASSWORD: 'http://localhost:5000/api/auth/update-password'
        },
        USER: {
            GET_PROFILE: 'http://localhost:5000/api/user/me',
            LIBRARY: 'http://localhost:5000/api/user/library',
            FAVORITES: 'http://localhost:5000/api/user/favorites'
        },
        COMMENTS: {
            BASE: 'http://localhost:5000/api/comments'
        }
    },
    
    // Helper function to get auth headers
    getAuthHeaders: function() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }
};