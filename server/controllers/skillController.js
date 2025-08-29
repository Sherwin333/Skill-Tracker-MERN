// server/controllers/skillController.js
const Skill = require('../models/Skill');

// @desc    Add a new skill
// @route   POST /api/skills
// @access  Private
exports.addSkill = async (req, res) => {
  const { name, category, level, description, isPublic } = req.body;

  try {
    if (!name || !String(name).trim()) {
      return res.status(400).json({ msg: 'Skill name is required.' });
    }

    const normalizedName = String(name).toLowerCase().trim();

    // Check if user already has a skill with the same (normalized) name
    const existingSkill = await Skill.findOne({ user: req.user.id, name: normalizedName });
    if (existingSkill) {
      return res.status(400).json({ msg: 'You already have a skill with this name.' });
    }

    const newSkill = new Skill({
      user: req.user.id,
      name: normalizedName,
      category,
      level,
      description,
      // Respect schema default if omitted
      ...(typeof isPublic === 'boolean' ? { isPublic } : {}),
    });

    await newSkill.save();
    return res.status(201).json(newSkill);
  } catch (err) {
    console.error('Error adding skill:', err);
    return res.status(500).send('Server Error');
  }
};

// @desc    Get all skills for a user
// @route   GET /api/skills
// @access  Private
exports.getUserSkills = async (req, res) => {
  try {
    const query = { user: req.user.id };

    // Optional filter: /api/skills?public=true or false
    if (typeof req.query.public !== 'undefined') {
      query.isPublic = String(req.query.public).toLowerCase() === 'true';
    }

    const skills = await Skill.find(query).sort({ dateAdded: -1 });
    return res.json(skills);
  } catch (err) {
    console.error('Error fetching skills:', err);
    return res.status(500).send('Server Error');
  }
};

// @desc    Get a single skill by ID
// @route   GET /api/skills/:id
// @access  Private
exports.getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ msg: 'Skill not found' });

    if (skill.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    return res.json(skill);
  } catch (err) {
    console.error('Error fetching single skill:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Skill not found' });
    }
    return res.status(500).send('Server Error');
  }
};

// @desc    Update a skill
// @route   PUT /api/skills/:id
// @access  Private
exports.updateSkill = async (req, res) => {
  const { name, category, level, description, isPublic } = req.body;

  const skillFields = {};
  if (name !== undefined) skillFields.name = String(name).toLowerCase().trim();
  if (category !== undefined) skillFields.category = category;
  if (level !== undefined) skillFields.level = level;
  if (description !== undefined) skillFields.description = description;
  if (isPublic !== undefined) skillFields.isPublic = !!isPublic;
  skillFields.lastUpdated = Date.now();

  try {
    let skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ msg: 'Skill not found' });

    if (skill.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // If name is being updated, check for per-user uniqueness
    if (skillFields.name && skillFields.name !== skill.name) {
      const dup = await Skill.findOne({ user: req.user.id, name: skillFields.name });
      if (dup && dup._id.toString() !== req.params.id) {
        return res.status(400).json({ msg: 'You already have another skill with this name.' });
      }
    }

    skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { $set: skillFields },
      { new: true }
    );

    return res.json(skill);
  } catch (err) {
    console.error('Error updating skill:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Skill not found' });
    }
    return res.status(500).send('Server Error');
  }
};

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Private
exports.deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ msg: 'Skill not found' });

    if (skill.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Skill.deleteOne({ _id: req.params.id });
    return res.json({ msg: 'Skill removed' });
  } catch (err) {
    console.error('Error deleting skill:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Skill not found' });
    }
    return res.status(500).send('Server Error');
  }
};
