// server/routes/projectRoutes.js
const express = require('express');
const {
    addProject,
    getUserProjects,
    getProjectById,
    updateProject,
    deleteProject
} = require('../controllers/projectController');
const auth = require('../middleware/authMiddleware'); // Our custom auth middleware

const router = express.Router();

// Routes
router.post('/', auth, addProject);
router.get('/', auth, getUserProjects);
router.get('/:id', auth, getProjectById);
router.put('/:id', auth, updateProject);
router.delete('/:id', auth, deleteProject);

module.exports = router;