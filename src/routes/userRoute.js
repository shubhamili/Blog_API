import express from "express";
import { LoginUser, logoutUser, registerUser } from "../controllers/userController.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

userRouter.route("/register").post(upload.single("profilePicture"), registerUser);
userRouter.route("/login").post(LoginUser)

//protect routes
userRouter.route("/logout").post(authenticateUser, logoutUser)

export default userRouter;