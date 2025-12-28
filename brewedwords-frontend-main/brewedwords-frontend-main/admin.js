const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middlewear/auth');
const User = require('../models/user');
const Comment = require('../models/comment');
const Book = require('../models/book');



// Admin dashboard stats
router.get('/dashboard/stats', adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalBooks = await Book.countDocuments();
        const totalComments = await Comment.countDocuments();
        const recentComments = await Comment.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('userId', 'name email');
        
        res.json({
            success: true,
            stats: {
                totalUsers,
                totalBooks,
                totalComments,
                recentComments
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Update user role
router.patch('/users/:id/role', adminAuth, async (req, res) => {
    try {
        const { role } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');
        
        res.json({
            success: true,
            message: 'User role updated',
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get all comments (admin view)
router.get('/comments', adminAuth, async (req, res) => {
    try {
        const comments = await Comment.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            comments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Force delete comment (admin)
router.delete('/comments/:id/force', adminAuth, async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'Comment permanently deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
function checkAdminAccess() {
    if (!AdminManager || !AdminManager.checkSession()) {
        // Redirect to admin login if not admin
        window.location.href = 'admin-login.html';
        return false;
    }
    
    return true;
}

module.exports = router;