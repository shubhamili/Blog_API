import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const authenticateUser = async (req, res, next) => {
    const token = req.cookies.token; // Get token from cookies

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Invalid token" });
        }
      
        req.user = {
            id: user._id,
            userName: user.userName,
            role: user.role,
            email: user.email,
        };

        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};