
import express from "express";
import { googleAuth } from "../controllers/googleAuth.controller.js";



const googleRoute = express.Router();


googleRoute.route('/auth').post(googleAuth);

export default googleRoute; 