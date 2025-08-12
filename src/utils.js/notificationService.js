import { Notification } from "../models/notificationModel.js";

export const createNotificationSerice = async (recipient, sender, type, message) => {
    try {
        const NotificationDoc = await Notification.create({
            recipient,
            sender,
            type,
            message
        })

        return NotificationDoc
    } catch (error) {
        console.error("Error in reqProfile:", error);
        throw new Error(error.message);
    }
}