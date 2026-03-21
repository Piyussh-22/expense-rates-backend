import pool from "../config/db.config.js";
import { isValidCategory } from "../utils/categories.utils.js";

const isValidDate = (date) => {
  const d = new Date(date);
  const min = new Date("2020-01-01");
  const max = new Date();
  max.setHours(23, 59, 59, 999);
  return d >= min && d <= max;
};

export const createTransaction = async (req, res) => {
  try {
    const { type, category, amount, note, date } = req.body;
    const userId = req.user.id;

    if (!["expense", "earn", "invest"].includes(type))
      return res.status(400).json({ error: "Invalid type." });

    if (!isValidCategory(type, category))
      return res.status(400).json({ error: "Invalid category for this type." });

    if (!amount || isNaN(amount) || amount <= 0 || amount > 99999999.99)
      return res.status(400).json({ error: "Invalid amount." });

    if (note && note.length > 20)
      return res
        .status(400)
        .json({ error: "Note must be 20 characters or less." });

    if (date && !isValidDate(date))
      return res
        .status(400)
        .json({ error: "Date must be between 2020-01-01 and today." });

    const result = await pool.query(
      `INSERT INTO transactions (user_id, type, category, amount, note, date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        userId,
        type,
        category,
        parseFloat(amount),
        note || null,
        date || new Date(),
      ],
    );

    res.status(201).json({ transaction: result.rows[0] });
  } catch (err) {
    console.error("createTransaction error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { type, from, to } = req.query;

    let conditions = ["user_id = $1"];
    let params = [userId];
    let i = 2;

    if (type) {
      conditions.push(`type = $${i++}`);
      params.push(type);
    }
    if (from) {
      conditions.push(`date >= $${i++}`);
      params.push(from);
    }
    if (to) {
      conditions.push(`date <= $${i++}`);
      params.push(to);
    }

    const where = conditions.join(" AND ");

    const [dataResult, countResult] = await Promise.all([
      pool.query(
        `SELECT * FROM transactions WHERE ${where} ORDER BY date DESC LIMIT $${i} OFFSET $${i + 1}`,
        [...params, limit, offset],
      ),
      pool.query(`SELECT COUNT(*) FROM transactions WHERE ${where}`, params),
    ]);

    const total = parseInt(countResult.rows[0].count);
    const hasMore = offset + dataResult.rows.length < total;

    res.json({ transactions: dataResult.rows, hasMore, total, page });
  } catch (err) {
    console.error("getTransactions error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { type, category, amount, note, date } = req.body;

    const existing = await pool.query(
      "SELECT * FROM transactions WHERE id = $1 AND user_id = $2",
      [id, userId],
    );

    if (existing.rows.length === 0)
      return res.status(404).json({ error: "Transaction not found." });

    const current = existing.rows[0];
    const newType = type || current.type;
    const newCategory = category || current.category;
    const newAmount = amount || current.amount;
    const newNote = note !== undefined ? note : current.note;
    const newDate = date || current.date;

    if (!["expense", "earn", "invest"].includes(newType))
      return res.status(400).json({ error: "Invalid type." });

    if (!isValidCategory(newType, newCategory))
      return res.status(400).json({ error: "Invalid category for this type." });

    if (isNaN(newAmount) || newAmount <= 0 || newAmount > 99999999.99)
      return res.status(400).json({ error: "Invalid amount." });

    if (newNote && newNote.length > 20)
      return res
        .status(400)
        .json({ error: "Note must be 20 characters or less." });

    if (newDate && !isValidDate(newDate))
      return res
        .status(400)
        .json({ error: "Date must be between 2020-01-01 and today." });
    const result = await pool.query(
      `UPDATE transactions
       SET type = $1, category = $2, amount = $3, note = $4, date = $5, updated_at = now()
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        newType,
        newCategory,
        parseFloat(newAmount),
        newNote || null,
        newDate,
        id,
        userId,
      ],
    );

    res.json({ transaction: result.rows[0] });
  } catch (err) {
    console.error("updateTransaction error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      "DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Transaction not found." });

    res.json({ message: "Transaction deleted." });
  } catch (err) {
    console.error("deleteTransaction error:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
};
