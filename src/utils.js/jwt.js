import jwt from "jsonwebtoken";


export const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, userName: user.userName, email: user.email },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRY }
    );
};


export const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id, userName: user.userName, email: user.email },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRY }
    );
};
