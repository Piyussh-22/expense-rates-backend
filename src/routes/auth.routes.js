import express from "express";
import rateLimit from "express-rate-limit";
import passport from "../config/passport.config.js";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  handleGoogleCallback,
  getMe,
  logout,
} from "../controllers/auth.controller.js";
import pool from "../config/db.config.js";

const router = express.Router();

// Strict rate limit for recovery — unauthenticated endpoint that hits DB
const recoveryLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account",
  }),
);

router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err)
        return res.redirect(
          `${process.env.CLIENT_URL}/login?error=server_error`,
        );

      if (!user) {
        if (info?.message === "ACCOUNT_DELETED") {
          const deletedAt = encodeURIComponent(
            new Date(info.deletedAt).toISOString(),
          );
          const email = encodeURIComponent(info.email);
          return res.redirect(
            `${process.env.CLIENT_URL}/login?error=account_deleted&deleted_at=${deletedAt}&email=${email}`,
          );
        }
        return res.redirect(
          `${process.env.CLIENT_URL}/login?error=auth_failed`,
        );
      }

      req.user = user;
      next();
    })(req, res, next);
  },
  handleGoogleCallback,
);

router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logout);

// Account recovery — rate limited tightly, no auth required
router.post("/recover", recoveryLimiter, async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email required." });

  try {
    const result = await pool.query(
      `UPDATE users
       SET is_deleted = FALSE, deleted_at = NULL
       WHERE email = $1 AND is_deleted = TRUE
       AND deleted_at > now() - interval '30 days'
       RETURNING id`,
      [email],
    );

    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ error: "Account not found or recovery period expired." });

    res.json({ message: "Account recovered." });
  } catch (err) {
    console.error("Recovery error:", err.message);
    res.status(500).json({ error: "Recovery failed." });
  }
});

export default router;
