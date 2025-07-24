import express from "express";
import { addComment, createPost, deletePost, getAllPosts, getSinglePost, getUserPosts, toggleLikePost, totalPostbyEachUser, updatePost } from "../controllers/postController.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { verifyToken } from "../middlewares/verifyToken.js";



const postRouter = express.Router();

postRouter.route("/create").post(verifyToken, upload.single("postPicture"), createPost);

postRouter.route("/get-all-posts").get(verifyToken, getAllPosts);

postRouter.route("/getSinglePost/:id").get(verifyToken, getSinglePost);

postRouter.route("/getUserPosts").get(verifyToken, getUserPosts);

postRouter.route("/updatePost/:id").put(verifyToken, upload.single("postPicture"), updatePost);

postRouter.route("/deletePost/:id").delete(verifyToken,  deletePost);

postRouter.route("/likePost/:id").post(verifyToken, toggleLikePost);

postRouter.route("/addComment/:id").post(verifyToken, addComment);

postRouter.route("/totalPostbyEachUser").get(totalPostbyEachUser);




export default postRouter;