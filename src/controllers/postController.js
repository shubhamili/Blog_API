import path from "path";
import fs from "fs";
import { Post } from "../models/postModel.js";
import { ApiError } from "../utils.js/ApiError.js";
import { ApiResponse } from "../utils.js/apiResponse.js";

const createPost = async (req, res, next) => {

    try {

        const { content } = req.body
        const userId = req.user.id
        const postPicture = req.file ? req.file.path : null




        if (!userId) {
            return res.status(401).json({ message: "Unauthorized userId not getting" });
        }
        if (!content) {
            return res.status(400).json({ message: "content field is required" });
        }

        const newPost = await Post.create({
            author: userId,
            content,
            postPicture: postPicture || null,
        })

        if (!newPost) {
            return res.status(400).json({ message: "Post not created" });
        }

        return res.status(201).json(
            new ApiResponse(
                201,newPost,"Post created succesfully"
            )
        )

    } catch (error) {
        // return res.status(500).json(
        //     new ApiError(
        //         500,
        //         "Internal server error",
        //         error.message || "Something went wrong"
        //     )
        // )
        next(error)
    }
}

const getAllPosts = async (req, res) => {

    try {
        const posts = await Post.find({}).populate("author", "name email profilePicture").sort({ createdAt: -1 })

        if (!posts) {
            return res.status(404).json({ message: "No posts found" });
        }
        return res.status(200).json(
            new ApiResponse(200, posts, "Posts fetched successfully")
        )
    } catch (error) {
        return res.status(500).json(
            new ApiError(
                500,
                "Internal server error",
                error.message || "Something went wrong"
            )
        )

    }




}

const getSinglePost = async (req, res) => {
    try {
        const { id } = req.params
        const post = await Post.findById(id).populate("author", "name email profilePicture")
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        return res.status(200).json(
            new ApiResponse(200, post, "Post fetched successfully")
        )
    } catch (error) {
        return res.status(500).json(
            new ApiError(
                500,
                "Internal server error",
                error.message || "Something went wrong"
            )
        )

    }
}

const getUserPosts = async (req, res) => {
    try {
        const userId = req.user._id
        const posts = await Post.find({ author: userId }).populate("author", "name email profilePicture").sort({ createdAt: -1 })
        if (!posts) {
            return res.status(404).json({ message: "No posts found" });
        }
        return res.status(200).json(
            new ApiResponse(200, posts, "Posts fetched successfully")
        )
    } catch (error) {
        return res.status(500).json(
            new ApiError(
                500,
                "Internal server error",
                error.message || "Something went wrong"
            )
        )
    }
}

//user only can update his own post
const updatePost = async (req, res, next) => {
    try {

        const { id } = req.params
        const userID = req.user._id
        const { content } = req.body
        const newImage = req.file ? req.file.path : null

        const post = await Post.findById(id);

        if (!post) {
            throw new ApiError(404, "Post not found")
        }

        // if (post.author.toString() !== userID.toString()) {
        //     throw new ApiError(403, "you are not authorized to edit this post")
        // }


        // if (newImage && post.postPicture) {
        //     const oldImagePath = path.join("uploads", post.postPicture);
        //     if (fs.existsSync(oldImagePath)) {
        //         fs.unlinkSync(oldImagePath);
        //     }


        const oldImagePath = post.postPicture.startsWith("uploads")
            ? post.postPicture
            : path.join("uploads", post.postPicture);

        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            // console.log("Old image deleted:", oldImagePath);
        } else {
            console.log("Old image not found:", oldImagePath);
        }


        if (content) {
            post.content = content;
        }
        if (newImage) {
            post.postPicture = newImage
        }
        const updatedPost = await post.save()

        return res.status(202).json(new ApiResponse(202, updatedPost, "post Updated"))

    } catch (error) {
        next(error)
    }
}

//user only can delete his own post
const deletePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userID = req.user._id;

        const postToBeDeleted = await Post.findById(id);

        if (!postToBeDeleted) {
            throw new ApiError(404, "Post not found");
        }

        // if (postToBeDeleted.author.toString() !== userID.toString()) {
        //     throw new ApiError(403, "Not authorized to delete this post");
        // }

        const deletedPost = await Post.deleteOne({ _id: id });

        if (!deletedPost || deletedPost.deletedCount === 0) {
            throw new ApiError(500, "Failed to delete the post");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, "Deleted successfully", deletedPost));
    } catch (error) {
        next(error); // ✔ Pass to global error handler
    }
};


const toggleLikePost = async (req, res, next) => {
    try {

        const { id } = req.params
        const userId = req.user._id

        const post = await Post.findById(id)
        if (!post) {
            throw new ApiError(404, "Post not found")
        }

        const Liked = post.likes.includes(userId)
        if (Liked) {
            post.likes = post.likes.filter(SingleId => SingleId.toString() !== userId.toString())
        } else {
            post.likes.push(userId)
        }

        await post.save();

        return res.status(200).json(new ApiResponse(
            200,
            `${Liked ? "Unliked" : "Liked"} successfully`,
            { totalLikes: post.likes.length }
        ));


    } catch (error) {
        next(error)
    }
}

const addComment = async (req, res, next) => {
    try {
        const { id } = req.params; // postId
        const userId = req.user._id;
        const { comment } = req.body;

        if (!comment) {
            throw new ApiError(400, "Comment cannot be empty");
        }

        const post = await Post.findById(id);
        if (!post) {
            throw new ApiError(404, "Post not found");
        }

        const newComment = {
            user: userId,
            comment,
        };

        post.comments.push(newComment);
        await post.save();

        return res.status(201).json(new ApiResponse(
            201,
            "Comment added successfully",
            { totalComments: post.comments.length, comment: newComment }
        ));

    } catch (error) {
        next(error);
    }
};




export {
    createPost,
    getAllPosts,
    getSinglePost,
    getUserPosts,
    updatePost,
    deletePost,
    toggleLikePost,
    addComment,
}