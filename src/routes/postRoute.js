import express from "express";
import { createPost, getAllPosts, getSinglePost, getUserPosts, updatePost } from "../controllers/postController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multerMiddleware.js";


const postRouter = express.Router();

postRouter.route("/create").post(authenticateUser, upload.single("postPicture"), createPost);
postRouter.route("/get-all-posts").get(authenticateUser, getAllPosts);
postRouter.route("/getSinglePost/:id").get(authenticateUser, getSinglePost);
postRouter.route("/getUserPosts").get(authenticateUser, getUserPosts);
postRouter.route("/updatePost/:id").get(authenticateUser, updatePost);


export default postRouter;