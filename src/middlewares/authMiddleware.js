import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const authenticateUser = (req, res, next) => {
    const token = req.cookies.token; // Get token from cookies

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("decoded", decoded);

        req.user = User.findById(decoded.id).select("-password");
        // console.log("req.user", req.user);
        
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};