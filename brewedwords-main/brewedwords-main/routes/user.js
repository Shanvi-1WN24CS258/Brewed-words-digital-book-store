// routes/user.js
const express = require('express');
const authMiddleware = require('../middlewear/auth');
const User = require('../models/user');
const router = express.Router();

// Get user profile (Protected)
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select('-password')
            .populate('favorites')
            .populate('myLibrary');

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                favorites: user.favorites || [],
                myLibrary: user.myLibrary || []
            }
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Get user library (Protected)
router.get('/library', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate('myLibrary');
        
        res.json({
            success: true,
            library: user.myLibrary || []
        });
    } catch (error) {
        console.error('Get library error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Add book to library (Protected)
router.post('/library', authMiddleware, async (req, res) => {
    try {
        const { bookId } = req.body;
        
        if (!bookId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Book ID is required' 
            });
        }

        const user = await User.findById(req.userId);
        
        // Check if book already in library
        if (user.myLibrary.includes(bookId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Book already in library' 
            });
        }

        // Add book to library
        user.myLibrary.push(bookId);
        await user.save();

        res.json({
            success: true,
            message: 'Book added to library',
            library: user.myLibrary
        });
    } catch (error) {
        console.error('Add to library error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Remove book from library (Protected)
router.delete('/library/:bookId', authMiddleware, async (req, res) => {
    try {
        const { bookId } = req.params;
        const user = await User.findById(req.userId);

        // Remove book from library
        user.myLibrary = user.myLibrary.filter(id => id.toString() !== bookId);
        await user.save();

        res.json({
            success: true,
            message: 'Book removed from library',
            library: user.myLibrary
        });
    } catch (error) {
        console.error('Remove from library error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Get user favorites (Protected)
router.get('/favorites', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate('favorites');
        
        res.json({
            success: true,
            favorites: user.favorites || []
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Add book to favorites (Protected)
router.post('/favorites', authMiddleware, async (req, res) => {
    try {
        const { bookId } = req.body;
        
        if (!bookId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Book ID is required' 
            });
        }

        const user = await User.findById(req.userId);
        
        // Check if book already in favorites
        if (user.favorites.includes(bookId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Book already in favorites' 
            });
        }

        // Add book to favorites
        user.favorites.push(bookId);
        await user.save();

        res.json({
            success: true,
            message: 'Book added to favorites',
            favorites: user.favorites
        });
    } catch (error) {
        console.error('Add to favorites error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Remove book from favorites (Protected)
router.delete('/favorites/:bookId', authMiddleware, async (req, res) => {
    try {
        const { bookId } = req.params;
        const user = await User.findById(req.userId);

        // Remove book from favorites
        user.favorites = user.favorites.filter(id => id.toString() !== bookId);
        await user.save();

        res.json({
            success: true,
            message: 'Book removed from favorites',
            favorites: user.favorites
        });
    } catch (error) {
        console.error('Remove from favorites error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;