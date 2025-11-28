import redisClient from "../config/redis.js";
import { Notification } from "../models/notificationModel.js";

export async function notificationWorker() {
    console.log("notification worker started...");


    while (true) {
        try {

            const data = await redisClient.brPop("notification_queue", 0);

            console.log("data", data);

            if (!data || !data.element) continue;

            const parsedData = JSON.parse(data.element);

            const result = await Notification.create({
                recipients: parsedData.recipientIds,
                sender: parsedData.senderId,
                type: parsedData.Action,
                message: parsedData.Message
            })

            // await Notification.insertMany

            console.log("result", result);




        } catch (error) {
            console.error(" Worker error:", error);

            // optional error queue
            // await redisClient.lPush("notification_error_queue", JSON.stringify({
            //     payload,
            //     error: err.message
            // }));
        }
    }



}