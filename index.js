import dotenv from "dotenv";
dotenv.config({
    path: './.env'
})
import express from "express";
import cors from "cors";
import { ConnectDB } from "./src/db/db.js";
import userRouter from "./src/routes/userRoute.js";
import cookieParser from "cookie-parser";


const app = express();

ConnectDB().then(() => {

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })

}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//routes
app.use("/api/user", userRouter)


const PORT = process.env.PORT;

