// server/routes/certificateRoutes.js
const express = require('express');
const multer = require('multer'); // For handling file uploads
const {
    uploadCertificate,
    getUserCertificates,
    getCertificateById,
    updateCertificate,
    deleteCertificate
} = require('../controllers/certificateController');
const auth = require('../middleware/authMiddleware'); // Our custom auth middleware

const router = express.Router();

// Set up Multer for file uploads (memory storage for Cloudinary)
const storage = multer.memoryStorage(); // Store file in memory as buffer
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Accept images and PDFs only
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, PNG, and PDF files are allowed!'), false);
        }
    }
});

// Routes
router.post('/', auth, upload.single('certificateFile'), uploadCertificate); // 'certificateFile' is the field name from the form
router.get('/', auth, getUserCertificates);
router.get('/:id', auth, getCertificateById);
router.put('/:id', auth, updateCertificate);
router.delete('/:id', auth, deleteCertificate);

module.exports = router;