import pool from "../config/db.config.js";

export const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;

    let conditions = ["user_id = $1"];
    let params = [userId];
    let i = 2;

    if (from) {
      conditions.push(`date >= $${i++}`);
      params.push(from);
    }
    if (to) {
      conditions.push(`date <= $${i++}`);
      params.push(to);
    }

    const where = conditions.join(" AND ");

    const result = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'earn'    THEN amount ELSE 0 END), 0) AS total_earned,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_spent,
        COALESCE(SUM(CASE WHEN type = 'invest'  THEN amount ELSE 0 END), 0) AS total_invested
       FROM transactions WHERE ${where}`,
      params,
    );

    const { total_earned, total_spent, total_invested } = result.rows[0];
    const net_balance =
      parseFloat(total_earned) -
      parseFloat(total_spent) -
      parseFloat(total_invested);

    res.json({
      total_earned: parseFloat(total_earned),
      total_spent: parseFloat(total_spent),
      total_invested: parseFloat(total_invested),
      net_balance,
    });
  } catch (err) {
    console.error("getSummary error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getMonthlySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const result = await pool.query(
      `SELECT
        EXTRACT(MONTH FROM date) AS month,
        COALESCE(SUM(CASE WHEN type = 'earn'    THEN amount ELSE 0 END), 0) AS earned,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS spent,
        COALESCE(SUM(CASE WHEN type = 'invest'  THEN amount ELSE 0 END), 0) AS invested
       FROM transactions
       WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2
       GROUP BY month ORDER BY month ASC`,
      [userId, year],
    );

    const months = Array.from({ length: 12 }, (_, i) => {
      const found = result.rows.find((r) => parseInt(r.month) === i + 1);
      return {
        month: i + 1,
        earned: found ? parseFloat(found.earned) : 0,
        spent: found ? parseFloat(found.spent) : 0,
        invested: found ? parseFloat(found.invested) : 0,
      };
    });

    res.json({ year, months });
  } catch (err) {
    console.error("getMonthlySummary error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
};
