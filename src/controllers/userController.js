import { User } from "../models/userModel.js";
import { ApiError } from "../utils.js/ApiError.js";
import { ApiResponse } from "../utils.js/apiResponse.js";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils.js/jwt.js";
import { uploadOnCloudinary } from "../utils.js/cloudinary.js";

const registerUser = async (req, res) => {

    try {
        const { userName, Name, email, password, bio } = req.body;
        const profilePicture = req.file ? req.file.path : null

        if ([userName, email, , password].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "Please fill all the fields")
        }

        const useExistsAlready = await User.findOne({ $or: [{ userName }, { email }] })
        if (useExistsAlready) {
            throw new ApiError(400, "User already exists with the email or username")
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

        //jwt token

        const token = generateToken(user)
        if (!token) {
            throw new ApiError(400, "Token not generated")
        }

        const createdUser = await User.findById(user._id).select("-password")

        if (!createdUser) {
            throw new ApiError(400, "User not created")

        }

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
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
        throw new ApiError(400, "all fields are required")
    }
    const user = await User.findOne({ userName });

    if (!user) {
        return res.status(400).json({
            success: false,
            msg: "error in finding user bro"
        })
    }

    const passwordVarified = await user.isPasswordCorrect(password)
    console.log(passwordVarified);

    if (!passwordVarified) {
        new ApiError(400, "password has some problem")
    }

    //authentication token
    const token = generateToken(user)
    if (!token) {
        throw new ApiError(400, "Token not generated")
    }

    const loggedInUser = await User.findById(user._id).select("-password")
    if (!loggedInUser) {
        throw new ApiError(400, "User not logged in")
    }

    // res.cookie("token", token, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: "strict",
    //     maxAge: 24 * 60 * 60 * 1000, // 1 day
    // });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).json({
        success: true,
        message: "Login successful",
        user: { id: user._id, userName: user.userName, email: user.email },
    });

}

const logoutUser = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
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
            userData: userNew
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