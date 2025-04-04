import express from "express";
import { createPost } from "../controllers/postController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multerMiddleware.js";


const postRouter = express.Router();

postRouter.route("/create").post(authenticateUser, upload.single("postPicture"), createPost);


export default postRouter;