import { generatePDF } from "../services/export.service.js";

export const exportTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;

    if (!from || !to)
      return res
        .status(400)
        .json({ error: "Please provide both from and to dates." });

    if (new Date(from) > new Date(to))
      return res
        .status(400)
        .json({ error: "from date cannot be after to date." });

    await generatePDF(userId, from, to, res);
  } catch (err) {
    console.error("Export error:", err.message);
    res.status(500).json({ error: "Failed to generate export." });
  }
};
