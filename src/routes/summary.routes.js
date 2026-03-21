import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getSummary,
  getMonthlySummary,
} from "../controllers/summary.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getSummary);
router.get("/monthly", getMonthlySummary);

export default router;
