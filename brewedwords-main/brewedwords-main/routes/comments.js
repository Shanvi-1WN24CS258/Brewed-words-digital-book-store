const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Added this
const Comment = require('../models/comment'); 
const { auth } = require('../middlewear/auth'); 
console.log('=== DEBUG: Loading comments.js ===');
console.log('Trying to import auth from:', require.resolve('../middlewear/auth'));
try {
    const authModule = require('../middlewear/auth');
    console.log('Auth module loaded:', authModule);
    console.log('Type:', typeof authModule);
    console.log('Keys:', Object.keys(authModule));
} catch (error) {
    console.error('Error loading auth:', error.message);
}

// ✅ GET comments
router.get('/book/:bookId', auth, async (req, res) => {
    try {
        const comments = await Comment.find({ bookId: req.params.bookId })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ POST new comment (Make sure this part is in your file!)
router.post('/', auth, async (req, res) => {
    try {
        const comment = new Comment({
            bookId: req.body.bookId,
            text: req.body.text,
            parentCommentId: req.body.parentCommentId || null,
            userId: req.user.id
        });
        const savedComment = await comment.save();
        const populated = await Comment.findById(savedComment._id).populate('userId', 'name email');
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ LIKE/UNLIKE comment
router.post('/:id/like', auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Comment ID' });
        }

        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        
        const userId = req.user.id;
        const likeIndex = comment.likes.indexOf(userId);
        
        if (likeIndex === -1) {
            comment.likes.push(userId);
        } else {
            comment.likes.splice(likeIndex, 1);
        }
        
        await comment.save();
        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ DELETE comment
router.delete('/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        
        if (comment.userId.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        await Comment.deleteMany({
            $or: [{ _id: req.params.id }, { parentCommentId: req.params.id }]
        });
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;