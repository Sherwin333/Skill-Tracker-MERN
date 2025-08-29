// server/controllers/publicPortfolioController.js
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const Skill = require('../models/Skill');
const Project = require('../models/Project');

// @desc    Get public portfolio data by publicPortfolioId
// @route   GET /api/public-portfolio/:publicPortfolioId
// @access  Public (no authentication required)
exports.getPublicPortfolio = async (req, res) => {
    try {
        const { publicPortfolioId } = req.params;

        // 1. Find the user by publicPortfolioId
        const user = await User.findOne({ publicPortfolioId, isPublicPortfolioEnabled: true }).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'Public portfolio not found or not enabled.' });
        }

        // 2. Fetch all associated data for this user, FILTERING BY isPublic: true and portfolioSettings
        const userId = user._id;
        const { portfolioSettings } = user; // Get portfolio settings

        let certificates = [];
        if (portfolioSettings.showCertificates) {
            certificates = await Certificate.find({ user: userId, isPublic: true }).sort({ issueDate: -1 });
        }

        let skills = [];
        if (portfolioSettings.showSkills) {
            skills = await Skill.find({ user: userId, isPublic: true }).sort({ lastUpdated: -1 });
        }

        let projects = [];
        if (portfolioSettings.showProjects) {
            projects = await Project.find({ user: userId, isPublic: true })
                .populate('associatedSkills', 'name category level')
                .sort({ endDate: -1, startDate: -1 });
        }

        res.json({
            user: {
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                portfolioTheme: user.portfolioTheme,
                portfolioSettings: user.portfolioSettings // Include advanced settings
            },
            certificates,
            skills,
            projects
        });

    } catch (err) {
        console.error('Error fetching public portfolio:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update user's public portfolio settings (enable/disable, theme, and advanced settings)
// @route   PUT /api/auth/public-portfolio-settings
// @access  Private (requires authentication)
exports.updatePublicPortfolioSettings = async (req, res) => {
    // Destructure all possible fields, including the new portfolioSettings object
    const { isPublicPortfolioEnabled, portfolioTheme, portfolioSettings } = req.body;

    try {
        let user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (isPublicPortfolioEnabled !== undefined) {
            user.isPublicPortfolioEnabled = isPublicPortfolioEnabled;
        }
        if (portfolioTheme !== undefined) {
            user.portfolioTheme = portfolioTheme;
        }
        // Update nested portfolioSettings
        if (portfolioSettings) {
            if (portfolioSettings.showCertificates !== undefined) user.portfolioSettings.showCertificates = portfolioSettings.showCertificates;
            if (portfolioSettings.showSkills !== undefined) user.portfolioSettings.showSkills = portfolioSettings.showSkills;
            if (portfolioSettings.showProjects !== undefined) user.portfolioSettings.showProjects = portfolioSettings.showProjects;
            if (portfolioSettings.aboutMe !== undefined) user.portfolioSettings.aboutMe = portfolioSettings.aboutMe;
            if (portfolioSettings.sectionOrder !== undefined) user.portfolioSettings.sectionOrder = portfolioSettings.sectionOrder;
        }

        await user.save();

        res.json({
            isPublicPortfolioEnabled: user.isPublicPortfolioEnabled,
            publicPortfolioId: user.publicPortfolioId,
            portfolioTheme: user.portfolioTheme,
            portfolioSettings: user.portfolioSettings, // Return updated advanced settings
            msg: 'Public portfolio settings updated successfully.'
        });

    } catch (err) {
        console.error('Error updating public portfolio settings:', err.message);
        res.status(500).send('Server Error');
    }
};
