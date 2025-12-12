import { Router } from "express";
import { completion } from "../controllers/aiController.js";



const aiRouter = Router()


aiRouter.post('/completion', completion);



export default aiRouter;