import path from "path";
import fs from "fs";
import { Post } from "../models/postModel.js";
import { ApiError } from "../utils.js/ApiError.js";
import { ApiResponse } from "../utils.js/apiResponse.js";

const createPost = async (req, res) => {

    try {

        const { content } = req.body
        const userId = req.user._id
        const postPicture = req.file ? req.file.path : null


        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
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
                true,
                201,
                "Post created successfully",
                newPost
            )
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

        if (post.author.toString() !== userID.toString()) {
            throw new ApiError(403, "you are not authorized to edit this post")
        }


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


const deletePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userID = req.user._id;

        const postToBeDeleted = await Post.findById(id);

        if (!postToBeDeleted) {
            throw new ApiError(404, "Post not found");
        }

        if (postToBeDeleted.author.toString() !== userID.toString()) {
            throw new ApiError(403, "Not authorized to delete this post");
        }

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



export {
    createPost,
    getAllPosts,
    getSinglePost,
    getUserPosts,
    updatePost,
    deletePost
}