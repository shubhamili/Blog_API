import express from "express";
import { addComment, createPost, deletePost, getAllPosts, getSinglePost, getUserPosts, toggleLikePost, totalPostbyEachUser, updatePost } from "../controllers/postController.js";
// import { authenticateUser } from "../middlewares/authMiddleware.js";
// import passport from "passport";
import { upload } from "../middlewares/multerMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { authenticateUser } from "../middlewares/authenticateUser.js";



const postRouter = express.Router();

postRouter.route("/create").post(authenticateUser, authorizeRoles("admin", "editor"), upload.single("postPicture"), createPost);

postRouter.route("/get-all-posts").get(authenticateUser, getAllPosts);

postRouter.route("/getSinglePost/:id").get(authenticateUser, getSinglePost);

postRouter.route("/getUserPosts").get(authenticateUser, getUserPosts);

postRouter.route("/updatePost/:id").put(authenticateUser, authorizeRoles("editor", "admin"), upload.single("postPicture"), updatePost);

postRouter.route("/deletePost/:id").delete(authenticateUser, authorizeRoles("admin", "editor"), deletePost);

postRouter.route("/likePost/:id").post(authenticateUser, toggleLikePost);

postRouter.route("/addComment/:id").post(authenticateUser, addComment);

postRouter.route("/totalPostbyEachUser").get(totalPostbyEachUser);




export default postRouter;