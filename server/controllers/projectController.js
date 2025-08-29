// server/controllers/projectController.js
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Skill = require('../models/Skill');

// Helpers
const toTechArray = (technologies) => {
  if (technologies === undefined || technologies === null) return undefined;
  if (Array.isArray(technologies)) {
    return technologies.map(t => String(t).trim()).filter(Boolean);
  }
  if (typeof technologies === 'string') {
    if (!technologies.trim()) return [];
    return technologies.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
};

const ensureSkillsBelongToUser = async (skillIds, userId) => {
  if (!Array.isArray(skillIds) || skillIds.length === 0) return true;
  // validate ObjectId format early to avoid cast errors
  const validIds = skillIds.every(id => mongoose.isValidObjectId(id));
  if (!validIds) return false;

  const count = await Skill.countDocuments({ _id: { $in: skillIds }, user: userId });
  return count === skillIds.length;
};

// @desc    Add a new project
// @route   POST /api/projects
// @access  Private
exports.addProject = async (req, res) => {
  const {
    title,
    description,
    technologies,
    startDate,
    endDate,
    projectUrl,
    githubUrl,
    associatedSkills,
    isPublic, // NEW
  } = req.body;

  try {
    // Validate associatedSkills (must belong to user)
    if (associatedSkills && !(await ensureSkillsBelongToUser(associatedSkills, req.user.id))) {
      return res.status(400).json({ msg: 'One or more associated skills are invalid or do not belong to the user.' });
    }

    const newProject = new Project({
      user: req.user.id,
      title,
      description,
      technologies: toTechArray(technologies) ?? [],
      startDate,
      endDate,
      projectUrl,
      githubUrl,
      associatedSkills: Array.isArray(associatedSkills) ? associatedSkills : [],
      isPublic: typeof isPublic === 'boolean' ? isPublic : undefined, // respect schema default if undefined
    });

    const project = await newProject
      .save()
      .then(doc => doc.populate('associatedSkills', 'name category level'));

    return res.status(201).json(project);
  } catch (err) {
    console.error('Error adding project:', err);
    return res.status(500).send('Server Error');
  }
};

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
exports.getUserProjects = async (req, res) => {
  try {
    // Optional filter: /api/projects?public=true
    const query = { user: req.user.id };
    if (typeof req.query.public !== 'undefined') {
      query.isPublic = String(req.query.public).toLowerCase() === 'true';
    }

    const projects = await Project.find(query)
      .populate('associatedSkills', 'name category level')
      .sort({ dateAdded: -1 });

    return res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    return res.status(500).send('Server Error');
  }
};

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('associatedSkills', 'name category level');

    if (!project) return res.status(404).json({ msg: 'Project not found' });

    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    return res.json(project);
  } catch (err) {
    console.error('Error fetching single project:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    return res.status(500).send('Server Error');
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  const {
    title,
    description,
    technologies,
    startDate,
    endDate,
    projectUrl,
    githubUrl,
    associatedSkills,
    isPublic, // NEW
  } = req.body;

  const projectFields = {};
  if (title !== undefined) projectFields.title = title;
  if (description !== undefined) projectFields.description = description;

  if (technologies !== undefined) {
    projectFields.technologies = toTechArray(technologies);
  }
  if (startDate !== undefined) projectFields.startDate = startDate;
  if (endDate !== undefined) projectFields.endDate = endDate;
  if (projectUrl !== undefined) projectFields.projectUrl = projectUrl;
  if (githubUrl !== undefined) projectFields.githubUrl = githubUrl;
  if (isPublic !== undefined) projectFields.isPublic = !!isPublic;
  projectFields.lastUpdated = Date.now();

  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Ensure user owns project
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Validate associatedSkills if present
    if (associatedSkills !== undefined) {
      if (!(await ensureSkillsBelongToUser(associatedSkills, req.user.id))) {
        return res.status(400).json({ msg: 'One or more associated skills are invalid or do not belong to the user.' });
      }
      projectFields.associatedSkills = associatedSkills;
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: projectFields },
      { new: true }
    ).populate('associatedSkills', 'name category level');

    return res.json(project);
  } catch (err) {
    console.error('Error updating project:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    return res.status(500).send('Server Error');
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Project.deleteOne({ _id: req.params.id });
    return res.json({ msg: 'Project removed' });
  } catch (err) {
    console.error('Error deleting project:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    return res.status(500).send('Server Error');
  }
};
