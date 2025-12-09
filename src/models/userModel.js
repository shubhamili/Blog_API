import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            require: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: function () {
                return !this.isGoogleUser;
            }
        },
        isGoogleUser: {
            type: Boolean,
            require: true
        },
        googleId: {
            type: String
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
        location: {
            type: String,
        },
        website: {
            type: String,
        },

    },
    {
        timestamps: true
    }
)


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    if (this.isGoogleUser) return next();
    this.password = bcrypt.hash(this.password, 8)
    next()
})


userSchema.methods.isPasswordCorrect =
    async function (password) {
        if (this.isGoogleUser) return false;
        return await bcrypt.compare(password, this.password)
    }


export const User = mongoose.model("User", userSchema);