// server/routes/skillRoutes.js
const express = require('express');
const {
    addSkill,
    getUserSkills,
    getSkillById,
    updateSkill,
    deleteSkill
} = require('../controllers/skillController');
const auth = require('../middleware/authMiddleware'); // Our custom auth middleware

const router = express.Router();

// Routes
router.post('/', auth, addSkill);
router.get('/', auth, getUserSkills);
router.get('/:id', auth, getSkillById);
router.put('/:id', auth, updateSkill);
router.delete('/:id', auth, deleteSkill);

module.exports = router;