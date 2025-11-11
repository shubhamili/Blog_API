import dotenv from "dotenv";

dotenv.config({
    path: './.env'
})
import express from "express";
import cors from "cors";
import { ConnectDB } from "./src/db/db.js";
import userRouter from "./src/routes/userRoute.js";
import cookieParser from "cookie-parser";
import postRouter from "./src/routes/postRoute.js";
import { basicLimiter } from "./src/utils.js/rateLimiter.js";

//13-08-2025 all .js files total lines are => 1621

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//basic limiter for all routes
app.use(basicLimiter)


ConnectDB().then((req, res) => {
    console.log("DB connected");
    app.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT}`);
    })
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "🚀 API is running smoothly!",
        server: {
            port: PORT,
            uptime: process.uptime().toFixed(2) + "s",
            timestamp: new Date().toLocaleString()
        },
        database: "MongoDB connected"
    });
});


app.use(cors({
    origin: [
        "http://localhost:5174"
    ],
    credentials: true,
}));

//routes
app.use("/api/user", userRouter)
app.use("/api/post", postRouter)



//error handle
app.use((err, req, res, next) => {
    console.error("Error:", err);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || [],
        data: null,
    });
});

