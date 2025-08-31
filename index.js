// import dotenv from "dotenv";

// dotenv.config({
//     path: './.env'
// })
// import express from "express";
// import cors from "cors";
// import { ConnectDB } from "./src/db/db.js";
// import userRouter from "./src/routes/userRoute.js";
// import cookieParser from "cookie-parser";
// import postRouter from "./src/routes/postRoute.js";

// //13-08-2025 all .js files total lines are => 1621

// const app = express();

// ConnectDB().then(() => {

//     app.listen(PORT, "0.0.0.0", () => {
//         console.log(`Server is running on port ${PORT}`);
//     })

// }).catch((error) => {
//     console.error("Error connecting to MongoDB:", error);
// });



// app.use(cors({
//     origin: [
//         "http://localhost:5173",
//         "http://192.168.1.5:5173" // <-- also add phone-accessible frontend
//     ],
//     credentials: true,
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// //routes
// app.use("/api/user", userRouter)
// app.use("/api/post", postRouter)



// //error handle
// app.use((err, req, res, next) => {
//     console.error("🔥 Error:", err);

//     const statusCode = err.statusCode || 500;
//     const message = err.message || "Internal Server Error";

//     return res.status(statusCode).json({
//         success: false,
//         message,
//         errors: err.errors || [],
//         data: null,
//     });
// });


// const PORT = process.env.PORT;

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 5000;

import express from "express";
import cors from "cors";
import { ConnectDB } from "./src/db/db.js";
import userRouter from "./src/routes/userRoute.js";
import cookieParser from "cookie-parser";
import postRouter from "./src/routes/postRoute.js";

const app = express();

ConnectDB()
    .then(() => {
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`✅ Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ Error connecting to MongoDB:", error);
    });

app.use(
    cors({
        origin: ["http://localhost:5173", "http://10.148.1.200:5173"],
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);

// test route
app.get("/api/test", (req, res) => {
    res.send("Server is working ✅");
});

// error handler
app.use((err, req, res, next) => {
    console.error("🔥 Error:", err);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || [],
        data: null,
    });
});
