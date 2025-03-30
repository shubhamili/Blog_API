import { User } from "../models/userModel.js";
import { ApiError } from "../utils.js/ApiError.js";
import { ApiResponse } from "../utils.js/apiResponse.js";
// import { uploadOnCloudinary } from "../utils.js/cloudinary.js";


const registerUser = async (req, res) => {

    try {
        const { userName, Name, email, password, bio } = req.body;
        const profilePicture = req.file ? req.file.path : null

        if ([userName, email, , password].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "Please fill all the fields")
        }


        const useExistsAlready = await User.findOne({ $or: [{ userName }, { email }] })
        if (useExistsAlready) {
            throw new ApiError(400, "User already exists")
        }
        // console.log(profilePicture);

        // const cloudinaryUpload = await uploadOnCloudinary(profilePicture);

        // if (!cloudinaryUpload) {
        //     // If the upload fails, handle the error accordingly
        //     return res.status(400).json({
        //         success: false,
        //         message: "Error uploading to Cloudinary or file not provided",
        //         data: null,
        //         error: "CloudinaryError",
        //     });
        // }


        const user = await User.create({
            userName,
            password,
            Name,
            email,
            profilePicture
        })

        const createdUser = await User.findById(user._id).select("-password")



        if (!createdUser) {
            throw new ApiError(400, "User not created")

        }

        return res.status(201).json(new ApiResponse(201, createdUser, "User created successfully"))





    } catch (error) {
        console.error("error in controller", error)
    }


}


const LoginUser = async (req, res) => {
    const { userName, password, email } = req.body;
    if ([userName, email, , password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "all fields are required")
    }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })

    console.log(user);


    if (!user) {
        new ApiError(400, "cant find user with the given credencials")
    }

    const passwordVarified = await user.isPasswordCorrect(password)
    // const isPasswordValid = await user.isPasswordCorrect(password)
    if (!passwordVarified) {
        new ApiError(400, "password has some problem")
    }

    const loggedInUser = await User.findById(user._id).select("-password")

    return res.status(200).json(new ApiResponse(200, loggedInUser, "logged in"))



}

export {
    registerUser,
    LoginUser
}