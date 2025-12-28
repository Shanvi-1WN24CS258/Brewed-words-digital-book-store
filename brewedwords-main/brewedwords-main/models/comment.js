const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
   bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
    index: true
},

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,  // Added from Option 1
        maxlength: 1000  // Added from Option 1
    },
    parentCommentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null,
        index: true  // Added from Option 1
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Optional: Add these if you want soft delete
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtuals (keep these for frontend compatibility)
commentSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleDateString();
});

commentSchema.virtual('userName').get(function() {
    return this.userId?.name || 'Unknown User';
});

// Optional: Add index for better query performance
commentSchema.index({ bookId: 1, parentCommentId: 1, createdAt: -1 });
// REPLACE THESE TWO LINES:
// const Comment = mongoose.model('Comment', commentSchema);
// module.exports = Comment;

// WITH THIS SAFE EXPORT:
module.exports = mongoose.models.Comment || mongoose.model('Comment', commentSchema);