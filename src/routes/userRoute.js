import express from "express";
import { getUserProfile, LoginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/userController.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const userRouter = express.Router();

userRouter.route("/register").post(upload.single("profilePicture"), registerUser);
userRouter.route("/login").post(LoginUser)
userRouter.route("/refreshAccessToken").get(refreshAccessToken)

//protect routes
userRouter.route("/logout").post(verifyToken, logoutUser)
userRouter.route("/me").get(verifyToken, getUserProfile)

export default userRouter;