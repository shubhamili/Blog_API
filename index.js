import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { ConnectDB } from "./src/db/db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

ConnectDB().then(() => {

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })

}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

const PORT = process.env.PORT;

