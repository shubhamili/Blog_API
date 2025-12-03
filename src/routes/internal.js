import express from "express";
import { emitNotification } from "../controllers/internalController.js";

const router = express.Router();
router.post("/emit", emitNotification);

export default router;
