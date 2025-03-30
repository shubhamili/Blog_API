import express from "express";
import { LoginUser, registerUser } from "../controllers/userController.js";
import { upload } from "../middlewares/multerMiddleware.js";

const userRouter = express.Router();

userRouter.route("/register").post(upload.single("profilePicture"), registerUser);
userRouter.route("/login").post(LoginUser)

export default userRouter;