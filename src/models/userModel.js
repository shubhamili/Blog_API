import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
   
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
        unique: true,
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

    bio: {
        type: String,
    },

},
 {
    timestamps: true
})

export const User = mongoose.model("User", userSchema);


