const mysql = require("mysql2/promise");
const { config } = require("../config/env");

const pool = mysql.createPool({
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  port: config.mysql.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const ping = async () => {
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();
};

module.exports = { pool, ping };
