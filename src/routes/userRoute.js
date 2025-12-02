import express from "express";
import { FollowToggle, getFollow, getMyNotifications, getUserProfile, LoginUser, logoutUser, refreshAccessToken, registerUser, reqProfile, updateUserProfile } from "../controllers/userController.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { loginLimiter } from "../utils.js/rateLimiter.js";

const userRouter = express.Router();

userRouter.route("/register").post(upload.single("profilePicture"), registerUser);
userRouter.route("/login").post(LoginUser);
// userRouter.route("/login").post(loginLimiter, LoginUser);
userRouter.route("/refreshAccessToken").get(refreshAccessToken);
// userRouter.route("/refreshAccessToken").get(loginLimiter, refreshAccessToken);

//protect routes
userRouter.route("/logout").post(verifyToken, logoutUser);

userRouter.route("/me").get(verifyToken, getUserProfile);

userRouter.route("/update").put(verifyToken, upload.single("profilePicture"), updateUserProfile);

userRouter.route("/follow-toggle/:authorId").post(verifyToken, FollowToggle);

userRouter.route("/getFollow/:id").get(verifyToken, getFollow);

userRouter.route("/profile/:profileId").get(verifyToken, reqProfile);

userRouter.route("/notification").get(verifyToken, getMyNotifications);

export default userRouter;