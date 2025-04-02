import express from "express";
import { createPost } from "../controllers/postController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";


const postRouter = express.Router();

postRouter.route("/create").post(authenticateUser, createPost);


export default postRouter;