import Post from "../models/Post.js";
import User from "../models/User.js";

/* CREATE */
export const createPost = async (req, res) => {
  try {
      const { userId, description, picturePath, faces, tags } = req.body;

      const user = await User.findById(userId);

      const newPost = new Post({
          userId,
          firstName: user.firstName,
          lastName: user.lastName,
          location: user.location,
          description,
          userPicturePath: user.picturePath,
          picturePath,
          faces: JSON.parse(faces || "[]"), // Parse faces if provided
          tags: JSON.parse(tags || "[]"),   // Parse tags if provided
          likes: {},
          comments: [],
      });

      await newPost.save();

      // Return all posts to the client
      const post = await Post.find();
      res.status(201).json(post);
  } catch (err) {
      res.status(409).json({ message: err.message });
  }
};



/* READ */
// export const getFeedPosts = async (req, res) => {
//   try {
//     const post = await Post.find();
//     res.status(200).json(post);
//     console.log(post)
//   } catch (err) {
//     res.status(404).json({ message: err.message });
//   }
// };
// controllers/posts.js
export const getFeedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 }) // most recent first
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    res.status(200).json({ posts, total });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getPost = async (req, res) => {
  const { postId } = req.params; // Destructure postId from req.params
  try {
    const post = await Post.findById(postId); // Use postId directly
    if (!post) {
      return res.status(404).json({ message: "Post not found" }); // Handle case where no post is found
    }
    res.status(200).json(post);
    console.log(post);
  } catch (err) {
    res.status(500).json({ message: err.message }); // Changed status code to 500 for server errors
  }
};



// export const getUserPosts = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const post = await Post.find({ userId });
//     res.status(200).json(post);
//   } catch (err) {
//     res.status(404).json({ message: err.message });
//   }
// };
// controllers/posts.js
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ userId });

    res.status(200).json({ posts, total });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* LIKE*/
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* ADD COMMENT */
export const addComment = async (req, res) => {
  try {
    const { id } = req.params; // Post ID
    const { userId, text, userPic } = req.body; // User ID and comment text

    // Construct the new comment
    const newComment = {
      userId,
      text,
      userPic,
      createdAt: new Date(),
    };

    // Find the post and update the comments array
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $push: { comments: newComment } },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params; // Post ID from request parameters

    // Find the post by ID
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Delete the post
    await Post.findByIdAndDelete(id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addTagsToPost = async (req, res) => {
  const { postId } = req.params;
  const { tags } = req.body; // Array of { userId, name }

  try {
      const post = await Post.findById(postId);

      if (!post) {
          return res.status(404).json({ message: "Post not found" });
      }

      // Add new tags without duplication
      tags.forEach(tag => {
          if (!post.tags.some(existingTag => existingTag.userId === tag.userId)) {
              post.tags.push(tag);
          }
      });

      await post.save();
      res.status(200).json(post.tags);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

export const removeTagsFromPost = async (req, res) => {
  const { postId } = req.params;
  const { userIds } = req.body; // Array of user IDs to remove

  try {
      const post = await Post.findById(postId);

      if (!post) {
          return res.status(404).json({ message: "Post not found" });
      }

      post.tags = post.tags.filter(tag => !userIds.includes(tag.userId));

      await post.save();
      res.status(200).json(post.tags);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

export const markPostAsSeen = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
      const post = await Post.findById(postId);

      if (!post) {
          return res.status(404).json({ message: "Post not found" });
      }

      // Add to seenBy if not already present
      if (!post.seenBy.some(viewer => viewer.userId === userId)) {
          post.seenBy.push({ userId });
      }

      await post.save();
      res.status(200).json(post.seenBy);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

export const getTagsForPost = async (req, res) => {
  const { postId } = req.params;

  try {
      const post = await Post.findById(postId);

      if (!post) {
          return res.status(404).json({ message: "Post not found" });
      }

      res.status(200).json(post.tags);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

export const getSeenByForPost = async (req, res) => {
  const { postId } = req.params;

  try {
      const post = await Post.findById(postId);

      if (!post) {
          return res.status(404).json({ message: "Post not found" });
      }

      res.status(200).json(post.seenBy);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};
