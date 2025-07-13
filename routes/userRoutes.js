const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post'); // ✅ Add this line
const upload = require('../middleware/upload');

// ✅ Get logged-in user's profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Update profile image and bio
router.put('/me', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const updateData = {
      bio: req.body.bio
    };

    if (req.file) {
      updateData.profileImage = '/uploads/' + req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ msg: "Failed to update profile" });
  }
});

// ✅ Get all posts by the current user
router.get('/me/posts', auth, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('userId', 'username')
      .populate('comments.userId', 'username'); // ✅ Add this line

    res.json(posts);
  } catch (err) {
    console.error("My Posts Error:", err);
    res.status(500).json({ msg: 'Server error fetching user posts' });
  }
});


module.exports = router;
