// models/user.js - Alternative fix
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,  // Keep as ObjectId
        ref: 'Book'  // References the Book model
    }],
    myLibrary: [{
        type: mongoose.Schema.Types.ObjectId,  // Keep as ObjectId
        ref: 'Book'  // References the Book model
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);