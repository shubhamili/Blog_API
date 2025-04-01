import { Post } from "../models/postModel.js";
import { ApiError } from "../utils.js/ApiError.js";
import { ApiResponse } from "../utils.js/apiResponse.js";

const createPost = async (req, res) => {
    try {

        const { content, postPicture } = req.body
        const { userId } = req.user.id
        console.log(userId);

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!content) {
            return res.status(400).json({ message: "content field is required" });
        }

        console.log("content",content);
        
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

export { createPost }