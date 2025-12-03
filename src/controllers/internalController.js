// src/controllers/internalController.js
import { getIO } from "../socket/index.js";

export const emitNotification = (req, res) => {

    const internalKey = req.headers["x-internal-key"];
    if (internalKey !== process.env.INTERNAL_API_KEY) {
        return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    console.log("internal key was okay--",);

    const { notification } = req.body;
    if (!notification) return res.status(400).json({ ok: false, message: "No notification payload" });

    console.log("notification body: ", notification);
    const recipientIds = notification.recipients
    console.log("recipientIds", recipientIds);
    try {
        const io = getIO();
        // notification can be a single doc or an array
        const recipients = recipientIds;

        console.log('recipients', recipients)

        recipients.forEach((id) => {
            io.to(id).emit("new-notification", notification);
        });

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("Emit error:", err);
        return res.status(500).json({ ok: false, message: err.message });
    }
};
