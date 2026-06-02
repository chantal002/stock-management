import { query } from "../config/db.js";

const validateRefs = async (productCode, warehouseCode) => {
  const product = await query("SELECT product_code FROM products WHERE product_code = ?", [productCode]);
  if (!product.length) return "Selected product does not exist.";
  const warehouse = await query("SELECT warehouse_code FROM warehouses WHERE warehouse_code = ?", [warehouseCode]);
  if (!warehouse.length) return "Selected warehouse does not exist.";
  return null;
};

export const create = async (req, res) => {
  try {
    if (!req.body.transactionDate) return res.status(400).json({ message: "Transaction Date is required." });
    if (req.body.quantityMoved === undefined || req.body.quantityMoved === "") return res.status(400).json({ message: "Quantity Moved is required." });
    if (!req.body.transactionType) return res.status(400).json({ message: "Type (IN/OUT) is required." });
    if (!req.body.productCode) return res.status(400).json({ message: "Product Code is required." });
    if (!req.body.warehouseCode) return res.status(400).json({ message: "Warehouse Code is required." });
    const refError = await validateRefs(req.body.productCode, req.body.warehouseCode);
    if (refError) return res.status(400).json({ message: refError });
    const values = [req.body.transactionDate, req.body.quantityMoved, req.body.transactionType, req.body.productCode, req.body.warehouseCode];
    await query("INSERT INTO stock_transactions (transaction_date, quantity_moved, transaction_type, product_code, warehouse_code) VALUES (?, ?, ?, ?, ?)", values);
    return res.status(201).json({ message: "Transaction added successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Transaction already exists." });
    }
    return res.status(500).json({ message: "Failed to add transaction." });
  }
};

export const getAll = async (_req, res) => {
  try {
    const rows = await query("SELECT * FROM stock_transactions ORDER BY transaction_id DESC");
    return res.json(rows);
  } catch {
    return res.status(500).json({ message: "Failed to fetch transaction records." });
  }
};

export const update = async (req, res) => {
  try {
    if (!req.body.transactionDate) return res.status(400).json({ message: "Transaction Date is required." });
    if (req.body.quantityMoved === undefined || req.body.quantityMoved === "") return res.status(400).json({ message: "Quantity Moved is required." });
    if (!req.body.transactionType) return res.status(400).json({ message: "Type (IN/OUT) is required." });
    if (!req.body.productCode) return res.status(400).json({ message: "Product Code is required." });
    if (!req.body.warehouseCode) return res.status(400).json({ message: "Warehouse Code is required." });
    const refError = await validateRefs(req.body.productCode, req.body.warehouseCode);
    if (refError) return res.status(400).json({ message: refError });
    const values = [req.body.transactionDate, req.body.quantityMoved, req.body.transactionType, req.body.productCode, req.body.warehouseCode, req.params.id];
    const result = await query("UPDATE stock_transactions SET transaction_date = ?, quantity_moved = ?, transaction_type = ?, product_code = ?, warehouse_code = ? WHERE transaction_id = ?", values);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Transaction not found." });
    }
    return res.json({ message: "Transaction updated successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to update transaction." });
  }
};

export const remove = async (req, res) => {
  try {
    const result = await query("DELETE FROM stock_transactions WHERE transaction_id = ?", [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Transaction not found." });
    }
    return res.json({ message: "Transaction deleted successfully." });
  } catch {
    return res.status(500).json({ message: "Failed to delete transaction." });
  }
};
