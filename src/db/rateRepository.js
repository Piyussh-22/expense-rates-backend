const { pool } = require("./index");

const saveUserRates = async ({ userId, usdInrRate, goldRate }) => {
  await pool.execute(
    "INSERT INTO user_rates (user_id, usd_inr_rate, gold_rate) VALUES (?, ?, ?)",
    [userId, usdInrRate, goldRate]
  );
};

const getLatestUserRates = async (userId) => {
  const [rows] = await pool.execute(
    "SELECT usd_inr_rate, gold_rate, recorded_at FROM user_rates WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1",
    [userId]
  );
  return rows[0] || null;
};

module.exports = { saveUserRates, getLatestUserRates };
