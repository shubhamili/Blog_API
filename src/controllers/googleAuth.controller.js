import { OAuth2Client } from "google-auth-library";
import { User } from "../models/userModel.js";
import { generateAccessToken, generateRefreshToken } from "../utils.js/jwt.js";




const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


export const googleAuth = async (req, res) => {

    try {
        const { credential } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        })



        const payload = ticket.getPayload();
        const email = payload.email;
        const name = payload.name;
        const picture = payload.picture;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                userName: name,
                profilePicture: picture,
                isGoogleUser: true,
                googleId: payload.sub,
                password: null
            })
        }

        const refreshToken = generateRefreshToken(user)
        const accessToken = generateAccessToken(user)
        if (!refreshToken || !accessToken) {
            return res.status(400).json({
                success: false,
                message: "Token not generated",
                data: null,
            });
        }



        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });


        return res.status(200).json({
            success: true,
            message: "logged in using google",
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                profilePicture: user.profilePicture,
                accessToken: accessToken
            }
        });


    } catch (error) {
        console.log("error in google login :", error);
        return res.status(400).json({
            success: false,
            message: error.message || "logged in failed using google",

        });
    }



}