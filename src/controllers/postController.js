import path from "path";
import fs from "fs";
import { Post } from "../models/postModel.js";
import { ApiError } from "../utils.js/ApiError.js";
import { ApiResponse } from "../utils.js/apiResponse.js";
import { deleteImageFromCloudinary, uploadOnCloudinary } from "../utils.js/cloudinary.js";
import mongoose from "mongoose";

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

        if (!postPicture) {
            throw new ApiError(401, "Post picture is not there")
        }

        const postPicCloud = await uploadOnCloudinary(postPicture)

        if (!postPicCloud) {
            throw new ApiError(401, "Problem in cloudinary uploade")
        }


        const newPost = await Post.create({
            author: userId,
            content,
            postPicture: postPicCloud.secure_url || null,
            postPicturePublicID: postPicCloud.public_id || null,
        })

        if (!newPost) {
            return res.status(400).json({ message: "Post not created" });
        }

        return res.status(201).json(
            new ApiResponse(
                201, newPost, "Post created succesfully"
            )
        )

    } catch (error) {
        next(error)
    }
}

const getAllPosts = async (req, res, next) => {

    try {
        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 10;

        if (!page || !limit) {
            return res.status(400).json({ message: "page and limit are required" });
        }
        if (page < 1 || limit < 1) {
            return res.status(400).json({ message: "page and limit should be greater than 0" });
        }

        let skip = (page - 1) * limit;

        const total = await Post.countDocuments(); // ✅ Await here

        const posts = await Post.find({})
            .skip(skip)
            .limit(limit)
            .populate("author", "name email profilePicture")
            .sort({ createdAt: -1 });

        if (!posts || posts.length === 0) {
            return res.status(404).json({ message: "No posts found" });
        }

        return res.status(200).json({
            totalPosts: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            postsPerPage: limit,
            posts,
        });
    } catch (error) {
        next(error);
    }


}
const getSinglePost = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await Post.findById(id)
            .populate("author", "userName email profilePicture")
            .populate({
                path: "comments.user",
                select: "userName profilePicture",
            })
            .populate({
                path: "likes",
                select: "_id userName profilePicture",
            });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        return res.status(200).json(
            new ApiResponse(200, post, "Post fetched successfully")
        );
    } catch (error) {
        return res.status(500).json(
            new ApiError(500, "Internal server error", error.message)
        );
    }
};


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

//editor and admin can update post which is set into the routes
const updatePost = async (req, res, next) => {
    try {
        const { id } = req.params
        const { content } = req.body
        const newImage = req.file ? req.file.path : null
        let updatedImgCloud = null;
        const post = await Post.findById(id);
        if (!post) {
            throw new ApiError(404, "Post not found")
        }
        if (newImage) {
            const deleteImageCloud = await deleteImageFromCloudinary(post.postPicturePublicID)
            if (!deleteImageCloud) {
                console.log("Cloudinary image did not deleted");
            }
            updatedImgCloud = await uploadOnCloudinary(newImage);

            if (!updatedImgCloud) {
                throw new ApiError(402, "Cloudinary has some problem")
            }
        }

        if (content) {
            post.content = content;
        }

        if (newImage) {
            post.postPicture = updatedImgCloud.secure_url;
            post.postPicturePublicID = updatedImgCloud.public_id
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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400, "Invalid post ID");
        }

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
        const commentedPost = await post.save();
        await commentedPost.populate("comments.user", "userName profilePicture");

        if (!commentedPost) {
            return res.status(201).json(new ApiResponse(
                402,
                "Comment add failed",
            ));
        }

        return res.status(201).json({
            success: true,
            comment: newComment, // or populate before returning
            totalComments: post.comments.length,
            updatedPost: commentedPost,
        });



    } catch (error) {
        next(error);
    }
};

const totalPostbyEachUser = async (req, res, next) => {
    const PostCount = await Post.aggregate([
        {
            $group: { _id: "$author", totalPosts: { $sum: 1 } }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "authorDetails",
            }
        },
        {
            $unwind: "$authorDetails"
        },
        {
            $project: {
                _id: 0,
                authorId: "$authorDetails._id",
                authorName: "$authorDetails.userName",
                totalPosts: 1,
            }
        }
    ])

    if (!PostCount) {
        return res.status(404).json({ message: "No posts found" });
    }
    return res.status(200).json(
        new ApiResponse(200, PostCount, "Post count by each user")
    )
}



export {
    createPost,
    getAllPosts,
    getSinglePost,
    getUserPosts,
    updatePost,
    deletePost,
    toggleLikePost,
    addComment,
    totalPostbyEachUser,
}