import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { ConnectDB } from "./src/db/db.js";
import userRouter from "./src/routes/userRoute.js";

dotenv.config();

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

//routes
app.use("/api/user", userRouter)


const PORT = process.env.PORT;

