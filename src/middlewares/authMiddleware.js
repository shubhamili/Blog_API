import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const authenticateUser = async (req, res, next) => {
    const token = req.cookies.token; // Get token from cookies
    // console.log("token", token);    


    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("decoded", decoded);

        const user = await User.findById(decoded?.id).select("-password");
        // console.log("id", decoded.id);

        if (!user) {
            return res.status(401).json({ message: "Invalid token" });
        }
        req.user = user; // Attach user to request object
        // console.log("user", user);
        // console.log("req.user", req.user);

        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};