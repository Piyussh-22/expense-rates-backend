import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import passport from "./config/passport.config.js";
import authRoutes from "./routes/auth.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import userRoutes from "./routes/user.routes.js";
import exportRoutes from "./routes/export.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Auth routes - stricter limit to prevent brute force
app.use("/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }));
app.use("/auth", authRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

// API routes - general limit to protect DB from hammering
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use("/api/transactions", apiLimiter, transactionRoutes);
app.use("/api/summary", apiLimiter, summaryRoutes);
app.use("/api/users/me", apiLimiter, userRoutes);
app.use("/api/export", apiLimiter, exportRoutes);

app.use((req, res) => res.status(404).json({ error: "Route not found." }));
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, () => console.log(`🟢 Server running on port ${PORT}`));
