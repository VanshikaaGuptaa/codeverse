import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

// CREATE POST
export const createPost = async (req, res) => {
  try {
    const { text, tags = [] } = req.body;
    let { img = [], zip } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!text && img.length === 0 && !zip) {
      return res.status(400).json({ error: "Post must have text, image, or zip file" });
    }

    const uploadedImages = [];

    if (Array.isArray(img) && img.length > 0) {
      for (const image of img) {
        const uploaded = await cloudinary.uploader.upload(image);
        uploadedImages.push(uploaded.secure_url);
      }
    }

    if (zip) {
      const uploadedZip = await cloudinary.uploader.upload(zip, {
        resource_type: "raw",
      });
      zip = uploadedZip.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img: uploadedImages,
      zip,
      tags: tags.map((t) => t.trim().toLowerCase()),
    });

    await newPost.save();
    return res.status(201).json(newPost);
  } catch (error) {
    console.log("Error in createPost controller:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE POST
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "You are not authorized to delete this post" });
    }

    if (Array.isArray(post.img)) {
      for (const imgUrl of post.img) {
        const imgId = imgUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(imgId);
      }
    }

    if (post.zip) {
      const zipId = post.zip.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(zipId, { resource_type: "raw" });
    }

    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// COMMENT
export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = { user: userId, text };
    post.comments.push(comment);
    await post.save();

    return res.status(200).json(post);
  } catch (error) {
    console.log("Error in commentOnPost controller:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// LIKE / UNLIKE
export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updatedLikes = post.likes.filter(id => id.toString() !== userId.toString());
      return res.status(200).json(updatedLikes);
    } else {
      post.likes.push(userId);
      await post.save();

      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();

      return res.status(200).json(post.likes);
    }
  } catch (error) {
    console.log("Error in likeUnlikePost controller:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET ALL POSTS
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "-password")
      .populate("comments.user", "-password");

    return res.status(200).json(posts || []);
  } catch (error) {
    console.log("Error in getAllPosts controller:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET LIKED POSTS
export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate("user", "-password")
      .populate("comments.user", "-password");

    return res.status(200).json(likedPosts);
  } catch (error) {
    console.log("Error in getLikedPosts controller:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET FOLLOWING POSTS
export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const feedPosts = await Post.find({ user: { $in: user.following } })
      .sort({ createdAt: -1 })
      .populate("user", "-password")
      .populate("comments.user", "-password");

    return res.status(200).json(feedPosts);
  } catch (error) {
    console.log("Error in getFollowingPosts controller:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET POSTS OF SPECIFIC USER
export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("user", "-password")
      .populate("comments.user", "-password");

    return res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getUserPosts controller:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET RELEVANT POSTS
export const getRelevantPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const userTags = (user.tags || []).map((t) => t.toLowerCase());

    let posts = await Post.find()
      .populate("user", "-password")
      .populate("comments.user", "-password");

    posts = posts.map((post) => {
      const postTags = (post.tags || []).map((t) => t.toLowerCase());
      const matchCount = postTags.filter(tag => userTags.includes(tag)).length;

      return { ...post._doc, relevance: matchCount };
    });

    posts.sort((a, b) =>
      b.relevance === a.relevance
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : b.relevance - a.relevance
    );

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getRelevantPosts controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// SEARCH POSTS BY TAG
export const searchPostsByTag = async (req, res) => {
  try {
    const { tag } = req.query;

    if (!tag || tag.trim() === "") {
      return res.status(400).json({ error: "Search tag is required" });
    }

    const keywords = tag
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    if (keywords.length === 0) {
      return res.status(400).json({ error: "No valid tags provided" });
    }

    const posts = await Post.find({ tags: { $in: keywords } })
      .sort({ createdAt: -1 })
      .populate("user", "-password")
      .populate("comments.user", "-password");

    return res.status(200).json(posts);
  } catch (error) {
    console.error("Error in searchPostsByTag:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
