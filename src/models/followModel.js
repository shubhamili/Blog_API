import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        },
        follower: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            require: true
        }
    }
)

followSchema.index({ author: 1, follower: 1 }, { unique: true })

const Follow = mongoose.model("Follow", followSchema);

export default Follow;