import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { exportTransactions } from "../controllers/export.controller.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", exportTransactions);

export default router;
