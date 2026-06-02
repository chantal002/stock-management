import { query } from "../config/db.js";

export const getReports = async (req, res) => {
  try {
    const period = req.query.period || "daily";
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const month = req.query.month || date.slice(0, 7);

    const products = await query("SELECT * FROM products");
    const warehouses = await query("SELECT * FROM warehouses");

    let stockIn;
    let stockOut;

    if (period === "daily") {
      stockIn = await query(
        "SELECT * FROM stock_transactions WHERE transaction_type = 'IN' AND DATE(transaction_date) = ?",
        [date]
      );
      stockOut = await query(
        "SELECT * FROM stock_transactions WHERE transaction_type = 'OUT' AND DATE(transaction_date) = ?",
        [date]
      );
    } else if (period === "weekly") {
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required for weekly reports." });
      }
      stockIn = await query(
        "SELECT * FROM stock_transactions WHERE transaction_type = 'IN' AND DATE(transaction_date) BETWEEN ? AND ?",
        [startDate, endDate]
      );
      stockOut = await query(
        "SELECT * FROM stock_transactions WHERE transaction_type = 'OUT' AND DATE(transaction_date) BETWEEN ? AND ?",
        [startDate, endDate]
      );
    } else {
      stockIn = await query(
        "SELECT * FROM stock_transactions WHERE transaction_type = 'IN' AND DATE_FORMAT(transaction_date, '%Y-%m') = ?",
        [month]
      );
      stockOut = await query(
        "SELECT * FROM stock_transactions WHERE transaction_type = 'OUT' AND DATE_FORMAT(transaction_date, '%Y-%m') = ?",
        [month]
      );
    }

    return res.json({ period, reports: { products, warehouses, stockIn, stockOut } });
  } catch {
    return res.status(500).json({ message: "Failed to generate reports." });
  }
};
