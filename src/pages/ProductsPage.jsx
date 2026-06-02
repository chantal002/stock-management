import { useEffect, useState } from "react";
import api from "../api/client.js";

const fields = [
  { key: "productCode", col: "product_code", label: "Product Code" },
  { key: "productName", col: "product_name", label: "Product Name" },
  { key: "category", col: "category", label: "Category" },
  { key: "quantityInStock", col: "quantity_in_stock", label: "Quantity In Stock", type: "number" },
  { key: "unitPrice", col: "unit_price", label: "Unit Price", type: "number" },
  { key: "supplierName", col: "supplier_name", label: "Supplier Name" },
  { key: "dateReceived", col: "date_received", label: "Date Received", type: "date" },
];

const emptyForm = fields.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {});

const validateProduct = (form) => {
  const errors = {};
  if (!form.productCode.trim()) errors.productCode = "Product code is required.";
  else if (form.productCode.trim().length < 2) errors.productCode = "Code must be at least 2 characters.";
  if (!form.productName.trim()) errors.productName = "Product name is required.";
  if (!form.category.trim()) errors.category = "Category is required.";
  if (form.quantityInStock === "" || form.quantityInStock === undefined) {
    errors.quantityInStock = "Quantity in stock is required.";
  } else if (Number(form.quantityInStock) < 0 || Number.isNaN(Number(form.quantityInStock))) {
    errors.quantityInStock = "Enter a valid quantity (0 or greater).";
  }
  if (form.unitPrice === "" || form.unitPrice === undefined) {
    errors.unitPrice = "Unit price is required.";
  } else if (Number(form.unitPrice) <= 0 || Number.isNaN(Number(form.unitPrice))) {
    errors.unitPrice = "Unit price must be greater than 0.";
  }
  if (!form.supplierName.trim()) errors.supplierName = "Supplier name is required.";
  if (!form.dateReceived) errors.dateReceived = "Date received is required.";
  return errors;
};

export default function ProductsPage() {
  const [form, setForm] = useState(emptyForm);
  const [rows, setRows] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/products");
      setRows(data);
    } catch {
      setError("Failed to load records.");
    }
  };

  useEffect(() => { load(); }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const errors = validateProduct(form);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      await api.post("/products", form);
      setMessage("Product added successfully.");
      setForm(emptyForm);
      setFieldErrors({});
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (key) =>
    `mt-1 w-full rounded-lg border px-3 py-2 ${fieldErrors[key] ? "border-red-500" : "border-line"}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Products</h2>
        <p className="text-muted text-sm">Add new product records</p>
      </div>
      <form onSubmit={submit} className="bg-card rounded-xl border border-line p-6 grid gap-4 md:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className="block text-sm">
            <span className="font-medium text-ink">{f.label}</span>
            <input
              type={f.type || "text"}
              className={inputClass(f.key)}
              value={form[f.key]}
              onChange={(e) =>
                setField(f.key, f.key === "productCode" ? e.target.value.toUpperCase() : e.target.value)
              }
            />
            {fieldErrors[f.key] && <p className="text-red-600 text-xs mt-1">{fieldErrors[f.key]}</p>}
          </label>
        ))}
        <div className="md:col-span-2 flex flex-wrap gap-3 items-center">
          <button type="submit" disabled={loading} className="rounded-lg bg-accent text-accent-text px-5 py-2 font-semibold">
            {loading ? "Saving..." : "Add Product"}
          </button>
          {message && <span className="text-sm text-green-600">{message}</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
      <div className="bg-card rounded-xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left">
            <tr>{fields.map((f) => <th key={f.key} className="px-4 py-3">{f.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-line">
                {fields.map((f) => <td key={f.key} className="px-4 py-3">{String(row[f.col] ?? "").slice(0, 40)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
