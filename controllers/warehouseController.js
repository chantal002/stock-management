import { query } from "../config/db.js";

export const create = async (req, res) => {
  try {
    if (!req.body.warehouseCode) return res.status(400).json({ message: "Warehouse Code is required." });
    if (!req.body.warehouseName) return res.status(400).json({ message: "Warehouse Name is required." });
    if (!req.body.warehouseLocation) return res.status(400).json({ message: "Location is required." });
    const values = [req.body.warehouseCode, req.body.warehouseName, req.body.warehouseLocation];
    await query("INSERT INTO warehouses (warehouse_code, warehouse_name, warehouse_location) VALUES (?, ?, ?)", values);
    return res.status(201).json({ message: "Warehouse added successfully." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Warehouse already exists." });
    }
    return res.status(500).json({ message: "Failed to add warehouse." });
  }
};

export const getAll = async (_req, res) => {
  try {
    const rows = await query("SELECT * FROM warehouses ORDER BY warehouse_code DESC");
    return res.json(rows);
  } catch {
    return res.status(500).json({ message: "Failed to fetch warehouse records." });
  }
};