const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Post = require('../models/Post');
const { createPost, getPosts } = require('../controllers/postController');

// Create a post (with image)
router.post('/posts', auth, upload.single('image'), createPost);

// Get all posts
router.get('/posts', getPosts);

// Toggle Like
router.put('/posts/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    const userId = req.user.id;
    const index = post.likes.indexOf(userId);

    if (index === -1) {
      post.likes.push(userId); // Like
    } else {
      post.likes.splice(index, 1); // Unlike
    }

    await post.save();
    res.json({ msg: 'Like toggled', likes: post.likes.length });
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add Comment
router.put('/posts/:id/comment', auth, async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ msg: 'Empty comment' });

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    post.comments.push({ userId: req.user.id, text });
    await post.save();
    res.status(200).json({ msg: 'Comment added' });
  } catch (err) {
    console.error('Comment error:', err);
    res.status(500).json({ msg: 'Server error while commenting' });
  }
});

// Delete your own comment
router.put('/posts/:id/comment/delete', auth, async (req, res) => {
  const { index } = req.body;
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    const post = await Post.findById(postId).populate('comments.userId');

    if (!post || index >= post.comments.length) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    const comment = post.comments[index];
    if (comment.userId._id.toString() !== userId) {
      return res.status(403).json({ msg: 'Unauthorized to delete this comment' });
    }

    post.comments.splice(index, 1);
    await post.save();

    res.status(200).json({ msg: 'Comment deleted' });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ msg: 'Server error while deleting comment' });
  }
});

// ✅ Edit your own post
router.put('/posts/:id/edit', auth, async (req, res) => {
  const { content } = req.body;

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized to edit this post' });
    }

    post.content = content;
    await post.save();

    res.status(200).json({ msg: 'Post updated' });
  } catch (err) {
    console.error('Edit post error:', err);
    res.status(500).json({ msg: 'Server error while editing post' });
  }
});

// ✅ Delete your own post
router.delete('/posts/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized to delete this post' });
    }

    await post.deleteOne();
    res.status(200).json({ msg: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ msg: 'Server error while deleting post' });
  }
});

module.exports = router;
