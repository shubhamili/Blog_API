import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            require: true,
            unique: true,
        },
        Name: {
            type: String,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true
        },
        profilePicture: {
            type: String,
        },
        profilePicturePublicID: {
            type: String
        },
        bio: {
            type: String,
        },
    },
    {
        timestamps: true
    }
)


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next() // no !==>  yes  || yes no 
    this.password = await bcrypt.hash(this.password, 8)
    next()
})


userSchema.methods.isPasswordCorrect =
    async function (password) {
        return await bcrypt.compare(password, this.password)
    }


export const User = mongoose.model("User", userSchema);