import jwt from "jsonwebtoken";
import pool from "../config/db.config.js";

const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user data from DB on every request
    // This ensures stale JWT data never reaches controllers
    // and catches soft-deleted accounts in the same query
    const result = await pool.query(
      `SELECT id, email, name, avatar_url, default_currency, currency_set, is_deleted
       FROM users WHERE id = $1`,
      [decoded.id],
    );

    if (result.rows.length === 0 || result.rows[0].is_deleted) {
      return res.status(401).json({ error: "Account not found or deleted." });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Session expired. Please log in again." });
    }
    return res.status(401).json({ error: "Invalid token." });
  }
};

export default authMiddleware;
