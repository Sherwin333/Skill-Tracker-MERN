// server/models/Skill.js
const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        unique: false
    },
    category: {
        type: String,
        enum: [
            'Frontend Development',
            'Backend Development',
            'Fullstack Development',
            'Mobile Development',
            'Database Management',
            'DevOps',
            'Cloud Computing',
            'Data Science & AI',
            'Machine Learning',
            'Project Management',
            'UI/UX Design',
            'Graphic Design',
            'Testing & QA',
            'Soft Skills',
            'Languages',
            'Other'
        ],
        default: 'Other'
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Beginner'
    },
    description: {
        type: String,
        trim: true
    },
    isPublic: { // NEW FIELD: Flag for public portfolio visibility
        type: Boolean,
        default: false // Default to false
    },
    dateAdded: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

SkillSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Skill', SkillSchema);
