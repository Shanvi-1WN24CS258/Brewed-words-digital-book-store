// book-details.js - Book details page functionality

// DOM Elements
let currentBookId = null;
let currentUser = null;

// Wait for DOM and shared data to be ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Book details page loading...');
    const API_BASE = window.location.port === '5000' 
    ? 'http://localhost:5000/api' 
    : '/api';

    try {
        // ✅ ADD LOGGING FOR ADMIN STATUS
        console.log('Admin status on load:', localStorage.getItem('isAdmin'));
        console.log('Full localStorage:', localStorage);
        
        // Initialize theme
        if (window.sharedData && window.sharedData.initThemeToggle) {
            window.sharedData.initThemeToggle();
        }
        
        // Check login FIRST
        if (!window.sharedData.requireLogin('index.html')) {
            console.log('Login required - redirecting');
            return;
        }
        
        currentUser = window.sharedData.getCurrentUser();
        console.log('Current user set:', currentUser);
        
        // ✅ FIX: Load saved comments BEFORE getting book details
        await loadCommentsFromLocalStorage();
        console.log('Comments loaded from localStorage');
        
        // Get book ID from URL - Keep as string
        const urlParams = new URLSearchParams(window.location.search);
        currentBookId = urlParams.get('id');
        console.log('Current book ID (string):', currentBookId, 'Type:', typeof currentBookId);
        
        if (!currentBookId) {
            console.error('No book ID found in URL');
            showErrorMessage('Book not found. <a href="index.html">Return to home page</a>');
            return;
        }
        
        // Load book details
        await loadBookDetails();
        console.log('Book details loaded');
        
    } catch (error) {
        console.error('Error in DOMContentLoaded:', error);
        showErrorMessage('Error loading page: ' + error.message);
    }
});

// Get books from shared.js with proper string ID handling
function getAllBooks() {
    const books = window.sharedData?.allBooks || getFallbackBooks();
    
    // Convert all IDs to strings for consistency
    return books.map(book => ({
        ...book,
        id: String(book.id) // Ensure ID is string
    }));
}

// Fallback books with string IDs
function getFallbackBooks() {
    return [
        {
            id: "1", // Changed to string
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            genre: "Classic",
            year: 1925,
            summary: "A story of the fabulously wealthy Jay Gatsby...",
            image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            rating: 4.8,
            featured: true
        }
    ];
}

let isLoadingComments = false;

async function loadComments() {
    console.log('=== loadComments() called ===');
    
    const commentsList = document.getElementById('commentsList');
    const commentFormContainer = document.getElementById('commentFormContainer');
    if (!commentsList || !commentFormContainer) return;

    try {
        commentsList.innerHTML = '<div class="loading">Loading comments...</div>';

        // Try multiple possible API endpoints
        let bookComments = [];
        let apiError = null;
        
        // Try different API endpoints - your backend might use different format
        const token = localStorage.getItem('token');
        const possibleEndpoints = [
            `/api/comments/book/${currentBookId}`,
            `/api/books/${currentBookId}/comments`,
            `/api/comments?bookId=${currentBookId}`
        ];
        
        // Try each endpoint
        for (const endpoint of possibleEndpoints) {
            try {
                console.log(`Trying API endpoint: ${endpoint}`);
                const response = await fetch(endpoint, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    bookComments = await response.json();
                    console.log(`Success with endpoint: ${endpoint}`, bookComments.length);
                    break;
                } else if (response.status === 404) {
                    console.log(`Endpoint ${endpoint} returned 404, trying next...`);
                    continue;
                } else {
                    throw new Error(`API error: ${response.status}`);
                }
            } catch (err) {
                apiError = err;
                console.log(`Failed with ${endpoint}:`, err.message);
            }
        }
        
        // If no API worked, use localStorage comments for this book
        if (!bookComments.length) {
            console.log('No API endpoints worked, using localStorage comments');
            bookComments = (window.sharedData.comments || []).filter(
                comment => String(comment.bookId) === String(currentBookId)
            );
            
            if (bookComments.length) {
                console.log(`Found ${bookComments.length} comments in localStorage for book ${currentBookId}`);
            }
        }

        // Separate top-level comments and replies
        const topLevelComments = bookComments.filter(c => !c.parentCommentId);
        const replies = bookComments.filter(c => c.parentCommentId);

        if (!topLevelComments.length) {
            commentsList.innerHTML = `<div class="no-comments">No comments yet. Be the first to share your thoughts!</div>`;
            return;
        }

        const currentUserId = currentUser?.id;
        let commentsHTML = '';

        topLevelComments.forEach(comment => {
            const commentId = comment._id || comment.id;
            const isAdmin = localStorage.getItem('isAdmin') === 'true';
            
            // ✅ FIXED: Compare string IDs properly
            const isCommentOwner = currentUserId && (
                String(comment.userId?._id || comment.userId) === String(currentUserId)
            );

            const commentReplies = replies.filter(r => 
                String(r.parentCommentId) === String(commentId)
            );
            
            // Get user name - handle different formats
            let userName = 'Unknown User';
            if (comment.userName) {
                userName = comment.userName;
            } else if (comment.userId?.name) {
                userName = comment.userId.name;
            } else if (comment.userId?.username) {
                userName = comment.userId.username;
            } else if (comment.user) {
                userName = comment.user.name || comment.user.username || 'Unknown User';
            }
            
            const commentDate = comment.formattedDate || 
                              comment.date || 
                              (comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Recent');
            
            // ✅ FIXED: Compare likes with string IDs
            const userLikedComment = comment.likes && Array.isArray(comment.likes) && 
                comment.likes.some(like => 
                    String(like) === String(currentUserId) || 
                    String(like?._id) === String(currentUserId)
                );

            commentsHTML += `
                <div class="comment-card" data-comment-id="${commentId}">
                    <div class="comment-header">
                        <strong>${userName}</strong>
                        <span class="comment-date">${commentDate}</span>
                    </div>
                    <div class="comment-content">${comment.text}</div>
                    <div class="comment-actions">
                        <button class="reply-btn" onclick="showReplyForm('${commentId}')">
                            <i class="fas fa-reply"></i> Reply ${commentReplies.length > 0 ? '(' + commentReplies.length + ')' : ''}
                        </button>
                        <button class="like-btn ${userLikedComment ? 'liked' : ''}" onclick="likeComment('${commentId}')">
                            <i class="${userLikedComment ? 'fas' : 'far'} fa-heart"></i> ${userLikedComment ? 'Liked' : 'Like'} ${comment.likes?.length || ''}
                        </button>
                        ${(isCommentOwner || isAdmin) ? `
                            <button class="delete-btn" onclick="deleteComment('${commentId}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        ` : ''}
                    </div>
                    ${commentReplies.length ? `
                        <div class="replies-container">
                            ${commentReplies.map(reply => {
                                const replyId = reply._id || reply.id;
                                
                                // ✅ FIXED: Compare string IDs for reply ownership
                                const isReplyOwner = currentUserId && (
                                    String(reply.userId?._id || reply.userId) === String(currentUserId)
                                );
                                
                                // Get reply user name
                                let replyUserName = 'Unknown User';
                                if (reply.userName) {
                                    replyUserName = reply.userName;
                                } else if (reply.userId?.name) {
                                    replyUserName = reply.userId.name;
                                } else if (reply.userId?.username) {
                                    replyUserName = reply.userId.username;
                                } else if (reply.user) {
                                    replyUserName = reply.user.name || reply.user.username || 'Unknown User';
                                }
                                
                                const replyDate = reply.formattedDate || 
                                                 reply.date || 
                                                 (reply.createdAt ? new Date(reply.createdAt).toLocaleDateString() : 'Recent');
                                
                                // ✅ FIXED: Compare likes with string IDs
                                const userLikedReply = reply.likes && Array.isArray(reply.likes) && 
                                    reply.likes.some(like => 
                                        String(like) === String(currentUserId) || 
                                        String(like?._id) === String(currentUserId)
                                    );
                                    
                                return `
                                    <div class="reply-card">
                                        <div class="reply-header">
                                            <strong>${replyUserName}</strong>
                                            <span class="reply-date">${replyDate}</span>
                                        </div>
                                        <div class="reply-text">${reply.text}</div>
                                        <div class="reply-actions">
                                            <button class="like-btn ${userLikedReply ? 'liked' : ''}" onclick="likeComment('${replyId}')">
                                                <i class="${userLikedReply ? 'fas' : 'far'} fa-heart"></i> ${userLikedReply ? 'Liked' : 'Like'} ${reply.likes?.length || ''}
                                            </button>
                                            ${(isReplyOwner || isAdmin) ? `
                                                <button class="delete-btn" onclick="deleteComment('${replyId}')">
                                                    <i class="fas fa-trash"></i> Delete
                                                </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        });

        commentsList.innerHTML = commentsHTML;

        // Comment form
        commentFormContainer.innerHTML = `
            <h3>Add a Comment</h3>
            <textarea id="newCommentText" placeholder="Share your thoughts..." rows="3"></textarea>
            <button onclick="postComment()" class="action-btn">Post Comment</button>
        `;

    } catch (error) {
        console.error('Error loading comments:', error);
        commentsList.innerHTML = `
            <p class="error">Could not load comments from server.</p>
            <p class="info">Using local comments instead.</p>
        `;
        
        // Try to load from localStorage
        try {
            const localComments = (window.sharedData.comments || []).filter(
                comment => String(comment.bookId) === String(currentBookId)
            );
            
            if (localComments.length) {
                // Display local comments
                commentsList.innerHTML = '<h3>Local Comments</h3>' +
                    localComments.map(comment => `
                        <div class="comment-card">
                            <div class="comment-header">
                                <strong>${comment.userName || 'User'}</strong>
                                <span class="comment-date">${comment.date || 'Recent'}</span>
                            </div>
                            <div class="comment-content">${comment.text}</div>
                        </div>
                    `).join('');
            }
        } catch (localError) {
            console.error('Error loading local comments:', localError);
        }
    }
}

// Rest of your functions remain the same (toggleFavorite, toggleLibrary, postComment, etc.)
// Make sure to update the postComment function to handle the API errors gracefully:

async function postComment() {
    const commentText = document.getElementById('newCommentText')?.value.trim();
    
    if (!commentText) {
        window.sharedData.showNotification('Please write a comment first!', 'error');
        return;
    }
    
    if (!currentUser) {
        window.sharedData.showNotification('Please login to comment!', 'warning');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.sharedData.showNotification('Please login again!', 'error');
            return;
        }
        
        // Try different API endpoints for posting
        let newComment = null;
        let apiError = null;
        const response = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookId: currentBookId, text: commentText })
});

        const endpoints = [
            '/api/comments',
            '/api/books/comments',
            '/api/comment'
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        bookId: currentBookId,
                        text: commentText,
                        parentCommentId: null
                    })
                });
                
                if (response.ok) {
                    newComment = await response.json();
                    console.log('Comment posted successfully to:', endpoint);
                    break;
                }
            } catch (err) {
                apiError = err;
                console.log(`Failed with ${endpoint}:`, err.message);
            }
        }
        
        let localComment;
        
        if (newComment) {
            // Success from API
            localComment = {
                _id: newComment._id,
                id: newComment._id || newComment.id,
                bookId: newComment.bookId || currentBookId,
                userId: newComment.userId?._id || newComment.userId || currentUser.id,
                userName: newComment.userId?.name || newComment.userId?.username || currentUser.name || 'User',
                text: newComment.text,
                date: newComment.formattedDate || new Date(newComment.createdAt || Date.now()).toLocaleDateString(),
                likes: newComment.likes || [],
                parentCommentId: newComment.parentCommentId || null,
                createdAt: newComment.createdAt || new Date(),
                formattedDate: newComment.formattedDate
            };
            
            window.sharedData.showNotification('Comment posted successfully!', 'success');
        } else {
            // Fallback to local storage
            console.log('All API endpoints failed, saving locally');
            
            localComment = {
                id: Date.now().toString(),
                _id: 'local_' + Date.now(),
                bookId: currentBookId,
                userId: currentUser.id,
                userName: currentUser.name || currentUser.username || 'User',
                text: commentText,
                date: new Date().toLocaleDateString(),
                likes: [],
                parentCommentId: null,
                isLocal: true,
                createdAt: new Date()
            };
            
            window.sharedData.showNotification('Comment saved locally (offline mode)', 'warning');
        }
        
        // Add to local storage
        if (!window.sharedData.comments) {
            window.sharedData.comments = [];
        }
        window.sharedData.comments.push(localComment);
        saveCommentsToLocalStorage();
        
        // Clear textarea
        if (document.getElementById('newCommentText')) {
            document.getElementById('newCommentText').value = '';
        }
        
        // Reload comments
        await loadComments();
        
    } catch (error) {
        console.error('Error posting comment:', error);
        window.sharedData.showNotification('Error posting comment: ' + error.message, 'error');
    }
}

// ... Rest of your existing functions (saveCommentsToLocalStorage, loadCommentsFromLocalStorage, 
// likeComment, showReplyForm, submitReply, deleteComment, etc.) remain the same ...

async function loadBookDetails() {
    const bookDetailsContent = document.getElementById('bookDetailsContent');
    
    // Get books from shared.js with string IDs
    const allBooks = getAllBooks();
    console.log('Loading book details. Available books:', allBooks);
    
    // ✅ FIXED: Compare string IDs
    const book = allBooks.find(b => String(b.id) === String(currentBookId));
    
    if (!book) {
        showErrorMessage(`Book with ID ${currentBookId} not found. <a href="index.html">Return to home page</a>`);
        return;
    }
    
    // Check if book is in user's favorites/library - compare string IDs
    const isFavorite = currentUser && currentUser.favorites && 
        currentUser.favorites.some(favId => String(favId) === String(currentBookId));
    
    const inLibrary = currentUser && currentUser.myLibrary && 
        currentUser.myLibrary.some(libId => String(libId) === String(currentBookId));
    
    // Create book details HTML
    bookDetailsContent.innerHTML = `
        <div class="book-details">
            <div class="book-cover">
                <img src="${book.image}" alt="${book.title}" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'">
            </div>
            <div class="book-info-details">
                <h1>${book.title}</h1>
                <h3>by ${book.author}</h3>
                
                <div class="book-meta-info">
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>Published: ${book.year}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-tag"></i>
                        <span>Genre: <span class="book-genre">${book.genre}</span></span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-star"></i>
                        <span class="rating-display">${book.rating || '4.0'} ⭐</span>
                    </div>
                </div>
                
                <div class="book-actions">
                    <button class="action-btn favorite-btn ${isFavorite ? 'active' : ''}" id="favoriteBtn" onclick="toggleFavorite()">
                        <i class="fas fa-heart"></i>
                        ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                    <button class="action-btn library-btn ${inLibrary ? 'active' : ''}" id="libraryBtn" onclick="toggleLibrary()">
                        <i class="fas fa-bookmark"></i>
                        ${inLibrary ? 'Remove from Library' : 'Add to My Library'}
                    </button>
                </div>
                
                <div class="book-summary">
                    <h3>Summary</h3>
                    <p>${book.summary}</p>
                </div>
            </div>
        </div>
    `;
    
    // Load comments
    setTimeout(() => {
        console.log('Timeout - calling loadComments()...');
        loadComments();
    }, 100);
}

// ... Other functions remain unchanged ...

function toggleFavorite() {
    if (window.sharedData.toggleFavorite(currentBookId)) {
        const favoriteBtn = document.getElementById('favoriteBtn');
        const isFavorite = favoriteBtn.classList.contains('active');
        
        favoriteBtn.classList.toggle('active');
        favoriteBtn.innerHTML = `<i class="fas fa-heart"></i> ${isFavorite ? 'Add to Favorites' : 'Remove from Favorites'}`;
        
        // Update user data
        currentUser = window.sharedData.getCurrentUser();
        
        window.sharedData.showNotification(
            isFavorite ? 'Removed from favorites' : 'Added to favorites!',
            'success'
        );
    }
}

function toggleLibrary() {
    if (window.sharedData.toggleLibrary(currentBookId)) {
        const libraryBtn = document.getElementById('libraryBtn');
        const inLibrary = libraryBtn.classList.contains('active');
        
        libraryBtn.classList.toggle('active');
        libraryBtn.innerHTML = `<i class="fas fa-bookmark"></i> ${inLibrary ? 'Add to My Library' : 'Remove from Library'}`;
        
        // Update user data
        currentUser = window.sharedData.getCurrentUser();
        
        window.sharedData.showNotification(
            inLibrary ? 'Removed from your library' : 'Added to your library!',
            'success'
        );
    }
}

// async function postComment() {
//     const commentText = document.getElementById('newCommentText')?.value.trim();
    
//     if (!commentText) {
//         window.sharedData.showNotification('Please write a comment first!', 'error');
//         return;
//     }
    
//     if (!currentUser) {
//         window.sharedData.showNotification('Please login to comment!', 'warning');
//         return;
//     }
    
//     try {
//         // 1. Send to backend API (MongoDB)
//         const token = localStorage.getItem('token');
//         if (!token) {
//             window.sharedData.showNotification('Please login again!', 'error');
//             return;
//         }
        
//         const response = await fetch('/api/comments', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             },
//             body: JSON.stringify({
//                 bookId: currentBookId,
//                 text: commentText,
//                 parentCommentId: null
//             })
//         });
        
//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.message || 'Failed to post comment');
//         }
        
//         const newComment = await response.json();
        
//         // 2. Convert MongoDB response to local format
//         const localComment = {
//             _id: newComment._id,
//             id: newComment._id,
//             bookId: newComment.bookId,
//             userId: newComment.userId?._id || newComment.userId,
//             userName: newComment.userId?.name || currentUser.name,
//             text: newComment.text,
//             date: newComment.formattedDate || new Date(newComment.createdAt).toLocaleDateString(),
//             likes: newComment.likes || [],
//             parentCommentId: newComment.parentCommentId || null,
//             createdAt: newComment.createdAt,
//             formattedDate: newComment.formattedDate
//         };
        
//         // Add to local storage
//         if (!window.sharedData.comments) {
//             window.sharedData.comments = [];
//         }
//         window.sharedData.comments.push(localComment);
//         saveCommentsToLocalStorage();
        
//         // 3. Clear textarea
//         if (document.getElementById('newCommentText')) {
//             document.getElementById('newCommentText').value = '';
//         }
        
//         // 4. Reload comments
//         await loadComments();
        
//         window.sharedData.showNotification('Comment posted successfully!', 'success');
        
//     } catch (error) {
//         console.error('Error posting comment:', error);
        
//         // Fallback: Save locally if backend fails
//         const fallbackComment = {
//             id: Date.now().toString(),
//             _id: 'local_' + Date.now(),
//             bookId: currentBookId,
//             userId: currentUser.id,
//             userName: currentUser.name,
//             text: commentText,
//             date: new Date().toLocaleDateString(),
//             likes: [],
//             parentCommentId: null,
//             isLocal: true,
//             createdAt: new Date()
//         };
        
//         if (!window.sharedData.comments) {
//             window.sharedData.comments = [];
//         }
//         window.sharedData.comments.push(fallbackComment);
//         saveCommentsToLocalStorage();
        
//         // Clear textarea
//         if (document.getElementById('newCommentText')) {
//             document.getElementById('newCommentText').value = '';
//         }
        
//         // Reload local comments
//         loadComments();
        
//         window.sharedData.showNotification('Comment saved locally (offline mode)', 'warning');
//     }
// }

// Save comments to localStorage
function saveCommentsToLocalStorage() {
    try {
        localStorage.setItem('bookComments', JSON.stringify(window.sharedData.comments || []));
        console.log('Comments saved to localStorage');
    } catch (error) {
        console.error('Error saving comments:', error);
    }
}

// Load comments from localStorage
function loadCommentsFromLocalStorage() {
    try {
        const savedComments = localStorage.getItem('bookComments');
        if (savedComments) {
            const parsedComments = JSON.parse(savedComments);
            
            // Merge with existing comments (avoid duplicates)
            if (window.sharedData.comments) {
                // Create a map of existing comment IDs for quick lookup
                const existingIds = new Set(window.sharedData.comments.map(c => String(c.id)));
                
                // Add saved comments that don't already exist
                parsedComments.forEach(comment => {
                    if (!existingIds.has(String(comment.id))) {
                        window.sharedData.comments.push(comment);
                    }
                });
            } else {
                window.sharedData.comments = parsedComments;
            }
            
            console.log('Loaded comments from localStorage:', parsedComments.length);
        }
    } catch (error) {
        console.error('Error loading comments from localStorage:', error);
    }
}

async function likeComment(commentId) {
    if (!currentUser) {
        window.sharedData.showNotification('Please login to like comments!', 'warning');
        return;
    }
    
    console.log('Liking comment/reply ID:', commentId, 'User ID:', currentUser.id);
    
    try {
        // Try to send like to backend
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/comments/${commentId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const updatedComment = await response.json();
            
            // Update local data
            const commentIndex = window.sharedData.comments.findIndex(c => 
                String(c._id) === String(commentId) || String(c.id) === String(commentId)
            );
            
            if (commentIndex !== -1) {
                window.sharedData.comments[commentIndex] = updatedComment;
            }
            
            // Update UI
            const isLiked = updatedComment.likes && updatedComment.likes.some(
                like => String(like) === String(currentUser.id) || String(like?._id) === String(currentUser.id)
            );
            updateLikeButtonUI(commentId, isLiked);
            updateLikeCountDisplay(commentId, updatedComment.likes?.length || 0);
            
            window.sharedData.showNotification('Comment liked!', 'success');
            
        } else {
            // Backend failed, fallback to local like
            throw new Error('Backend failed');
        }
        
    } catch (error) {
        console.error('Error with backend like, falling back to local:', error);
        
        // Fallback to local like
        const comment = window.sharedData.comments.find(c => 
            String(c.id) === String(commentId) || String(c._id) === String(commentId)
        );
        
        if (!comment) {
            console.error('Comment not found:', commentId);
            return;
        }
        
        // Initialize likes array if it doesn't exist
        if (!comment.likes) {
            comment.likes = [];
        }
        
        // Convert likes to string IDs for comparison
        const stringLikes = comment.likes.map(like => String(like));
        const userIndex = stringLikes.indexOf(String(currentUser.id));
        const isLiked = userIndex !== -1;
        
        if (isLiked) {
            // Remove like
            comment.likes.splice(userIndex, 1);
            window.sharedData.showNotification('Like removed', 'info');
        } else {
            // Add like
            comment.likes.push(currentUser.id);
            window.sharedData.showNotification('Comment liked! (local)', 'success');
        }
        
        // Save to localStorage
        saveCommentsToLocalStorage();
        
        // Update UI
        updateLikeButtonUI(commentId, !isLiked);
        updateLikeCountDisplay(commentId, comment.likes.length);
    }
}

// Helper function to update like button UI
function updateLikeButtonUI(commentId, isLiked) {
    // Find all like buttons for this comment (both comments and replies)
    const allLikeBtns = document.querySelectorAll('.like-btn');
    
    allLikeBtns.forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`likeComment('${commentId}')`)) {
            if (isLiked) {
                btn.classList.add('liked');
                btn.style.backgroundColor = '#ff4757';
                btn.style.borderColor = '#ff4757';
                btn.style.color = 'white';
                
                // Update icon
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-heart';
                }
                
                // Update text
                const text = btn.textContent || btn.innerText;
                if (text.includes('Like')) {
                    btn.innerHTML = btn.innerHTML.replace('Like', 'Liked');
                }
            } else {
                btn.classList.remove('liked');
                btn.style.backgroundColor = '';
                btn.style.borderColor = '';
                btn.style.color = '';
                
                // Update icon
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = 'far fa-heart';
                }
                
                // Update text
                const text = btn.textContent || btn.innerText;
                if (text.includes('Liked')) {
                    btn.innerHTML = btn.innerHTML.replace('Liked', 'Like');
                }
            }
        }
    });
}

function updateLikeCountDisplay(commentId, likeCount) {
    // Find all like buttons for this comment
    const allLikeBtns = document.querySelectorAll('.like-btn');
    
    allLikeBtns.forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`likeComment('${commentId}')`)) {
            // Remove existing count in parentheses
            let html = btn.innerHTML;
            html = html.replace(/\(\d+\)/g, '');
            
            // Add new count if > 0
            if (likeCount > 0) {
                // Find where to insert count (after Like/Liked)
                if (html.includes('Liked')) {
                    html = html.replace('Liked', `Liked (${likeCount})`);
                } else if (html.includes('Like')) {
                    html = html.replace('Like', `Like (${likeCount})`);
                }
            }
            
            btn.innerHTML = html;
        }
    });
}

function showReplyForm(commentId) {
    if (!currentUser) {
        window.sharedData.showNotification('Please login to reply!', 'warning');
        return;
    }
    
    // Remove any existing reply forms
    const existingForm = document.querySelector('.reply-form-container');
    if (existingForm) existingForm.remove();
    
    // Create reply form
    const replyFormHTML = `
        <div class="reply-form-container">
            <form class="reply-form" onsubmit="submitReply(event, '${commentId}')">
                <textarea placeholder="Write your reply..." rows="2" required></textarea>
                <div class="reply-actions">
                    <button type="submit" class="btn-small btn-primary">Submit Reply</button>
                    <button type="button" class="btn-small btn-cancel" onclick="this.closest('.reply-form-container').remove()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    // Find the comment and add form after it
    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (commentElement) {
        commentElement.insertAdjacentHTML('afterend', replyFormHTML);
        commentElement.querySelector('textarea')?.focus();
    }
}

async function submitReply(event, parentCommentId) {
    event.preventDefault();
    
    const textarea = event.target.querySelector('textarea');
    const replyText = textarea.value.trim();
    
    if (!replyText) {
        window.sharedData.showNotification('Please write a reply!', 'error');
        return;
    }
    
    try {
        // Send to backend API
        const token = localStorage.getItem('token');
        const response = await fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                bookId: currentBookId,
                text: replyText,
                parentCommentId: parentCommentId
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to post reply');
        }
        
        const newReply = await response.json();
        
        // Add to shared.js comments array
        if (!window.sharedData.comments) {
            window.sharedData.comments = [];
        }
        
        // Convert MongoDB format to local format
        const localReply = {
            _id: newReply._id,
            id: newReply._id,
            bookId: newReply.bookId,
            userId: newReply.userId?._id || newReply.userId,
            userName: newReply.userId?.name || currentUser.name,
            text: newReply.text,
            date: new Date(newReply.createdAt || Date.now()).toLocaleDateString(),
            likes: newReply.likes || [],
            parentCommentId: newReply.parentCommentId || parentCommentId,
            createdAt: newReply.createdAt
        };
        
        window.sharedData.comments.push(localReply);
        saveCommentsToLocalStorage();
        
        // Remove reply form
        event.target.closest('.reply-form-container').remove();
        
        // Reload comments to show the new reply
        await loadComments();
        
        window.sharedData.showNotification('Reply posted!', 'success');
        
    } catch (error) {
        console.error('Error posting reply:', error);
        
        // Fallback to local save
        const fallbackReply = {
            id: Date.now().toString(),
            _id: 'local_' + Date.now(),
            bookId: currentBookId,
            userId: currentUser.id,
            userName: currentUser.name,
            text: replyText,
            date: new Date().toLocaleDateString(),
            likes: [],
            parentCommentId: parentCommentId,
            isLocal: true
        };
        
        if (!window.sharedData.comments) {
            window.sharedData.comments = [];
        }
        window.sharedData.comments.push(fallbackReply);
        saveCommentsToLocalStorage();
        
        // Remove reply form
        event.target.closest('.reply-form-container').remove();
        
        // Reload local comments
        loadComments();
        
        window.sharedData.showNotification('Reply saved locally (offline mode)', 'warning');
    }
}

async function deleteComment(commentId) {
    const currentUser = window.sharedData.getCurrentUser();
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

   if (!currentUser) {
    window.sharedData.showNotification('Please login!', 'warning');
    return;
}


    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
        // 1. Delete from backend
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete comment');
        }
        
        // 2. Remove from local storage
        const index = window.sharedData.comments.findIndex(
            c => String(c._id) === String(commentId) || String(c.id) === String(commentId)
        );

        if (index !== -1) {
            window.sharedData.comments.splice(index, 1);
        }

        // 3. Remove its replies locally
        window.sharedData.comments = window.sharedData.comments.filter(
            c => String(c.parentCommentId) !== String(commentId)
        );

        // 4. Save to localStorage as backup
        saveCommentsToLocalStorage();
        
        // 5. Reload UI
        loadComments();

        window.sharedData.showNotification('Comment deleted', 'success');
        
    } catch (error) {
        console.error('Error deleting comment:', error);
        window.sharedData.showNotification('Error deleting comment: ' + error.message, 'error');
    }
}

function showErrorMessage(message) {
    const bookDetailsContent = document.getElementById('bookDetailsContent');
    if (bookDetailsContent) {
        bookDetailsContent.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

async function loadBookDetails() {
    const bookDetailsContent = document.getElementById('bookDetailsContent');
    
    // Get books from shared.js with string IDs
    const allBooks = getAllBooks();
    console.log('Loading book details. Available books:', allBooks);
    
    // ✅ FIXED: Compare string IDs
    const book = allBooks.find(b => String(b.id) === String(currentBookId));
    
    if (!book) {
        showErrorMessage(`Book with ID ${currentBookId} not found. <a href="index.html">Return to home page</a>`);
        return;
    }
    
    // Check if book is in user's favorites/library - compare string IDs
    const isFavorite = currentUser && currentUser.favorites && 
        currentUser.favorites.some(favId => String(favId) === String(currentBookId));
    
    const inLibrary = currentUser && currentUser.myLibrary && 
        currentUser.myLibrary.some(libId => String(libId) === String(currentBookId));
    
    // Create book details HTML
    bookDetailsContent.innerHTML = `
        <div class="book-details">
            <div class="book-cover">
                <img src="${book.image}" alt="${book.title}" onerror="this.src='https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'">
            </div>
            <div class="book-info-details">
                <h1>${book.title}</h1>
                <h3>by ${book.author}</h3>
                
                <div class="book-meta-info">
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>Published: ${book.year}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-tag"></i>
                        <span>Genre: <span class="book-genre">${book.genre}</span></span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-star"></i>
                        <span class="rating-display">${book.rating || '4.0'} ⭐</span>
                    </div>
                </div>
                
                <div class="book-actions">
                    <button class="action-btn favorite-btn ${isFavorite ? 'active' : ''}" id="favoriteBtn" onclick="toggleFavorite()">
                        <i class="fas fa-heart"></i>
                        ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                    <button class="action-btn library-btn ${inLibrary ? 'active' : ''}" id="libraryBtn" onclick="toggleLibrary()">
                        <i class="fas fa-bookmark"></i>
                        ${inLibrary ? 'Remove from Library' : 'Add to My Library'}
                    </button>
                </div>
                
                <div class="book-summary">
                    <h3>Summary</h3>
                    <p>${book.summary}</p>
                </div>
            </div>
        </div>
    `;
    
    // Load comments
    setTimeout(() => {
        console.log('Timeout - calling loadComments()...');
        loadComments();
    }, 100);
}

// NEW FUNCTION: Remove all loading elements
function removeAllLoadingElements() {
    // Remove by class
    document.querySelectorAll('.loading').forEach(el => {
        el.style.display = 'none';
        el.remove();
    });
    
    // Remove any elements with "Loading" text
    document.querySelectorAll('p, div, span').forEach(el => {
        const text = el.textContent || '';
        if (text.includes('Loading comments') || text.includes('Loading...')) {
            el.style.display = 'none';
            el.remove();
        }
    });
}