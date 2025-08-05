import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const verifyToken = async (req, res, next) => {
    const accessToken = req.headers.authorization?.split(" ")[1];
    console.log("verifying token", accessToken);

    if (!accessToken) {
        return res.status(401).json({ message: "Access denied. No accessToken provided." });
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        console.log("Decoded accessToken:", decoded);
        const user = await User.findById(decoded?.id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.user = {
            id: user._id,
            userName: user.userName,
            email: user.email,
        };
        console.log("user verified", req.user);

        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired accessToken" });
    }
};