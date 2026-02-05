const { pool } = require("./index");

const findByGoogleId = async (googleId) => {
  const [rows] = await pool.execute(
    "SELECT id, google_id, email, name, avatar_url, last_login FROM users WHERE google_id = ?",
    [googleId]
  );
  return rows[0] || null;
};

const createUser = async ({ googleId, email, name, avatarUrl }) => {
  const [result] = await pool.execute(
    "INSERT INTO users (google_id, email, name, avatar_url) VALUES (?, ?, ?, ?)",
    [googleId, email, name, avatarUrl]
  );
  return result.insertId;
};

const updateLastLogin = async (userId) => {
  await pool.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [
    userId,
  ]);
};

const findById = async (id) => {
  const [rows] = await pool.execute(
    "SELECT id, google_id, email, name, avatar_url, last_login FROM users WHERE id = ?",
    [id]
  );
  return rows[0] || null;
};

module.exports = {
  findByGoogleId,
  createUser,
  updateLastLogin,
  findById,
};
