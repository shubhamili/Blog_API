import { User } from "../models/userModel.js";


const registerUser = async (req, res) => {

    try {
        const { userName, Name, email, password, profilePicture, bio } = req.body;
        console.log(req.body);

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



        const user = await User.create({
            userName,
            password,
            Name,
            email,
        })

        if (user) {
            return res.status(201).json({
                success: true,
                message: "user created successfully",
                data: user,
                error: null,
            });
        }




    } catch (error) {
        console.error("error in controller", error)
    }


}

export {
    registerUser,
}