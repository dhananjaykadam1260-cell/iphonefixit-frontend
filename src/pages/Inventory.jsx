import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Package,
  Plus,
  Power,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

import api from "../api/api";
import AdminLayout from "../components/AdminLayout";

const categories = [
  "Displays & Screens",
  "Batteries",
  "Chargers & Adapters",
  "Cables",
  "Cases & Covers",
  "Tempered Glass",
  "Camera Parts",
  "Speakers & Microphones",
  "Charging Ports",
  "Back Glass",
  "Accessories",
  "Other",
];

const emptyForm = {
  name: "",
  category: "",
  brand: "",
  price: "",
  stockQuantity: "",
  description: "",
};

function Inventory() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("ALL");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState("");

  const showMessage = (
    text,
    type = "success"
  ) => {
    setMessage(text);
    setMessageType(type);
  };

  const loadItems = useCallback(async () => {
    setLoading(true);

    try {
      const response =
        await api.get("/admin/items");

      setItems(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(error);

      showMessage(
        error.response?.data?.error ||
          "Unable to load inventory.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    const text =
      search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory =
        categoryFilter === "ALL" ||
        item.category === categoryFilter;

      const matchesSearch =
        !text ||
        item.name
          ?.toLowerCase()
          .includes(text) ||
        item.brand
          ?.toLowerCase()
          .includes(text) ||
        item.category
          ?.toLowerCase()
          .includes(text);

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [
    items,
    search,
    categoryFilter,
  ]);

  const change = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();

    setMessage("");

    const name =
      form.name.trim();

    const category =
      form.category.trim();

    const brand =
      form.brand.trim();

    const description =
      form.description.trim();

    const price =
      Number(form.price);

    const stock =
      Number(
        form.stockQuantity
      );

    if (!name) {
      showMessage(
        "Please enter item name.",
        "error"
      );
      return;
    }

    if (!category) {
      showMessage(
        "Please select a category.",
        "error"
      );
      return;
    }

    if (
      form.price !== "" &&
      (
        Number.isNaN(price) ||
        price < 0
      )
    ) {
      showMessage(
        "Please enter a valid price.",
        "error"
      );
      return;
    }

    if (
      form.stockQuantity !== "" &&
      (
        Number.isNaN(stock) ||
        stock < 0 ||
        !Number.isInteger(stock)
      )
    ) {
      showMessage(
        "Stock must be a whole number.",
        "error"
      );
      return;
    }

    const payload = {
      name,
      category,
      brand,

      price:
        form.price === ""
          ? 0
          : price,

      stockQuantity:
        form.stockQuantity === ""
          ? 0
          : stock,

      description,
    };

    setSaving(true);

    try {
      if (editingId) {
        const existing =
          items.find(
            (item) =>
              item.id === editingId
          );

        await api.put(
          `/admin/items/${editingId}`,
          {
            ...payload,

            imageUrl:
              existing?.imageUrl ||
              null,

            active:
              existing?.active ??
              true,
          }
        );

        showMessage(
          "Item updated successfully."
        );
      } else {
        await api.post(
          "/admin/items",
          {
            ...payload,
            active: true,
          }
        );

        showMessage(
          "Item added successfully."
        );
      }

      resetForm();

      await loadItems();

    } catch (error) {
      console.error(error);

      showMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Unable to save item.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const editItem = (item) => {
    setEditingId(item.id);

    setForm({
      name:
        item.name || "",

      category:
        item.category || "",

      brand:
        item.brand || "",

      price:
        item.price ?? "",

      stockQuantity:
        item.stockQuantity ?? "",

      description:
        item.description || "",
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const updateStatus =
    async (item) => {

      try {
        await api.put(
          `/admin/items/${item.id}/status`,
          null,
          {
            params: {
              active:
                !item.active,
            },
          }
        );

        showMessage(
          !item.active
            ? `${item.name} enabled.`
            : `${item.name} disabled.`
        );

        await loadItems();

      } catch (error) {
        console.error(error);

        showMessage(
          error.response?.data?.error ||
            "Unable to update status.",
          "error"
        );
      }
    };

  const deleteItem =
    async (item) => {

      if (
        !window.confirm(
          `Delete "${item.name}"?`
        )
      ) {
        return;
      }

      try {
        await api.delete(
          `/admin/items/${item.id}`
        );

        if (
          editingId === item.id
        ) {
          resetForm();
        }

        showMessage(
          "Item deleted successfully."
        );

        await loadItems();

      } catch (error) {
        console.error(error);

        showMessage(
          error.response?.data?.error ||
            "Unable to delete item.",
          "error"
        );
      }
    };

  return (
    <AdminLayout>

      <div className="page-heading">

        <div>
          <span className="page-overline">
            STORE MANAGEMENT
          </span>

          <h1>
            Inventory
          </h1>

          <p>
            Manage products by
            category, price and stock.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={loadItems}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={
              loading
                ? "spin-icon"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {message && (
        <div
          className={
            messageType === "error"
              ? "error-message"
              : "success-message"
          }
        >
          {messageType === "error" ? (
            <AlertCircle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}

          {message}
        </div>
      )}

      <div className="inventory-layout">

        {/* ADD / EDIT */}

        <section className="ui-card">

          <div className="card-heading">

            <div>
              <h2>
                {editingId
                  ? "Edit Item"
                  : "Add New Item"}
              </h2>

              <p>
                Product information
              </p>
            </div>

            <div className="form-section-icon">
              <Package size={20} />
            </div>

          </div>

          <form
            className="inventory-form"
            onSubmit={submit}
          >

            <Field
              label="Item Name"
              name="name"
              value={form.name}
              change={change}
              placeholder="20W Fast Charger"
              required
            />

            <div className="app-field">

              <label>
                Category *
              </label>

              <select
                className="app-select"
                name="category"
                value={form.category}
                onChange={change}
                required
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}

              </select>

            </div>

            <Field
              label="Brand"
              name="brand"
              value={form.brand}
              change={change}
              placeholder="Apple"
            />

            <div className="form-two">

              <Field
                label="Price (₹)"
                name="price"
                type="number"
                value={form.price}
                change={change}
                placeholder="1499"
                min="0"
                step="0.01"
              />

              <Field
                label="Stock Quantity"
                name="stockQuantity"
                type="number"
                value={
                  form.stockQuantity
                }
                change={change}
                placeholder="10"
                min="0"
                step="1"
              />

            </div>

            <div className="app-field">

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={
                  form.description
                }
                onChange={change}
                placeholder="Enter item description..."
              />

            </div>

            <div className="inventory-form-actions">

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >

                {editingId ? (
                  <>
                    <Save size={17} />

                    {saving
                      ? "Updating..."
                      : "Update Item"}
                  </>
                ) : (
                  <>
                    <Plus size={17} />

                    {saving
                      ? "Adding..."
                      : "Add Item"}
                  </>
                )}

              </button>

              {editingId && (

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  <X size={17} />
                  Cancel
                </button>

              )}

            </div>

          </form>

        </section>

        {/* ITEMS */}

        <section className="ui-card">

          <div className="card-heading">

            <div>
              <h2>
                Store Items
              </h2>

              <p>
                {filteredItems.length}
                {" "}
                item
                {filteredItems.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <Package size={20} />

          </div>

          {/* SEARCH */}

          <div className="inventory-search">

            <Search size={17} />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search item, brand or category..."
            />

          </div>

          {/* CATEGORY FILTER */}

          <div className="category-filters">

            <button
              type="button"
              className={
                categoryFilter ===
                "ALL"
                  ? "category-filter active"
                  : "category-filter"
              }
              onClick={() =>
                setCategoryFilter(
                  "ALL"
                )
              }
            >
              All
            </button>

            {categories.map(
              (category) => (

                <button
                  type="button"
                  key={category}
                  className={
                    categoryFilter ===
                    category
                      ? "category-filter active"
                      : "category-filter"
                  }
                  onClick={() =>
                    setCategoryFilter(
                      category
                    )
                  }
                >
                  {category}
                </button>

              )
            )}

          </div>

          {loading ? (

            <div className="inventory-empty">

              <RefreshCw
                size={25}
                className="spin-icon"
              />

              Loading inventory...

            </div>

          ) : filteredItems.length ===
            0 ? (

            <div className="inventory-empty">

              <Package size={35} />

              <strong>
                No items found
              </strong>

              <span>
                Try another category
                or search.
              </span>

            </div>

          ) : (

            <div className="inventory-list">

              {filteredItems.map(
                (item) => {

                  const stock =
                    Number(
                      item.stockQuantity ??
                        0
                    );

                  return (
                    <div
                      className={`inventory-item ${
                        !item.active
                          ? "inventory-item-disabled"
                          : ""
                      }`}
                      key={item.id}
                    >

                      <div className="inventory-item-info">

                        <div className="inventory-item-title">

                          <strong>
                            {item.name}
                          </strong>

                          {!item.active && (
                            <span className="item-disabled-badge">
                              Disabled
                            </span>
                          )}

                        </div>

                        <span>
                          {item.brand ||
                            "No brand"}
                          {" · "}
                          {item.category ||
                            "Other"}
                        </span>

                        <small>
                          ₹
                          {Number(
                            item.price || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                          {" · "}
                          Stock: {stock}
                        </small>

                      </div>

                      <div className="inventory-actions">

                        <span
                          className={
                            stock > 0
                              ? "stock-available"
                              : "stock-empty"
                          }
                        >
                          {stock > 0
                            ? "In Stock"
                            : "Out of Stock"}
                        </span>

                        <button
                          type="button"
                          className="btn-small"
                          onClick={() =>
                            editItem(item)
                          }
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          className={
                            item.active
                              ? "inventory-status-btn active"
                              : "inventory-status-btn"
                          }
                          onClick={() =>
                            updateStatus(
                              item
                            )
                          }
                        >
                          <Power size={15} />
                        </button>

                        <button
                          type="button"
                          className="inventory-delete"
                          onClick={() =>
                            deleteItem(
                              item
                            )
                          }
                        >
                          <Trash2
                            size={15}
                          />
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>

      </div>

    </AdminLayout>
  );
}

function Field({
  label,
  name,
  value,
  change,
  type = "text",
  placeholder = "",
  required = false,
  min,
  step,
}) {
  return (
    <div className="app-field">

      <label>
        {label}
        {required
          ? " *"
          : ""}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={change}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
      />

    </div>
  );
}

export default Inventory;