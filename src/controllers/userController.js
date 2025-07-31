import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils.js/jwt.js";
import { uploadOnCloudinary } from "../utils.js/cloudinary.js";

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

        const token = generateToken(createdUser)
        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Token not generated",
                data: null,
                error: "TokenError",
            });
        }
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            message: "user registered successful",
            user: { id: user._id, username: user.userName, email: user.email, profilePicture: createdUser.profilePicture },
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

    //authentication token
    const token = generateToken(user)
    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Token not generated",
            data: null,
            error: "TokenError",
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


    // res.cookie("token", token, {
    //     httpOnly: true,
    //     secure: false,       // ❗ in dev only
    //     sameSite: "Lax",     // ✅ safe for same-origin or same-device dev testing
    //     maxAge: 7 * 24 * 60 * 60 * 1000,
    // });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
        success: true,
        message: "Login successful",
        user: loggedInUser
    });


}

const logoutUser = async (req, res) => {
    // res.clearCookie("token", {
    //     httpOnly: true,
    //     sameSite: "None",
    //     secure: true, // ✅ Must be true if using SameSite=None
    // });
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    res.status(200).json({
        success: true,
        message: "Logout successful",
    });
}


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
    getUserProfile
}

// https://www.youtube.com/watch?v=MIJt9H69QVc&list=WL&index=6