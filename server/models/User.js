// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    isPublicPortfolioEnabled: {
        type: Boolean,
        default: false
    },
    publicPortfolioId: {
        type: String,
        unique: true,
        sparse: true
    },
    avatarUrl: {
        type: String,
        default: 'https://res.cloudinary.com/dvf40q13y/image/upload/v1724858882/skill-tracker/default-avatar.png'
    },
    avatarPublicId: {
        type: String
    },
    portfolioTheme: {
        type: String,
        enum: ['default', 'modern', 'minimal', 'dark'],
        default: 'default'
    },
    // --- New field for Advanced Public Portfolio Settings ---
    portfolioSettings: {
        showCertificates: { type: Boolean, default: true },
        showSkills: { type: Boolean, default: true },
        showProjects: { type: Boolean, default: true },
        aboutMe: { type: String, default: '' },
        sectionOrder: {
            type: [String], // Array of section names to control order
            default: ['certificates', 'skills', 'projects']
        }
    },
    // ----------------------------------------------------
    date: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    if (this.isModified('isPublicPortfolioEnabled') && this.isPublicPortfolioEnabled && !this.publicPortfolioId) {
        this.publicPortfolioId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    next();
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
