const Post = require('../models/Post');

// ✅ Create a new post
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newPost = new Post({
      userId: req.user.id,
      content,
      image: imagePath
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Create Post Error:", err);
    res.status(500).json({ msg: "Server error while creating post" });
  }
};

// ✅ Get all posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'username')
      .populate('comments.userId', 'username');

    res.json(posts);
  } catch (err) {
    console.error("Get Posts Error:", err);
    res.status(500).json({ msg: "Failed to get posts" });
  }
};

// ✅ Like/Unlike a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const userId = req.user.id;
    const index = post.likes.indexOf(userId);

    if (index === -1) {
      post.likes.push(userId); // like
    } else {
      post.likes.splice(index, 1); // unlike
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error("Like Error:", err);
    res.status(500).json({ msg: "Failed to like/unlike post" });
  }
};

// ✅ Comment on a post
exports.commentPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const newComment = {
      userId: req.user.id,
      text: req.body.text
    };

    post.comments.push(newComment);
    await post.save();
    res.json(post);
  } catch (err) {
    console.error("Comment Error:", err);
    res.status(500).json({ msg: "Failed to add comment" });
  }
};

// ✅ Delete your own comment
exports.deleteComment = async (req, res) => {
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

    post.comments.splice(index, 1); // Remove the comment
    await post.save();

    res.status(200).json({ msg: 'Comment deleted' });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ msg: 'Server error while deleting comment' });
  }
};
