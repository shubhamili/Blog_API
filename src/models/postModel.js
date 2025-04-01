import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    auther: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
    postPicture: { type: String },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
},
{
    timestamps: true,
},
);

export const Post = mongoose.model("Post", postSchema);
