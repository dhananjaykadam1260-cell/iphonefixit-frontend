import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Download,
  History,
  ReceiptText,
  RefreshCw,
  Search,
} from "lucide-react";

import api from "../api/api";
import AdminLayout from "../components/AdminLayout";

function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiUrl =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api";

  const loadSales = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await api.get("/sales");

      setSales(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "Sales loading error:",
        err
      );

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Unable to load sales history."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const filteredSales =
    useMemo(() => {
      const text =
        search
          .trim()
          .toLowerCase();

      if (!text) {
        return sales;
      }

      return sales.filter(
        (sale) => {
          return (
            sale.invoiceNumber
              ?.toLowerCase()
              .includes(text) ||
            sale.customerName
              ?.toLowerCase()
              .includes(text) ||
            sale.phoneNumber
              ?.toLowerCase()
              .includes(text) ||
            String(
              sale.id || ""
            ).includes(text)
          );
        }
      );
    }, [sales, search]);

  const totalRevenue =
    useMemo(() => {
      return sales.reduce(
        (total, sale) =>
          total +
          Number(
            sale.totalAmount || 0
          ),
        0
      );
    }, [sales]);

  const downloadBill = (saleId) => {
    window.open(
      `${apiUrl}/sales/${saleId}/bill`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getItemCount = (sale) => {
    if (
      !Array.isArray(
        sale.items
      )
    ) {
      return 0;
    }

    return sale.items.reduce(
      (total, item) =>
        total +
        Number(
          item.quantity || 0
        ),
      0
    );
  };

  return (
    <AdminLayout>
      <div className="page-heading">
        <div>
          <span className="page-overline">
            INVENTORY BILLING
          </span>

          <h1>Sales History</h1>

          <p>
            View inventory sales,
            invoices and customer
            purchase history.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={loadSales}
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

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="sales-summary-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <ReceiptText size={18} />
          </div>

          <span>
            Total Sales
          </span>

          <strong>
            {sales.length}
          </strong>

          <small>
            Inventory invoices
          </small>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon">
            <History size={18} />
          </div>

          <span>
            Sales Revenue
          </span>

          <strong>
            ₹
            {totalRevenue.toLocaleString(
              "en-IN"
            )}
          </strong>

          <small>
            Total product sales
          </small>
        </div>
      </div>

      <section className="ui-card">
        <div className="card-heading">
          <div>
            <h2>
              Sales Invoices
            </h2>

            <p>
              {filteredSales.length}{" "}
              invoice
              {filteredSales.length !==
              1
                ? "s"
                : ""}
            </p>
          </div>
        </div>

        <div className="sales-toolbar">
          <div className="search-box">
            <Search size={16} />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search invoice, customer or phone..."
            />
          </div>
        </div>

        {loading ? (
          <div className="inventory-empty">
            <RefreshCw
              size={26}
              className="spin-icon"
            />

            <strong>
              Loading sales...
            </strong>
          </div>
        ) : filteredSales.length ===
          0 ? (
          <div className="inventory-empty">
            <ReceiptText
              size={36}
            />

            <strong>
              No sales found
            </strong>

            <span>
              Inventory sales will
              appear here.
            </span>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="app-table sales-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Bill</th>
                </tr>
              </thead>

              <tbody>
                {filteredSales.map(
                  (sale) => (
                    <tr key={sale.id}>
                      <td>
                        <strong className="sale-invoice-number">
                          {sale.invoiceNumber ||
                            `#${sale.id}`}
                        </strong>
                      </td>

                      <td>
                        {sale.customerName ||
                          "-"}
                      </td>

                      <td>
                        {sale.phoneNumber ||
                          "-"}
                      </td>

                      <td>
                        {formatDate(
                          sale.saleDate
                        )}
                      </td>

                      <td>
                        <span className="sale-item-count">
                          {getItemCount(
                            sale
                          )}{" "}
                          item
                          {getItemCount(
                            sale
                          ) !== 1
                            ? "s"
                            : ""}
                        </span>
                      </td>

                      <td>
                        <strong className="sale-total">
                          ₹
                          {Number(
                            sale.totalAmount ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="btn-small"
                          onClick={() =>
                            downloadBill(
                              sale.id
                            )
                          }
                        >
                          <Download
                            size={14}
                          />

                          PDF
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}

export default SalesHistory;