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

const updatePost = async(req, res) => {
   
}
export {
    createPost,
    getAllPosts,
    getSinglePost,
    getUserPosts,
    updatePost,
}