import jwt from "jsonwebtoken";
import pool from "../config/db.config.js";

const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user has been soft-deleted since token was issued
    const result = await pool.query(
      "SELECT is_deleted FROM users WHERE id = $1",
      [decoded.id],
    );

    if (result.rows.length === 0 || result.rows[0].is_deleted) {
      return res.status(401).json({ error: "Account not found or deleted." });
    }

    req.user = decoded;
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
