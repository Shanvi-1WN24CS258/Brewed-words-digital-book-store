const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);
let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db('libraryDB');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
}

function verifyToken(token) {
    try {
        // Basic Base64 decode (Match your frontend payload)
        const userData = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return {
            _id: new ObjectId(userData.userId || userData.id),
            name: userData.name,
            email: userData.email,
            isAdmin: userData.isAdmin || false
        };
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

// --- ROUTES ---

// Get book by ID
app.get('/api/book/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        let query;

        // ✅ IMPROVED: Check if it's a valid hex string (ObjectId) or a number
        if (ObjectId.isValid(bookId) && bookId.length === 24) {
            query = { _id: new ObjectId(bookId) };
        } else if (!isNaN(bookId)) {
            query = { frontendId: parseInt(bookId) };
        } else {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const book = await db.collection('books').findOne(query);
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json(book);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get comments for a book
app.get('/api/comments/book/:bookId', async (req, res) => {
    try {
        const bookId = req.params.bookId;
        // Search for BOTH integer IDs and String IDs to be safe
        const query = {
            $or: [
                { bookId: bookId },
                { bookId: parseInt(bookId) || -1 }
            ]
        };

        const comments = await db.collection('comments')
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();
        
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Post a new comment or reply
app.post('/api/comments', async (req, res) => {
    try {
        const { bookId, text, parentCommentId } = req.body;
        const token = req.headers.authorization?.replace('Bearer ', '');
        const user = verifyToken(token);
        
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        if (!bookId || !text) return res.status(400).json({ error: 'Missing fields' });

        const newComment = {
            _id: new ObjectId(),
            // ✅ FIXED: Store bookId as a string if it's a MongoDB ID
            bookId: !isNaN(bookId) ? parseInt(bookId) : bookId,
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            text: text,
            likes: [],
            // ✅ FIXED: Ensure parentCommentId is stored as a string
            parentCommentId: parentCommentId ? String(parentCommentId) : null,
            createdAt: new Date(),
            formattedDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            })
        };
        
        await db.collection('comments').insertOne(newComment);
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Like/Unlike a comment
app.post('/api/comments/:commentId/like', async (req, res) => {
    try {
        const { commentId } = req.params;
        const token = req.headers.authorization?.replace('Bearer ', '');
        const user = verifyToken(token);
        
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        
        const query = { _id: new ObjectId(commentId) };
        const comment = await db.collection('comments').findOne(query);
        
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        // Ensure likes array exists
        const likes = comment.likes || [];
        const userStrId = user._id.toString();
        
        const hasLiked = likes.some(id => id.toString() === userStrId);
        
        const update = hasLiked 
            ? { $pull: { likes: user._id } } 
            : { $addToSet: { likes: user._id } };

        await db.collection('comments').updateOne(query, update);
        const updated = await db.collection('comments').findOne(query);
        
        res.json({ ...updated, action: hasLiked ? 'unliked' : 'liked' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a comment
app.delete('/api/comments/:commentId', async (req, res) => {
    try {
        const { commentId } = req.params;
        const token = req.headers.authorization?.replace('Bearer ', '');
        const user = verifyToken(token);
        
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        
        const query = { _id: new ObjectId(commentId) };
        const comment = await db.collection('comments').findOne(query);
        
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        // Admin or Owner check
        if (comment.userId.toString() !== user._id.toString() && !user.isAdmin) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        
        // ✅ FIXED: Delete the comment AND any replies linked to it
        await db.collection('comments').deleteMany({
            $or: [
                { _id: new ObjectId(commentId) },
                { parentCommentId: String(commentId) }
            ]
        });
        
        res.json({ success: true, message: 'Comment and replies deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Initialize and Start
async function startServer() {
    await connectDB();
    // Indexing for performance
    await db.collection('comments').createIndex({ bookId: 1 });
    await db.collection('comments').createIndex({ parentCommentId: 1 });
    
    app.listen(port, () => console.log(`Server running on port ${port}`));
}

startServer().catch(console.error);