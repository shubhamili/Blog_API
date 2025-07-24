import mongoose from "mongoose";
import { User } from "./userModel.js";

const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: User },
    content: { type: String, required: true },
    postPicture: { type: String },
    postPicturePublicID: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: User }],
    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: User },
            comment: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        }
    ],
},
    {
        timestamps: true,
    }
);

export const Post = mongoose.model("Post", postSchema);
