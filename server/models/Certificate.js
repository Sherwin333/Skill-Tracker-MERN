// server/models/Certificate.js
const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    issuer: {
        type: String,
        trim: true
    },
    issueDate: {
        type: Date
    },
    credentialId: {
        type: String,
        trim: true
    },
    credentialUrl: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    filePublicId: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Programming', 'Design', 'Project Management', 'Soft Skills', 'Other'],
        default: 'Other'
    },
    isPublic: { // NEW FIELD: Flag for public portfolio visibility
        type: Boolean,
        default: false // Default to false, user must explicitly make it public
    },
    dateAdded: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Certificate', CertificateSchema);
