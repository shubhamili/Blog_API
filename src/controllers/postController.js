import path from "path";
import fs from "fs";
import { Post } from "../models/postModel.js";
import { deleteImageFromCloudinary, uploadOnCloudinary } from "../utils.js/cloudinary.js";
import mongoose from "mongoose";

// const createPost = async (req, res, next) => {
//     try {
//         const { content } = req.body
//         const userId = req.user.id
//         const postPicture = req.file.path

//         if (!userId) {
//             return res.status(401).json({ message: "Unauthorized" });
//         }
//         if (!content) {
//             return res.status(400).json({ message: "content field is required" });
//         }
//         let postPicCloud = null;
//         console.log("Post picture path:", postPicture);

//         if (postPicture && postPicture !== "null") {
//             try {
//                 postPicCloud = await uploadOnCloudinary(postPicture);
//             } catch (err) {
//                 return res.status(500).json({
//                     success: false,
//                     message: "Error uploading image",
//                     error: err.message || "Cloudinary upload failed",
//                 });
//             }
//         }
//         console.log("Post picture uploaded to Cloudinary:", postPicCloud);


//         const newPost = await Post.create({
//             author: userId,
//             content,
//             postPicture: postPicCloud.secure_url || null,
//             postPicturePublicID: postPicCloud.public_id || null,
//         })

//         if (!newPost) {
//             return res.status(400).json({ message: "failed to create post!" });
//         }

//         return res.status(201).json(
//             {
//                 success: true,
//                 message: "Post created successfully",
//                 data: newPost,
//             }
//         )

//     } catch (error) {
//         next(error)
//     }
// }

const createPost = async (req, res, next) => {
    try {
        const { content } = req.body;
        const userId = req.user?.id;
        const postPicture = req.file?.path || null;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!content) {
            return res.status(400).json({ success: false, message: "Content is required" });
        }

        let postPicCloud = null;

        if (postPicture) {
            try {
                postPicCloud = await uploadOnCloudinary(postPicture);
                if (!postPicCloud) {
                    return res.status(500).json({
                        success: false,
                        message: "Cloudinary upload failed",
                    });
                }
            } catch (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error uploading to Cloudinary",
                    error: err.message,
                });
            }
        }

        const newPost = await Post.create({
            author: userId,
            content,
            postPicture: postPicCloud?.secure_url || null,
            postPicturePublicID: postPicCloud?.public_id || null,
        });

        if (!newPost) {
            return res.status(400).json({
                success: false,
                message: "Failed to create post",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: newPost,
        });

    } catch (error) {
        next(error);
    }
};


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
        const total = await Post.countDocuments();
        const posts = await Post.find({})
            .skip(skip)
            .limit(limit)
            .populate("author", "userName email profilePicture")
            .sort({ createdAt: -1 });

        if (!posts || posts.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No posts found",
                data: null,
                error: "NoPostsFoundError",
            });
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


        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        return res.status(200).json(
            {
                success: true,
                message: "Post fetched successfully",
                data: post,
            }
        );
    } catch (error) {
        return res.status(500).json(
            {
                success: false,
                message: "Internal server error",
                error: error.message || "Something went wrong"
            }
        );
    }
};


const getUserPosts = async (req, res) => {
    try {
        const userId = req.user.id
        const posts = await Post.find({ author: userId }).populate("author", "userName email profilePicture").sort({ createdAt: -1 })
        console.log("User posts fetched successfully", userId, posts);

        if (!posts) {
            return res.status(404).json({ message: "No posts found" });
        }
        return res.status(200).json(
            {
                success: true,
                message: "User posts fetched successfully",
                data: posts,
            }
        )
    } catch (error) {
        return res.status(500).json(
            {
                success: false,
                message: "Internal server error",
                error: error.message || "Something went wrong"
            }
        )
    }
}

// //editor and admin can update post which is set into the routes
// const updatePost = async (req, res, next) => {
//     try {
//         const { id } = req.params
//         const { content } = req.body
//         const userId = req.user.id
//         let postPicture = req.file.path || null;

//         const post = await Post.findById(id);
//         if (!post) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Post not found",
//                 data: null,
//                 error: "PostNotFoundError",
//             });
//         }
//         if (userId.toString() !== post.author._id.toString()) {
//             return res.status(403).json({
//                 success: false,
//                 message: "You are not authorized to update this post",
//                 data: null,
//             });
//         }

//         const updateDoc = {};
//         if (content) { updateDoc.content = content } else { updateDoc.content = post.content };
//         if (postPicture && postPicture !== "null") {
//             updatedImgCloud = await uploadOnCloudinary(postPicture);
//             if (!updatedImgCloud) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Error uploading to Cloudinary or file not provided",
//                     data: null,
//                     error: "CloudinaryError",
//                 });
//             }
//             updateDoc.postPicture = updatedImgCloud.secure_url;
//             updateDoc.postPicturePublicID = updatedImgCloud.public_id;
//         } else {
//             updateDoc.postPicture = null;
//             updateDoc.postPicturePublicID = null;
//             const deleteImageCloud = await deleteImageFromCloudinary(post.postPicturePublicID)
//             if (!deleteImageCloud) {
//                 console.log("Cloudinary image delete failed!!");
//             }
//         }
//         console.log("Update document:", updateDoc);
//         Object.assign(post, updateDoc); // Update the post with new content and image
//         // If the post has an image, delete the old one from Cloudinary


//         const updatedPost = await post.save()

//         return res.status(202).json(
//             {
//                 success: true,
//                 message: "Post updated successfully",
//                 data: updatedPost,
//             }
//         )

//     } catch (error) {
//         next(error)
//     }
// }



const updatePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        // Check if image was uploaded
        const postPicture = req.file?.path || null;
        console.log("Post picture path:", postPicture);

        // Fetch post from DB
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
                data: null,
                error: "PostNotFoundError",
            });
        }

        // Check if user is authorized to update
        if (userId.toString() !== post.author._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this post",
                data: null,
            });
        }

        // Prepare updated fields
        const updateDoc = {};
        updateDoc.content = content || post.content;

        // If a new image was uploaded
        if (postPicture && postPicture !== "null") {
            console.log("Uploading new image to Cloudinary:", postPicture);

            const updatedImgCloud = await uploadOnCloudinary(postPicture);
            if (!updatedImgCloud) {
                return res.status(400).json({
                    success: false,
                    message: "Error uploading image to Cloudinary",
                    data: null,
                    error: "CloudinaryError",
                });
            }

            updateDoc.postPicture = updatedImgCloud.secure_url;
            updateDoc.postPicturePublicID = updatedImgCloud.public_id;

            // Delete old image if present
            if (post.postPicturePublicID) {
                await deleteImageFromCloudinary(post.postPicturePublicID);
            }
        }

        // If user removed image explicitly (frontend sends "null" string)
        else if (postPicture === null) {
            console.log("Removing post picture");
            updateDoc.postPicture = null;
            updateDoc.postPicturePublicID = null;

            if (post.postPicturePublicID) {
                // Delete the old image from Cloudinary
                console.log("Deleting old image from Cloudinary:", post.postPicturePublicID);
                const deleted = await deleteImageFromCloudinary(post.postPicturePublicID);
                if (!deleted) {
                    console.warn("Cloudinary image delete failed!");
                }
            }
        }
        // Apply updates to post
        Object.assign(post, updateDoc);
        const updatedPost = await post.save();
        console.log("Post updated successfully:", updatedPost);


        return res.status(202).json({
            success: true,
            message: "Post updated successfully",
            data: updatedPost,
        });

    } catch (error) {
        next(error); // Let Express error handler take care
    }
};





//user only can delete his own post
const deletePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userID = req.user.id;

        const postToBeDeleted = await Post.findById(id);

        if (!postToBeDeleted) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
                data: null,
                error: "PostNotFoundError",
            });
        }

        if (postToBeDeleted.author.toString() !== userID.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this post",
                data: null,
                error: "UnauthorizedError",
            });
        }

        const deletedPost = await Post.deleteOne({ _id: id });

        if (!deletedPost || deletedPost.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Post not found or already deleted",
                data: null,
                error: "PostDeletionError",
            });
        }

        // If the post has an image, delete it from Cloudinary
        if (postToBeDeleted.postPicturePublicID) {
            const deleteImageCloud = await deleteImageFromCloudinary(postToBeDeleted.postPicturePublicID);
            if (!deleteImageCloud) {
                console.log("Cloudinary image did not deleted");
            }
        }
        return res.status(200).json(
            {
                success: true,
                message: "Post deleted successfully",
                data: deletedPost,
            }
        );

    } catch (error) {
        next(error); // ✔ Pass to global error handler
    }
};


const toggleLikePost = async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.user.id

        const post = await Post.findById(id)
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
                data: null,
                error: "PostNotFoundError",
            });
        }

        const Liked = post.likes.includes(userId)
        if (Liked) {
            post.likes = post.likes.filter(SingleId => SingleId?.toString() !== userId?.toString())
        } else {
            post.likes.push(userId)
        }
        await post.save();
        return res.status(200).json({
            success: true,
            message: Liked ? "Post unliked successfully" : "Post liked successfully",
            totalLikes: post.likes.length,
            updatedPost: post,
        });
    } catch (error) {
        next(error)
    }
}

const addComment = async (req, res, next) => {
    try {
        const { id } = req.params; // postId
        const userId = req.user.id;
        const { comment } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post ID",
                data: null,
                error: "InvalidPostIdError",
            });
        }

        if (!comment) {
            return res.status(400).json({
                success: false,
                message: "Comment cannot be empty",
                data: null,
                error: "EmptyCommentError",
            });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
                data: null,
                error: "PostNotFoundError",
            });
        }

        const newComment = {
            user: userId,
            comment,
        };

        post.comments.push(newComment);
        const commentedPost = await post.save();
        const commentDoc = await commentedPost.populate("comments.user", "userName profilePicture email");

        if (!commentedPost) {
            return res.status(201).json(
                {
                    success: false,
                    message: "Failed to add comment",
                    data: null,
                    error: "CommentError",
                }
            );
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
        {
            success: true,
            message: "Total posts by each user fetched successfully",
            data: PostCount,
        })
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