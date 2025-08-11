import express from "express";
import { FollowToggle, getFollowers, getFollowing, getUserProfile, LoginUser, logoutUser, refreshAccessToken, registerUser, updateUserProfile } from "../controllers/userController.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const userRouter = express.Router();

userRouter.route("/register").post(upload.single("profilePicture"), registerUser);
userRouter.route("/login").post(LoginUser);
userRouter.route("/refreshAccessToken").get(refreshAccessToken);

//protect routes
userRouter.route("/logout").post(verifyToken, logoutUser);
userRouter.route("/me").get(verifyToken, getUserProfile);
userRouter.route("/update").put(verifyToken, upload.single("profilePicture"), updateUserProfile);
userRouter.route("/follow-toggle/:authorId").post(verifyToken, FollowToggle);
userRouter.route("/getFollowers/:id").get(verifyToken, getFollowers);
userRouter.route("/getFollowing/:id").get(verifyToken, getFollowing);

export default userRouter;