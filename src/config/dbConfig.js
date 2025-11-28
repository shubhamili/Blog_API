import dotenv from "dotenv";

dotenv.config({
    path: './.env'
})
import mongoose from "mongoose";
export const ConnectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDb connected by host:", conn.connection.host);

    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}