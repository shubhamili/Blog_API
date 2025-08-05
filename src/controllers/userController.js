import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils.js/cloudinary.js";
import { generateAccessToken, generateRefreshToken } from "../utils.js/jwt.js";



const registerUser = async (req, res) => {
    try {
        const { userName, Name, email, password, bio } = req.body;
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
            Name,
            email,
            profilePicture: uploadedImageUrl,
            bio,

        })



        const createdUser = await User.findById(user._id).select("-password")

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

}

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


}

const logoutUser = async (req, res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });
    return res.sendStatus(204);
}
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

export {
    registerUser,
    LoginUser,
    logoutUser,
    getUserProfile,
    refreshAccessToken
}