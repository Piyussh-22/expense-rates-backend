import pool from "../config/db.config.js";

export const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { default_currency } = req.body;

    const userResult = await pool.query(
      "SELECT currency_set FROM users WHERE id = $1",
      [userId],
    );

    const user = userResult.rows[0];

    if (default_currency && user.currency_set)
      return res
        .status(400)
        .json({ error: "Currency cannot be changed once set." });

    const result = await pool.query(
      `UPDATE users
       SET
         default_currency = COALESCE($1, default_currency),
         currency_set     = CASE WHEN $1 IS NOT NULL THEN TRUE ELSE currency_set END
       WHERE id = $2
       RETURNING id, name, email, avatar_url, default_currency, currency_set`,
      [default_currency || null, userId],
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("updateSettings error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      `UPDATE users SET is_deleted = TRUE, deleted_at = now() WHERE id = $1`,
      [userId],
    );

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.json({ message: "Account deleted. You have 30 days to recover it." });
  } catch (err) {
    console.error("deleteAccount error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
};
