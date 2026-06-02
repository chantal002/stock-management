import { useEffect, useState } from "react";
import api from "../api/client.js";

const TRANSACTION_TYPES = ["IN", "OUT"];

const emptyForm = {
  transactionDate: "",
  quantityMoved: "",
  transactionType: "",
  productCode: "",
  warehouseCode: "",
};

const toDatetimeLocal = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 16);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const validateTransaction = (form, products, warehouses) => {
  const errors = {};
  if (!form.transactionDate) errors.transactionDate = "Transaction date is required.";
  if (form.quantityMoved === "" || form.quantityMoved === undefined) {
    errors.quantityMoved = "Quantity is required.";
  } else if (Number(form.quantityMoved) <= 0) {
    errors.quantityMoved = "Quantity must be greater than 0.";
  }
  if (!form.transactionType) errors.transactionType = "Select transaction type.";
  else if (!TRANSACTION_TYPES.includes(form.transactionType)) {
    errors.transactionType = "Select IN or OUT.";
  }
  if (!form.productCode) errors.productCode = "Select a product from the list.";
  else if (!products.some((p) => p.product_code === form.productCode)) {
    errors.productCode = "Selected product is not valid.";
  }
  if (!form.warehouseCode) errors.warehouseCode = "Select a warehouse from the list.";
  else if (!warehouses.some((w) => w.warehouse_code === form.warehouseCode)) {
    errors.warehouseCode = "Selected warehouse is not valid.";
  }
  return errors;
};

export default function TransactionsPage() {
  const [form, setForm] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [rows, setRows] = useState([]);
  const [editId, setEditId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadTransactions = async () => {
    try {
      const { data } = await api.get("/transactions");
      setRows(data);
    } catch {
      setError("Failed to load records.");
    }
  };

  const loadProducts = async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch {
      setError("Failed to load products.");
    }
  };

  const loadWarehouses = async () => {
    try {
      const { data } = await api.get("/warehouses");
      setWarehouses(data);
    } catch {
      setError("Failed to load warehouses.");
    }
  };

  useEffect(() => {
    loadTransactions();
    loadProducts();
    loadWarehouses();
  }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const errors = validateTransaction(form, products, warehouses);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/transactions/${editId}`, form);
        setMessage("Transaction updated.");
      } else {
        await api.post("/transactions", form);
        setMessage("Transaction added.");
      }
      setForm(emptyForm);
      setEditId(null);
      setFieldErrors({});
      loadTransactions();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (row) => {
    setEditId(row.transaction_id);
    setForm({
      transactionDate: toDatetimeLocal(row.transaction_date),
      quantityMoved: String(row.quantity_moved ?? ""),
      transactionType: row.transaction_type ?? "",
      productCode: row.product_code ?? "",
      warehouseCode: row.warehouse_code ?? "",
    });
    setFieldErrors({});
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      loadTransactions();
    } catch {
      setError("Delete failed.");
    }
  };

  const inputClass = (key) =>
    `mt-1 w-full rounded-lg border px-3 py-2 ${fieldErrors[key] ? "border-red-500" : "border-line"}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Stock Transactions</h2>
        <p className="text-muted text-sm">Manage transactions with full CRUD</p>
      </div>
      <form onSubmit={submit} className="bg-card rounded-xl border border-line p-6 grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Transaction Date</span>
          <input
            type="datetime-local"
            className={inputClass("transactionDate")}
            value={form.transactionDate}
            onChange={(e) => setField("transactionDate", e.target.value)}
          />
          {fieldErrors.transactionDate && <p className="text-red-600 text-xs mt-1">{fieldErrors.transactionDate}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Quantity Moved</span>
          <input
            type="number"
            min="1"
            className={inputClass("quantityMoved")}
            value={form.quantityMoved}
            onChange={(e) => setField("quantityMoved", e.target.value)}
          />
          {fieldErrors.quantityMoved && <p className="text-red-600 text-xs mt-1">{fieldErrors.quantityMoved}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Type</span>
          <select
            className={inputClass("transactionType")}
            value={form.transactionType}
            onChange={(e) => setField("transactionType", e.target.value)}
          >
            <option value="">Select type</option>
            {TRANSACTION_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {fieldErrors.transactionType && <p className="text-red-600 text-xs mt-1">{fieldErrors.transactionType}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Product</span>
          <select
            className={inputClass("productCode")}
            value={form.productCode}
            onChange={(e) => setField("productCode", e.target.value)}
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.product_code} value={p.product_code}>
                {p.product_code} — {p.product_name}
              </option>
            ))}
          </select>
          {fieldErrors.productCode && <p className="text-red-600 text-xs mt-1">{fieldErrors.productCode}</p>}
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="font-medium text-ink">Warehouse</span>
          <select
            className={inputClass("warehouseCode")}
            value={form.warehouseCode}
            onChange={(e) => setField("warehouseCode", e.target.value)}
          >
            <option value="">Select warehouse</option>
            {warehouses.map((w) => (
              <option key={w.warehouse_code} value={w.warehouse_code}>
                {w.warehouse_code} — {w.warehouse_name}
              </option>
            ))}
          </select>
          {fieldErrors.warehouseCode && <p className="text-red-600 text-xs mt-1">{fieldErrors.warehouseCode}</p>}
        </label>
        <div className="md:col-span-2 flex flex-wrap gap-3 items-center">
          <button type="submit" disabled={loading} className="rounded-lg bg-accent text-accent-text px-5 py-2 font-semibold">
            {loading ? "Saving..." : editId ? "Update" : "Add"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => { setEditId(null); setForm(emptyForm); setFieldErrors({}); }}
              className="rounded-lg border border-line px-5 py-2"
            >
              Cancel
            </button>
          )}
          {message && <span className="text-sm text-green-600">{message}</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
      <div className="bg-card rounded-xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Warehouse</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.transaction_id} className="border-t border-line">
                <td className="px-4 py-3">{String(row.transaction_date ?? "").slice(0, 19)}</td>
                <td className="px-4 py-3">{row.quantity_moved}</td>
                <td className="px-4 py-3">{row.transaction_type}</td>
                <td className="px-4 py-3">{row.product_code}</td>
                <td className="px-4 py-3">{row.warehouse_code}</td>
                <td className="px-4 py-3 space-x-2">
                  <button type="button" onClick={() => startEdit(row)} className="text-accent font-medium">Edit</button>
                  <button type="button" onClick={() => remove(row.transaction_id)} className="text-red-600 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
