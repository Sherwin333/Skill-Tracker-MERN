// server/controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({ name, email, password });
    await user.save();

    const payload = { user: { id: user.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const payload = { user: { id: user.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Update user profile details (name, email)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  const { name, email } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Ensure new email isn’t taken
    if (email && email !== user.email) {
      const existingUserWithEmail = await User.findOne({ email });
      if (
        existingUserWithEmail &&
        existingUserWithEmail._id.toString() !== user._id.toString()
      ) {
        return res.status(400).json({ msg: "Email is already taken by another user." });
      }
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      date: user.date,
    });
  } catch (err) {
    console.error("Error updating profile:", err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
exports.updateUserPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ msg: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();

    res.json({ msg: "Password updated successfully!" });
  } catch (err) {
    console.error("Error updating password:", err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Upload or update user avatar
// @route   PUT /api/auth/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ msg: "No avatar file uploaded" });
    }

    // Delete old avatar from Cloudinary if it exists
    if (user.avatarPublicId && user.avatarPublicId !== "skill-tracker/default-avatar") {
      try {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      } catch (delErr) {
        console.warn("Cloudinary delete old avatar warning:", delErr.message);
      }
    }

    // Upload new avatar using buffer
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `skill-tracker/${req.user.id}/avatars`,
          resource_type: "image",
          transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer); // critical fix ✅
    });

    user.avatarUrl = result.secure_url;
    user.avatarPublicId = result.public_id;
    await user.save();

    res.json({
      avatarUrl: user.avatarUrl,
      avatarPublicId: user.avatarPublicId,
      msg: "Avatar updated successfully!",
    });
  } catch (err) {
    console.error("Error uploading avatar:", err.message);
    res.status(500).send("Server Error during avatar upload");
  }
};

// @desc    Delete user avatar (revert to default)
// @route   DELETE /api/auth/avatar
// @access  Private
exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Delete current avatar from Cloudinary (skip default)
    if (user.avatarPublicId && user.avatarPublicId !== "skill-tracker/default-avatar") {
      try {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      } catch (delErr) {
        console.warn("Cloudinary delete avatar warning:", delErr.message);
      }
    }

    const DEFAULT_AVATAR_URL =
      process.env.DEFAULT_AVATAR_URL ||
      "https://res.cloudinary.com/dvf40q13y/image/upload/v1724858882/skill-tracker/default-avatar.png";
    const DEFAULT_AVATAR_PUBLIC_ID =
      process.env.DEFAULT_AVATAR_PUBLIC_ID || "skill-tracker/default-avatar";

    user.avatarUrl = DEFAULT_AVATAR_URL;
    user.avatarPublicId = DEFAULT_AVATAR_PUBLIC_ID;
    await user.save();

    res.json({ msg: "Avatar deleted successfully!", avatarUrl: user.avatarUrl });
  } catch (err) {
    console.error("Error deleting avatar:", err.message);
    res.status(500).send("Server Error during avatar deletion");
  }
};
