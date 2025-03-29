import { User } from "../models/userModel.js";
import { uploadOnCloudinary } from "../utils.js/cloudinary.js";


const registerUser = async (req, res) => {

    try {
        const { userName, Name, email, password, bio } = req.body;
        const profilePicture = req.file ? req.file.path : null
        // console.log("hello path", profilePicture);


        if ([userName, email, , password].some((field) => field?.trim() === "")) {
            return res.status(400).json({
                success: false,
                message: "all fiels are required",
                data: null,
                error: "ValidationError",
            });
        }


        const useExistsAlready = await User.findOne({ $or: [{ userName }, { email }] })
        if (useExistsAlready) {
            return res.status(400).json({
                success: false,
                message: "User with the email or username already exists",
                data: null,
                error: "duplicateUser",
            });
        }
        // console.log(profilePicture);

        const cloudinaryUpload = await uploadOnCloudinary(profilePicture);

        if (!cloudinaryUpload) {
            // If the upload fails, handle the error accordingly
            return res.status(400).json({
                success: false,
                message: "Error uploading to Cloudinary",
                data: null,
                error: "CloudinaryError",
            });
        }


        const user = await User.create({
            userName,
            password,
            Name,
            email,
            profilePicture
        })

        if (!user) {
            return res.status(201).json({
                success: false,
                message: "User not created",
                data: null,
                error: "UserCreationError",
            });
        }

        return res.status(201).json({
            success: true,
            message: "User created successfully",
        })




    } catch (error) {
        console.error("error in controller", error)
    }


}

export {
    registerUser,
}