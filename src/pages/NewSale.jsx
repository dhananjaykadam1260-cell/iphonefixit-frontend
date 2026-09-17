import { useEffect, useMemo, useState } from "react";
import {
  Minus,
  Package,
  Plus,
  ReceiptText,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import api from "../api/api";
import AdminLayout from "../components/AdminLayout";

function NewSale() {
  const [inventory, setInventory] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [selectedItemId, setSelectedItemId] = useState("");
  const [cart, setCart] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const response = await api.get("/items");

      const activeItems = Array.isArray(response.data)
        ? response.data.filter(
            (item) =>
              item.active !== false &&
              Number(item.stockQuantity || 0) > 0
          )
        : [];

      setInventory(activeItems);
    } catch (err) {
      console.error(err);
      setError("Unable to load inventory.");
    }
  };

  const addItem = () => {
    setError("");

    if (!selectedItemId) {
      setError("Please select an item.");
      return;
    }

    const item = inventory.find(
      (inventoryItem) =>
        Number(inventoryItem.id) === Number(selectedItemId)
    );

    if (!item) {
      setError("Item not found.");
      return;
    }

    const existing = cart.find(
      (cartItem) => cartItem.id === item.id
    );

    if (existing) {
      if (
        existing.quantity >= Number(item.stockQuantity)
      ) {
        setError("Maximum available stock reached.");
        return;
      }

      setCart((current) =>
        current.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem
        )
      );
    } else {
      setCart((current) => [
        ...current,
        {
          id: item.id,
          name: item.name,
          category: item.category,
          brand: item.brand,
          price: Number(item.price || 0),
          stockQuantity: Number(item.stockQuantity || 0),
          quantity: 1,
        },
      ]);
    }

    setSelectedItemId("");
  };

  const increaseQuantity = (item) => {
    if (item.quantity >= item.stockQuantity) {
      setError("Maximum available stock reached.");
      return;
    }

    setError("");

    setCart((current) =>
      current.map((cartItem) =>
        cartItem.id === item.id
          ? {
              ...cartItem,
              quantity: cartItem.quantity + 1,
            }
          : cartItem
      )
    );
  };

  const decreaseQuantity = (item) => {
    if (item.quantity <= 1) {
      removeItem(item.id);
      return;
    }

    setCart((current) =>
      current.map((cartItem) =>
        cartItem.id === item.id
          ? {
              ...cartItem,
              quantity: cartItem.quantity - 1,
            }
          : cartItem
      )
    );
  };

  const removeItem = (id) => {
    setCart((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const totalAmount = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );
  }, [cart]);

  const createSale = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (!/^\d{10,15}$/.test(phoneNumber.trim())) {
      setError("Enter a valid phone number.");
      return;
    }

    if (cart.length === 0) {
      setError("Add at least one item.");
      return;
    }

    const payload = {
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),

      items: cart.map((item) => ({
        itemId: item.id,
        quantity: item.quantity,
      })),
    };

    setLoading(true);

    try {
      const response = await api.post(
        "/sales",
        payload
      );

      setMessage(
        `Sale created successfully. Invoice: ${
          response.data?.invoiceNumber ||
          response.data?.id ||
          ""
        }`
      );

      setCustomerName("");
      setPhoneNumber("");
      setCart([]);
      setSelectedItemId("");

      await loadInventory();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Unable to create sale."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="page-heading">
        <div>
          <span className="page-overline">
            INVENTORY BILLING
          </span>

          <h1>New Sale</h1>

          <p>
            Create a customer bill for store items.
          </p>
        </div>

        <ShoppingCart size={26} />
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form
        className="sale-layout"
        onSubmit={createSale}
      >
        <div>
          <section className="ui-card">
            <div className="card-heading">
              <div>
                <h2>Customer Details</h2>
                <p>
                  Customer information for invoice
                </p>
              </div>

              <ReceiptText size={20} />
            </div>

            <div className="form-two">
              <div className="app-field">
                <label>Customer Name *</label>

                <input
                  type="text"
                  value={customerName}
                  onChange={(e) =>
                    setCustomerName(e.target.value)
                  }
                  placeholder="Customer name"
                  required
                />
              </div>

              <div className="app-field">
                <label>Phone Number *</label>

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={15}
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(
                      e.target.value.replace(
                        /[^0-9]/g,
                        ""
                      )
                    )
                  }
                  placeholder="9876543210"
                  required
                />
              </div>
            </div>
          </section>

          <section className="ui-card">
            <div className="card-heading">
              <div>
                <h2>Add Products</h2>
                <p>
                  Select inventory items
                </p>
              </div>

              <Package size={20} />
            </div>

            <div className="sale-product-selector">
              <select
                className="app-select"
                value={selectedItemId}
                onChange={(e) =>
                  setSelectedItemId(e.target.value)
                }
              >
                <option value="">
                  Select inventory item
                </option>

                {inventory.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                    {" — ₹"}
                    {Number(
                      item.price || 0
                    ).toLocaleString("en-IN")}
                    {" — Stock "}
                    {item.stockQuantity}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="btn btn-primary"
                onClick={addItem}
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </section>

          <section className="ui-card">
            <div className="card-heading">
              <div>
                <h2>Bill Items</h2>

                <p>
                  {cart.length} product
                  {cart.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="inventory-empty">
                <ShoppingCart size={34} />

                <strong>No items added</strong>

                <span>
                  Select an inventory item above.
                </span>
              </div>
            ) : (
              <div className="sale-items-list">
                {cart.map((item) => (
                  <div
                    className="sale-item"
                    key={item.id}
                  >
                    <div className="sale-item-info">
                      <strong>{item.name}</strong>

                      <span>
                        {item.brand || "No brand"}
                        {" · "}
                        {item.category || "Other"}
                      </span>

                      <small>
                        ₹
                        {item.price.toLocaleString(
                          "en-IN"
                        )}{" "}
                        each
                      </small>
                    </div>

                    <div className="sale-item-controls">
                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity(item)
                        }
                      >
                        <Minus size={14} />
                      </button>

                      <strong>
                        {item.quantity}
                      </strong>

                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity(item)
                        }
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <strong className="sale-line-total">
                      ₹
                      {(
                        item.price *
                        item.quantity
                      ).toLocaleString("en-IN")}
                    </strong>

                    <button
                      type="button"
                      className="inventory-delete"
                      onClick={() =>
                        removeItem(item.id)
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="ui-card sale-summary">
          <h2>Bill Summary</h2>

          <div className="sale-summary-row">
            <span>Items</span>

            <strong>
              {cart.reduce(
                (count, item) =>
                  count + item.quantity,
                0
              )}
            </strong>
          </div>

          <div className="sale-summary-total">
            <span>Total</span>

            <strong>
              ₹
              {totalAmount.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <button
            type="submit"
            className="btn btn-primary full-button"
            disabled={
              loading ||
              cart.length === 0
            }
          >
            <ReceiptText size={17} />

            {loading
              ? "Creating Bill..."
              : "Create Sale Bill"}
          </button>
        </aside>
      </form>
    </AdminLayout>
  );
}

export default NewSale;