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













// import mongoose from "mongoose";
// import redisClient from "../config/redis.js";
// import Notification from "../models/notification.model.js";

// async function connectDB() {
//     if (!mongoose.connection.readyState) {
//         await mongoose.connect(process.env.MONGO_URI);
//         console.log("Worker connected to MongoDB");
//     }
// }

// async function processNotificationJob(job) {
//     const { senderId, recipientIds, Action, Message, _retryCount = 0 } = job;

//     try {
//         // Save notification document(s)
//         for (let recipientId of recipientIds) {
//             await Notification.create({
//                 senderId,
//                 recipientId,
//                 action: Action,
//                 message: Message,
//             });
//         }

//         console.log("Processed:", job);
//         return true;

//     } catch (err) {
//         console.log("❌ Error processing job:", err.message);

//         // If job has retried less than 3 times → retry
//         if (_retryCount < 3) {
//             const updatedJob = {
//                 ...job,
//                 _retryCount: _retryCount + 1
//             };

//             await redisClient.lPush(
//                 "notification_retry_queue",
//                 JSON.stringify(updatedJob)
//             );

//             console.log(`🔁 Retrying job (${_retryCount + 1}/3)...`);
//             return false;
//         }

//         // After 3 retries, send to DLQ
//         await redisClient.lPush(
//             "notification_dlq",
//             JSON.stringify(job)
//         );

//         console.log("💀 Job moved to DLQ:", job);
//         return false;
//     }
// }

// async function startWorker() {
//     await connectDB();

//     console.log("Notification worker started...");

//     while (true) {
//         try {
//             // Block until a job arrives
//             const data = await redisClient.brPop("notification_queue", 0);

//             if (!data || !data.element) continue;

//             const job = JSON.parse(data.element);
//             await processNotificationJob(job);

//         } catch (err) {
//             console.error("Worker crashed:", err);
//         }
//     }
// }

// startWorker();
