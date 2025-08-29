// server/controllers/certificateController.js
const cloudinary = require('cloudinary').v2;
const Certificate = require('../models/Certificate');

// @desc    Upload a certificate
// @route   POST /api/certificates
// @access  Private
exports.uploadCertificate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `skill-tracker/${req.user.id}/certificates`,
      resource_type: 'auto',
    });

    // Accept isPublic on create (respect schema default if omitted)
    const {
      title,
      issuer,
      issueDate,
      credentialId,
      credentialUrl,
      description,
      category,
      isPublic,
    } = req.body;

    const newCertificate = new Certificate({
      user: req.user.id,
      title,
      issuer,
      issueDate,
      credentialId,
      credentialUrl,
      description,
      fileUrl: result.secure_url,
      filePublicId: result.public_id,
      category: category || 'Other',
      ...(typeof isPublic === 'boolean' ? { isPublic } : {}), // only set if provided
    });

    await newCertificate.save();
    return res.status(201).json(newCertificate);
  } catch (err) {
    console.error('Error uploading certificate:', err);
    return res.status(500).send('Server Error during certificate upload');
  }
};

// @desc    Get all certificates for a user
// @route   GET /api/certificates
// @access  Private
exports.getUserCertificates = async (req, res) => {
  try {
    const query = { user: req.user.id };
    // Optional filter: /api/certificates?public=true|false
    if (typeof req.query.public !== 'undefined') {
      query.isPublic = String(req.query.public).toLowerCase() === 'true';
    }

    const certificates = await Certificate.find(query).sort({ dateAdded: -1 });
    return res.json(certificates);
  } catch (err) {
    console.error('Error fetching certificates:', err);
    return res.status(500).send('Server Error');
  }
};

// @desc    Get a single certificate by ID
// @route   GET /api/certificates/:id
// @access  Private
exports.getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ msg: 'Certificate not found' });

    if (certificate.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    return res.json(certificate);
  } catch (err) {
    console.error('Error fetching single certificate:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Certificate not found' });
    }
    return res.status(500).send('Server Error');
  }
};

// @desc    Update a certificate
// @route   PUT /api/certificates/:id
// @access  Private
exports.updateCertificate = async (req, res) => {
  const {
    title,
    issuer,
    issueDate,
    credentialId,
    credentialUrl,
    description,
    category,
    isPublic, // NEW
  } = req.body;

  const certificateFields = {};
  if (title !== undefined) certificateFields.title = title;
  if (issuer !== undefined) certificateFields.issuer = issuer;
  if (issueDate !== undefined) certificateFields.issueDate = issueDate;
  if (credentialId !== undefined) certificateFields.credentialId = credentialId;
  if (credentialUrl !== undefined) certificateFields.credentialUrl = credentialUrl;
  if (description !== undefined) certificateFields.description = description;
  if (category !== undefined) certificateFields.category = category;
  if (isPublic !== undefined) certificateFields.isPublic = !!isPublic;
  certificateFields.lastUpdated = Date.now();

  try {
    let certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ msg: 'Certificate not found' });

    if (certificate.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      { $set: certificateFields },
      { new: true }
    );

    return res.json(certificate);
  } catch (err) {
    console.error('Error updating certificate:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Certificate not found' });
    }
    return res.status(500).send('Server Error');
  }
};

// @desc    Delete a certificate
// @route   DELETE /api/certificates/:id
// @access  Private
exports.deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ msg: 'Certificate not found' });

    if (certificate.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Try to delete file from Cloudinary first (non-fatal if it fails)
    if (certificate.filePublicId) {
      try {
        await cloudinary.uploader.destroy(certificate.filePublicId);
      } catch (cloudErr) {
        console.warn('Cloudinary delete warning:', cloudErr?.message || cloudErr);
      }
    }

    await Certificate.deleteOne({ _id: req.params.id });
    return res.json({ msg: 'Certificate removed' });
  } catch (err) {
    console.error('Error deleting certificate:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Certificate not found' });
    }
    return res.status(500).send('Server Error');
  }
};
