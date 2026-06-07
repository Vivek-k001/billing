import React, { useEffect, useMemo, useState } from "react";
import { Clock3, PackageMinus, PackagePlus, RefreshCcw } from "lucide-react";
import Sidebar from "../components/sidebar";
import "./dashboard.css";
import "./updateStock.css";

const STORAGE_KEY = "demoStockProducts";
const HISTORY_KEY = "demoStockHistory";

const DUMMY_PRODUCTS = [
  { _id: "prd-001", productName: "Canon IR 2520 Toner", stock: 43 },
  { _id: "prd-002", productName: "Ricoh MP 2014 Drum Unit", stock: 18 },
  { _id: "prd-003", productName: "Kyocera TK-1170 Cartridge", stock: 7 },
  { _id: "prd-004", productName: "A4 Copier Paper Ream", stock: 125 },
  { _id: "prd-005", productName: "Sharp MX Developer", stock: 3 },
];

const DUMMY_HISTORY = [
  {
    _id: "hst-003",
    username: "admin",
    productName: "A4 Copier Paper Ream",
    quantity: 5,
    action: "add",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "hst-002",
    username: "staff",
    productName: "Sharp MX Developer",
    quantity: 1,
    action: "reduce",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "hst-001",
    username: "admin",
    productName: "Canon IR 2520 Toner",
    quantity: 20,
    action: "add",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const readStoredData = (key, fallback) => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch {
    return fallback;
  }
};

const formatRelativeTime = (dateValue) => {
  const createdAt = new Date(dateValue).getTime();
  const diffMs = Date.now() - createdAt;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (Number.isNaN(createdAt) || diffMs < minute) return "1m ago";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  if (diffMs < week) return `${Math.floor(diffMs / day)}d ago`;
  return `${Math.floor(diffMs / week)}w ago`;
};

const getProductName = (product) =>
  product?.productName || product?.name || product?.title || "Unnamed Product";

const StockFormCard = ({
  action,
  title,
  icon,
  products,
  selectedId,
  quantity,
  message,
  isSaving,
  onProductChange,
  onQuantityChange,
  onSubmit,
}) => {
  const selectedProduct = products.find((product) => product._id === selectedId);
  const currentStock = selectedProduct?.stock ?? selectedProduct?.quantity ?? 0;
  const isReduce = action === "reduce";

  return (
    <div className="card stock-card">
      <div className="stock-card-title">
        <span className={`stock-card-icon ${isReduce ? "reduce" : "add"}`}>{icon}</span>
        <h3>{title}</h3>
      </div>

      <div className="stock-form">
        <div className="form-group">
          <label>Product</label>
          <select value={selectedId} onChange={(event) => onProductChange(event.target.value)}>
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {getProductName(product)}
              </option>
            ))}
          </select>
        </div>

        <div className="stock-current-box">
          <span>Current Stock</span>
          <strong>{selectedId ? currentStock : "--"}</strong>
        </div>

        <div className="form-group">
          <label>Quantity to {isReduce ? "Reduce" : "Add"}</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => onQuantityChange(event.target.value)}
            placeholder="0"
          />
        </div>

        {message.text && (
          <div className={`stock-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <button className="btn-primary stock-update-btn" onClick={onSubmit} disabled={isSaving}>
          {isSaving ? <RefreshCcw size={15} className="stock-spin" /> : icon}
          Update
        </button>
      </div>
    </div>
  );
};

const UpdateStock = () => {
  const username = localStorage.getItem("username") || "user";
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [addProductId, setAddProductId] = useState("");
  const [reduceProductId, setReduceProductId] = useState("");
  const [addQuantity, setAddQuantity] = useState("");
  const [reduceQuantity, setReduceQuantity] = useState("");
  const [addMessage, setAddMessage] = useState({ type: "", text: "" });
  const [reduceMessage, setReduceMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [savingAction, setSavingAction] = useState("");

  const selectedReduceProduct = useMemo(
    () => products.find((product) => product._id === reduceProductId),
    [products, reduceProductId]
  );

  useEffect(() => {
    setProducts(readStoredData(STORAGE_KEY, DUMMY_PRODUCTS));
    setHistory(readStoredData(HISTORY_KEY, DUMMY_HISTORY));
    setIsLoading(false);
  }, []);

  const applyUpdatedProduct = (updatedProduct) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
  };

  useEffect(() => {
    if (!isLoading) localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [isLoading, products]);

  useEffect(() => {
    if (!isLoading) localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history, isLoading]);

  const handleStockUpdate = async (action) => {
    const isAdd = action === "add";
    const productId = isAdd ? addProductId : reduceProductId;
    const quantityValue = Number(isAdd ? addQuantity : reduceQuantity);
    const setMessage = isAdd ? setAddMessage : setReduceMessage;

    setMessage({ type: "", text: "" });

    if (!productId) {
      setMessage({ type: "error", text: "Please select a product" });
      return;
    }

    if (!Number.isInteger(quantityValue) || quantityValue <= 0) {
      setMessage({ type: "error", text: "Enter a valid quantity" });
      return;
    }

    if (!isAdd) {
      const availableStock = selectedReduceProduct?.stock ?? selectedReduceProduct?.quantity ?? 0;
      if (quantityValue > availableStock) {
        setMessage({ type: "error", text: "Cannot reduce more than available stock" });
        return;
      }
    }

    setSavingAction(action);

    try {
      const selectedProduct = products.find((product) => product._id === productId);
      const currentStock = selectedProduct?.stock ?? selectedProduct?.quantity ?? 0;
      const updatedProduct = {
        ...selectedProduct,
        stock: isAdd ? currentStock + quantityValue : currentStock - quantityValue,
      };
      const nextHistoryItem = {
        _id: `hst-${Date.now()}`,
        username,
        productName: getProductName(selectedProduct),
        quantity: quantityValue,
        action,
        createdAt: new Date().toISOString(),
      };

      applyUpdatedProduct(updatedProduct);
      setHistory((currentHistory) => [nextHistoryItem, ...currentHistory].slice(0, 12));
      setMessage({ type: "success", text: "Stock updated successfully" });

      if (isAdd) setAddQuantity("");
      else setReduceQuantity("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Unable to update stock",
      });
    } finally {
      setSavingAction("");
    }
  };

  return (
    <div className="page-layout">
      <Sidebar />

      <div className="page-main">
        <div className="page-header">
          <div>
            <h2 className="page-title">Update Stock</h2>
            <p className="page-subtitle">Add or reduce product stock with automatic history</p>
          </div>
        </div>

        <div className="stock-layout">
          <StockFormCard
            action="add"
            title="Add Stock"
            icon={<PackagePlus size={15} />}
            products={products}
            selectedId={addProductId}
            quantity={addQuantity}
            message={addMessage}
            isSaving={savingAction === "add"}
            onProductChange={setAddProductId}
            onQuantityChange={setAddQuantity}
            onSubmit={() => handleStockUpdate("add")}
          />

          <StockFormCard
            action="reduce"
            title="Reduce Stock"
            icon={<PackageMinus size={15} />}
            products={products}
            selectedId={reduceProductId}
            quantity={reduceQuantity}
            message={reduceMessage}
            isSaving={savingAction === "reduce"}
            onProductChange={setReduceProductId}
            onQuantityChange={setReduceQuantity}
            onSubmit={() => handleStockUpdate("reduce")}
          />

          <aside className="stock-history-panel">
            <div className="stock-history-heading">
              <span><Clock3 size={15} /></span>
              <h3>History</h3>
            </div>

            <div className="stock-history-list">
              {isLoading && <div className="stock-history-empty">Loading history...</div>}
              {!isLoading && history.length === 0 && (
                <div className="stock-history-empty">No stock updates yet</div>
              )}

              {history.map((item) => {
                const sign = item.action === "add" ? "+" : "-";
                return (
                  <div className="stock-note" key={item._id}>
                    <div className="stock-note-main">
                      <strong>{item.username}</strong>
                      <span className={item.action === "add" ? "stock-plus" : "stock-minus"}>
                        {sign}{item.quantity} stocks
                      </span>
                      <em>{formatRelativeTime(item.createdAt)}</em>
                    </div>
                    <div className="stock-note-product">{item.productName}</div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default UpdateStock;
