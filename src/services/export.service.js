import PDFDocument from "pdfkit";
import pool from "../config/db.config.js";

export const generatePDF = async (userId, from, to, res) => {
  let transactions;
  try {
    const result = await pool.query(
      `SELECT * FROM transactions
       WHERE user_id = $1 AND date >= $2 AND date <= $3
       ORDER BY date DESC`,
      [userId, from, to],
    );
    transactions = result.rows;
  } catch (err) {
    console.error("generatePDF DB error:", err.message);
    throw err; // let export.controller.js handle the 500
  }

  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="transactions.pdf"`,
  );
  doc.pipe(res);

  doc.fontSize(20).text("Transaction History", { align: "center" });
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .fillColor("gray")
    .text(`From: ${from}   To: ${to}`, { align: "center" });
  doc.moveDown(1);

  if (transactions.length === 0) {
    doc
      .fontSize(12)
      .fillColor("black")
      .text("No transactions found for this date range.", { align: "center" });
    doc.end();
    return;
  }

  doc.fontSize(11).fillColor("black");
  const startX = 40;
  let y = doc.y;

  const drawRow = (date, type, category, amount, note, isHeader = false) => {
    doc.font(isHeader ? "Helvetica-Bold" : "Helvetica");
    doc
      .text(date, startX, y, { width: 100 })
      .text(type, startX + 110, y, { width: 70 })
      .text(category, startX + 190, y, { width: 100 })
      .text(amount, startX + 300, y, { width: 80 })
      .text(note, startX + 390, y, { width: 120 });

    y += 20;
    doc
      .moveTo(startX, y - 5)
      .lineTo(550, y - 5)
      .strokeColor("#eeeeee")
      .stroke();
  };

  drawRow("Date", "Type", "Category", "Amount", "Note", true);
  y += 5;

  transactions.forEach((t) => {
    if (y > 700) {
      doc.addPage();
      y = 40;
    }
    drawRow(
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.category,
      parseFloat(t.amount).toFixed(2),
      t.note || "-",
    );
  });

  doc.end();
};
