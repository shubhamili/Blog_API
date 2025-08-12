import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { deleteImageFromCloudinary, uploadOnCloudinary } from "../utils.js/cloudinary.js";
import { generateAccessToken, generateRefreshToken } from "../utils.js/jwt.js";
import sanitizeHtml from "sanitize-html";
import Follow from "../models/followModel.js";
import sendEmail from "../utils.js/emailHelper.js";
import { Post } from "../models/postModel.js";
import { createNotificationSerice } from "../utils.js/notificationService.js";


const registerUser = async (req, res) => {
    try {
        const { userName, email, password, bio } = req.body;
        const profilePicture = req.file ? req.file.path : null

        if ([userName, email, , password].some((field) => field?.trim() === "")) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
                data: null,
                error: "ValidationError",
            });
        }

        const useExistsAlready = await User.findOne({ $or: [{ userName }, { email }] })
        if (useExistsAlready) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this username or email",
                data: null,
                error: "UserExistsError",
            });
        }
        let uploadedImageUrl = "";
        if (profilePicture) {
            cloudinaryUpload = await uploadOnCloudinary(profilePicture);
            if (cloudinaryUpload) {
                // If the upload is successful, you can access the URL and other details from the response
                uploadedImageUrl = cloudinaryUpload.secure_url; // Use the secure URL for HTTPS

                return res.status(200).json({
                    success: true,
                    message: "file uploaded to Cloudinary",
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Error uploading to Cloudinary or file not provided",
                    data: null,
                    error: "CloudinaryError",
                });
            }
        }


        const user = await User.create({
            userName,
            password,
            email,
            profilePicture: uploadedImageUrl,
            bio,

        })



        const createdUser = await User.findById(user._id).select("-password")


        if (createdUser) {
            const html = `
                        <h1>Welcome to Pustakalay, ${userName}!</h1>
                        <p>We’re excited to have you join our community.</p>
                        <p>Start exploring, following other users, and sharing your own content!</p>
                        `;

            await sendEmail(user.email, 'Welcome to Pustakalay!', html);
        }


        if (!createdUser) {
            return res.status(400).json({
                success: false,
                message: "User not created",
                data: null,
                error: "UserCreationError",
            });
        }

        //jwt token
        const refreshToken = generateRefreshToken(createdUser)
        const accessToken = generateAccessToken(createdUser)
        if (!refreshToken || !accessToken) {
            return res.status(400).json({
                success: false,
                message: "Token not generated",
                data: null,
            });
        }
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            message: "user registered successful",
            user: {
                id: user._id,
                username: user.userName,
                email: user.email,
                profilePicture: createdUser.profilePicture,
                accessToken: accessToken
            },
        });

    } catch (error) {
        console.error("error in controller", error)
    }

};

const LoginUser = async (req, res) => {
    const { userName, password } = req.body;

    if ([userName, password].some((field) => field?.trim() === "")) {
        return res.status(400).json({
            success: false,
            msg: "All fields are required",
            data: null,
            error: "ValidationError",
        });
    }
    const user = await User.findOne({ userName });

    if (!user) {
        return res.status(400).json({
            success: false,
            msg: "error in finding user bro"
        })
    }

    const passwordVarified = await user.isPasswordCorrect(password)
    console.log("passwordVarified", passwordVarified);

    if (!passwordVarified) {
        return res.status(400).json({
            success: false,
            msg: "Invalid credentials",
            data: null,
            error: "AuthenticationError",
        });
    }

    const loggedInUser = await User.findById(user._id).select("-password")

    if (!loggedInUser) {
        return res.status(400).json({
            success: false,
            message: "User not found",
            data: null,
            error: "UserNotFoundError",
        });
    }
    //authentication token
    const refreshToken = generateRefreshToken(loggedInUser)
    const accessToken = generateAccessToken(loggedInUser)
    if (!refreshToken || !accessToken) {
        return res.status(400).json({
            success: false,
            message: "Token not generated",
            data: null,
        });
    }


    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
            id: user._id,
            userName: user.userName,
            email: user.email,
            profilePicture: loggedInUser.profilePicture,
            accessToken: accessToken
        }
    });


};

const logoutUser = async (req, res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });
    return res.sendStatus(204);
};

const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "No refresh token provided",
            });
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: "Invalid or expired refresh token",
                });
            }

            const foundUser = await User.findById(decoded.id).select("-password");

            if (!foundUser) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            const newAccessToken = generateAccessToken(foundUser);

            if (!newAccessToken) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to generate new access token",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Access token refreshed successfully",
                accessToken: newAccessToken,
                user: {
                    id: foundUser._id,
                    userName: foundUser.userName,
                    email: foundUser.email,
                    profilePicture: foundUser.profilePicture,
                },
            });
        });
    } catch (err) {
        console.error("Refresh error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const getUserProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const { id, userName, email } = req.user;

        const userNew = await User.findById(id);

        if (!userNew) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const profilePicture = userNew.profilePicture || "";

        return res.status(200).json({
            success: true,
            message: "User profile retrieved successfully",
            user: userNew
        });
    } catch (error) {
        next(error);
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { userName, email, bio, location, website } = req.body;
        const profilePicture = req.file?.path || '';
        const userId = req.user.id;

        console.log("profilePicture", req.file?.path);


        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
                data: null,
                error: "UnauthorizedError",
            });
        }

        if ([userName, email].some((field) => field?.trim() === "")) {
            return res.status(400).json({
                success: false,
                message: "Username and email are required",
                data: null,
                error: "ValidationError",
            });
        }

        const existingUser = await User.findOne({ _id: { $ne: userId }, $or: [{ userName }, { email }] });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Username or email not available",
                data: null,
                error: "UserExistsError",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null,
                error: "UserNotFoundError",
            });
        }
        user.userName = userName;
        user.email = email;
        user.bio = sanitizeHtml(bio);
        user.location = sanitizeHtml(location);
        user.website = sanitizeHtml(website);

        console.log(user.bio, user.location, user.website);

        if (profilePicture !== '') {
            // Delete old image
            if (user.profilePicturePublicID) {
                await deleteImageFromCloudinary(user.profilePicturePublicID);
            }

            const cloudinaryUpload = await uploadOnCloudinary(profilePicture);
            if (cloudinaryUpload) {
                user.profilePicture = cloudinaryUpload.secure_url;
                user.profilePicturePublicID = cloudinaryUpload.public_id;
            }
        }
        else if (req.body.removeProfilePicture === "true") {
            if (user?.profilePicture && user?.profilePicturePublicID) {
                const deleteImage = await deleteImageFromCloudinary(user.profilePicturePublicID);
                if (!deleteImage) {
                    return res.status(400).json({
                        success: false,
                        message: "Error deleting image from Cloudinary",
                        data: null,
                        error: "CloudinaryError",
                    });
                }
                user.profilePicture = "";
                user.profilePicturePublicID = "";
            }
        }


        const updatedUser = await user.save();
        if (!updatedUser) {
            return res.status(400).json({
                success: false,
                message: "User profile not updated",
                data: null,
                error: "UserUpdateError",
            });
        }
        return res.status(200).json({
            success: true,
            message: "User profile updated successfully",
            user: {
                id: updatedUser._id,
                userName: updatedUser.userName,
                email: updatedUser.email,
                profilePicture: updatedUser.profilePicture,
                bio: updatedUser.bio,
                location: updatedUser.location,
                website: updatedUser.website,
            },
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null,
            error: "ServerError",
        });
    }
};

const FollowToggle = async (req, res) => {
    try {
        const userId = req.user.id; // my id
        const { authorId } = req.params; // user's id
        console.log(authorId, userId);

        if (authorId.toString() === userId.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        // console.log(authorId.toString(), userId.toString());

        const followExist = await Follow.findOne({ author: authorId, follower: userId })

        if (followExist) {
            const deleted = await Follow.findByIdAndDelete(followExist._id)
            if (deleted) {

                return res.status(200).json({ success: true, message: "unfollowed successfully.", data: deleted })
            }
        }
        const followed = await Follow.create({ author: authorId, follower: userId });

        if (followed) {
           await createNotificationSerice(authorId, userId, "Follow", `started following you.`)
        }

        res.status(200).json({ message: "Followed successfully" });
    } catch (error) {
        console.error("error in follow :", error)
        return res.status(501).json({ success: false, message: error.message })
    }
};

const getFollowers = async (req, res) => {
    try {
        const userId = req.user.id;
        const someone = req.params.id
        const followers = await Follow.find({ author: someone });

        return res.status(200).json({ success: true, message: "follwers found.", data: followers })

    } catch (error) {
        console.error("error in getFollowers :", error)
        return res.status(501).json({ success: false, message: error.message })
    }
};

const getFollowing = async (req, res) => {
    try {
        const userId = req.user.id;
        const someone = req.params.id
        const following = await Follow.find({ follower: someone })

        return res.status(200).json({ success: true, message: "follwing found.", data: following })

    } catch (error) {
        console.error("error in getFollowers :", error)
        return res.status(501).json({ success: false, message: error.message })
    }
};

const reqProfile = async (req, res) => {
    try {
        const { profileId } = req.params;

        if (!profileId) {
            return res.status(400).json({
                success: false,
                message: "profile_id is required"
            });
        }

        const profile = await User.findById(profileId);
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        const posts = await Post.find({ author: profile._id });

        if (posts.length === 0) {
            return res.status(200).json({
                success: false,
                message: "No posts available",
                data: { userData: profile, userPosts: [] }
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully!",
            data: { userData: profile, userPosts: posts }
        });
    } catch (error) {
        console.error("Error in reqProfile:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


export {
    registerUser,
    LoginUser,
    logoutUser,
    getUserProfile,
    refreshAccessToken,
    updateUserProfile,
    FollowToggle,
    getFollowers,
    getFollowing,
    reqProfile
}