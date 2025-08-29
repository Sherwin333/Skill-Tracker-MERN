// server/routes/authRoutes.js
const express = require('express');
const multer = require('multer'); // For file uploads
const {
  registerUser,
  loginUser,
  getMe,
  updateUserProfile,
  updateUserPassword,
  uploadAvatar,   // New
  deleteAvatar    // New
} = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Multer: memory storage (gives you `req.file.buffer`)
 * NOTE: If your controller used `req.file.path`, switch to Cloudinary upload_stream
 * or change Multer to diskStorage.
 */
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('Only JPG, PNG, GIF, WEBP images are allowed!'), ok);
  }
});

// Public
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private
router.get('/me', auth, getMe);
router.put('/profile', auth, updateUserProfile);
router.put('/password', auth, updateUserPassword);

// Avatar (Private)
router.put('/avatar', auth, upload.single('avatar'), uploadAvatar); // field name: "avatar"
router.delete('/avatar', auth, deleteAvatar);

module.exports = router;
