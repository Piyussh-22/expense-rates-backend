import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  updateSettings,
  deleteAccount,
} from "../controllers/user.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.patch("/", updateSettings);
router.delete("/", deleteAccount);

export default router;
