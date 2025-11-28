import mongoose from "mongoose";
import { User } from "./userModel.js";

const notificationSchema = new mongoose.Schema({
    recipients: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    ],

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: false
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    isRead: {
        type: Boolean,
        required: true,
        default: false
    }
}, { timestamps: true })

export const Notification = mongoose.model('Notification', notificationSchema);
