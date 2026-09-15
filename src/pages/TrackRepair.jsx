import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  LogIn,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  PhoneCall,
  Search,
  ShieldCheck,
  Smartphone,
  Wrench,
} from "lucide-react";

import api from "../api/api";

function TrackRepair() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [repairs, setRepairs] = useState([]);

  const [store, setStore] = useState(null);
  const [items, setItems] = useState([]);

  const [itemSearch, setItemSearch] =
    useState("");

  const [itemCategory, setItemCategory] =
    useState("ALL");

  const [loading, setLoading] =
    useState(false);

  const [searched, setSearched] =
    useState(false);

  const [error, setError] =
    useState("");

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:8080";

  const apiUrl =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api";

  /* =========================
     LOAD STORE + ITEMS
  ========================= */

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        const [
          storeResponse,
          itemsResponse,
        ] = await Promise.all([
          api.get("/store"),
          api.get("/items"),
        ]);

        setStore(
          storeResponse.data
        );

        setItems(
          Array.isArray(
            itemsResponse.data
          )
            ? itemsResponse.data
            : []
        );
      } catch (err) {
        console.error(
          "Unable to load store data:",
          err
        );
      }
    };

    loadStoreData();
  }, []);

  /* =========================
     STORE CATEGORIES
  ========================= */

  const storeCategories =
    useMemo(() => {
      return [
        ...new Set(
          items.map(
            (item) =>
              item.category ||
              "Other"
          )
        ),
      ].sort();
    }, [items]);

  /* =========================
     FILTER STORE ITEMS
  ========================= */

  const filteredStoreItems =
    useMemo(() => {
      const searchText =
        itemSearch
          .trim()
          .toLowerCase();

      return items.filter(
        (item) => {
          const category =
            item.category ||
            "Other";

          const matchesCategory =
            itemCategory ===
              "ALL" ||
            category ===
              itemCategory;

          const matchesSearch =
            !searchText ||
            item.name
              ?.toLowerCase()
              .includes(
                searchText
              ) ||
            item.brand
              ?.toLowerCase()
              .includes(
                searchText
              ) ||
            category
              .toLowerCase()
              .includes(
                searchText
              ) ||
            item.description
              ?.toLowerCase()
              .includes(
                searchText
              );

          return (
            matchesCategory &&
            matchesSearch
          );
        }
      );
    }, [
      items,
      itemSearch,
      itemCategory,
    ]);

  /* =========================
     GROUP ITEMS
  ========================= */

  const groupedItems =
    useMemo(() => {
      return filteredStoreItems.reduce(
        (
          groups,
          item
        ) => {
          const category =
            item.category ||
            "Other";

          if (
            !groups[
              category
            ]
          ) {
            groups[
              category
            ] = [];
          }

          groups[
            category
          ].push(item);

          return groups;
        },
        {}
      );
    }, [filteredStoreItems]);

  /* =========================
     TRACK REPAIR
  ========================= */

  const searchRepair =
    async (e) => {
      e.preventDefault();

      const cleanPhone =
        phone.trim();

      if (
        !/^\d{10,15}$/.test(
          cleanPhone
        )
      ) {
        setError(
          "Please enter a valid phone number."
        );

        setRepairs([]);
        setSearched(true);

        return;
      }

      setLoading(true);
      setSearched(true);
      setError("");
      setRepairs([]);

      try {
        const response =
          await api.get(
            `/repairs/phone/${encodeURIComponent(
              cleanPhone
            )}`
          );

        setRepairs(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );
      } catch (err) {
        console.error(
          "Track repair error:",
          err
        );

        setRepairs([]);

        if (
          err.response
            ?.status !==
          404
        ) {
          setError(
            err.response?.data
              ?.error ||
              "Unable to search repairs. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

  /* =========================
     PDF
  ========================= */

  const downloadBill =
    (repairId) => {
      window.open(
        `${apiUrl}/bills/${repairId}`,
        "_blank",
        "noopener,noreferrer"
      );
    };

  /* =========================
     WHATSAPP
  ========================= */

  const getWhatsAppNumber =
    (number) => {
      if (!number) {
        return "";
      }

      let cleaned =
        number.replace(
          /\D/g,
          ""
        );

      if (
        cleaned.length ===
        10
      ) {
        cleaned =
          `91${cleaned}`;
      }

      return cleaned;
    };

  return (
    <div className="customer-site">

      {/* HEADER */}

      <header className="customer-header">

        <div className="customer-container customer-nav-row">

          <div className="customer-brand">

            <div className="customer-brand-logo">
              <Smartphone size={18} />
            </div>

            iPhone<span>Fixit</span>

          </div>

          <div className="customer-nav-actions">

            <div className="secure-text">

              <ShieldCheck size={16} />

              Secure Repair Tracking

            </div>

            <button
              className="admin-entry-btn"
              type="button"
              onClick={() =>
                navigate(
                  "/admin/login"
                )
              }
            >
              <LogIn size={16} />
              Admin Login
            </button>

          </div>

        </div>

      </header>

      {/* HERO */}

      <section className="customer-hero">

        <div className="customer-container track-hero-grid">

          <div className="track-copy">

            <div className="track-tag">
              <Wrench size={14} />
              Live Repair Status
            </div>

            <h1>
              Know exactly where
              your iPhone repair
              stands.
            </h1>

            <p>
              Enter the mobile
              number used at the
              shop to view device
              details, repair
              status, final cost
              and your PDF bill.
            </p>

            <form
              className="track-search"
              onSubmit={
                searchRepair
              }
            >

              <Phone size={19} />

              <input
                type="tel"
                inputMode="numeric"
                maxLength={15}
                value={phone}
                onChange={(e) => {
                  setPhone(
                    e.target.value.replace(
                      /[^0-9]/g,
                      ""
                    )
                  );

                  setError("");
                }}
                placeholder="Enter mobile number"
                required
              />

              <button
                type="submit"
                disabled={loading}
              >
                <Search
                  size={17}
                />

                {loading
                  ? "Searching..."
                  : "Track Repair"}
              </button>

            </form>

            {error && (
              <div className="track-error">
                {error}
              </div>
            )}

            <div className="track-note">

              <ShieldCheck
                size={14}
              />

              Only the number used
              during repair intake
              can access the repair
              record.

            </div>

          </div>

          {/* VISUAL */}

          <div
            className="track-visual"
            aria-hidden="true"
          >

            <div className="hero-phone">

              <div className="hero-phone-top" />

              <div className="hero-phone-screen">

                <div className="visual-badge">
                  Repair #1042
                </div>

                <div className="visual-device">
                  iPhone 15 Pro
                </div>

                <div className="visual-line" />

                <MiniStep
                  label="Received"
                  done
                />

                <MiniStep
                  label="Checking"
                  done
                />

                <MiniStep
                  label="Repairing"
                  active
                />

                <MiniStep
                  label="Ready"
                />

              </div>

            </div>

            <div className="floating-status-card">

              <CheckCircle2
                size={18}
              />

              <div>
                <strong>
                  Live updates
                </strong>

                <span>
                  Simple customer
                  tracking
                </span>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* REPAIR RESULTS */}

      <section className="customer-container tracking-results">

        {searched &&
          !loading &&
          repairs.length ===
            0 &&
          !error && (

            <div className="no-results">

              <Smartphone
                size={38}
              />

              <h2>
                No repair found
              </h2>

              <p>
                Please check the
                phone number and
                try again.
              </p>

            </div>

          )}

        {repairs.length >
          0 && (

          <div className="results-heading">

            <div>

              <span className="page-overline">
                YOUR REPAIRS
              </span>

              <h2>
                {repairs.length}{" "}
                repair
                {repairs.length >
                1
                  ? "s"
                  : ""}{" "}
                found
              </h2>

            </div>

          </div>

        )}

        {repairs.map(
          (repair) => (

            <article
              className="public-repair-card"
              key={repair.id}
            >

              <div className="public-repair-header">

                <div>

                  <span className="repair-id">
                    REPAIR #
                    {repair.id}
                  </span>

                  <h2>
                    {repair.deviceModel ||
                      "iPhone Repair"}
                  </h2>

                  <p>
                    {repair.customer
                      ?.name ||
                      "Customer"}
                  </p>

                </div>

                <Status
                  status={
                    repair.status ||
                    "RECEIVED"
                  }
                />

              </div>

              <div className="public-repair-body">

                <div className="public-phone-photo">

                  {repair.phoneImageUrl ? (

                    <img
                      src={`${backendUrl}${repair.phoneImageUrl}`}
                      alt={
                        repair.deviceModel ||
                        "Phone"
                      }
                    />

                  ) : (

                    <div className="no-phone-image">

                      <Smartphone
                        size={36}
                      />

                      <span>
                        No photo
                        available
                      </span>

                    </div>

                  )}

                </div>

                <div className="public-details-grid">

                  <PublicInfo
                    title="Received"
                    value={
                      repair.receivedDate
                    }
                  />

                  <PublicInfo
                    title="Current Status"
                    value={
                      repair.status
                    }
                  />

                  <PublicInfo
                    title="Problem"
                    value={
                      repair.problem
                    }
                  />

                  <PublicInfo
                    title="Final Cost"
                    value={
                      repair.finalRepairCost !=
                      null
                        ? `₹${Number(
                            repair.finalRepairCost
                          ).toLocaleString(
                            "en-IN"
                          )}`
                        : "Pending"
                    }
                  />

                  <PublicInfo
                    title="Delivered"
                    value={
                      repair.deliveryDate ||
                      "Pending"
                    }
                  />

                  <PublicInfo
                    title="Repair ID"
                    value={`#${repair.id}`}
                  />

                </div>

              </div>

              <div className="public-repair-footer">

                <span>
                  Need help?
                  Contact the shop
                  with repair ID #
                  {repair.id}.
                </span>

                {repair.finalRepairCost !=
                  null && (

                  <button
                    type="button"
                    className="public-download-btn"
                    onClick={() =>
                      downloadBill(
                        repair.id
                      )
                    }
                  >
                    <Download
                      size={17}
                    />

                    Download PDF Bill

                    <ArrowRight
                      size={16}
                    />
                  </button>

                )}

              </div>

            </article>

          )
        )}

      </section>

      {/* STORE ITEMS */}

      {items.length > 0 && (

        <section className="customer-container store-public-section">

          <div className="public-section-heading">

            <span>
              OUR STORE
            </span>

            <h2>
              Available in Store
            </h2>

            <p>
              Browse accessories
              and repair products
              by category.
            </p>

          </div>

          {/* PRODUCT SEARCH */}

          <div className="public-store-search">

            <Search size={17} />

            <input
              type="text"
              value={
                itemSearch
              }
              onChange={(e) =>
                setItemSearch(
                  e.target.value
                )
              }
              placeholder="Search products, brands or categories..."
            />

          </div>

          {/* CATEGORY FILTER */}

          <div className="public-category-filters">

            <button
              type="button"
              className={
                itemCategory ===
                "ALL"
                  ? "public-category-btn active"
                  : "public-category-btn"
              }
              onClick={() =>
                setItemCategory(
                  "ALL"
                )
              }
            >
              All
            </button>

            {storeCategories.map(
              (category) => (

                <button
                  type="button"
                  key={category}
                  className={
                    itemCategory ===
                    category
                      ? "public-category-btn active"
                      : "public-category-btn"
                  }
                  onClick={() =>
                    setItemCategory(
                      category
                    )
                  }
                >
                  {category}
                </button>

              )
            )}

          </div>

          {filteredStoreItems.length ===
          0 ? (

            <div className="store-no-items">

              <Package
                size={35}
              />

              <strong>
                No products found
              </strong>

              <span>
                Try another search
                or category.
              </span>

            </div>

          ) : (

            Object.entries(
              groupedItems
            ).map(
              ([
                category,
                categoryItems,
              ]) => (

                <div
                  className="store-category-group"
                  key={category}
                >

                  <div className="store-category-heading">

                    <div>

                      <span>
                        CATEGORY
                      </span>

                      <h3>
                        {category}
                      </h3>

                    </div>

                    <small>
                      {
                        categoryItems.length
                      }{" "}
                      item
                      {categoryItems.length !==
                      1
                        ? "s"
                        : ""}
                    </small>

                  </div>

                  <div className="store-items-grid">

                    {categoryItems.map(
                      (item) => (

                        <article
                          className="store-item-card"
                          key={
                            item.id
                          }
                        >

                          <div className="store-product-icon">

                            <Package
                              size={
                                22
                              }
                            />

                          </div>

                          <span className="store-item-category">
                            {item.category ||
                              "Other"}
                          </span>

                          <h3>
                            {
                              item.name
                            }
                          </h3>

                          {item.brand && (

                            <small>
                              {
                                item.brand
                              }
                            </small>

                          )}

                          <p>
                            {item.description ||
                              "Available at our store."}
                          </p>

                          <div className="store-item-bottom">

                            <strong>
                              ₹
                              {Number(
                                item.price ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </strong>

                            <span
                              className={
                                item.stockQuantity >
                                0
                                  ? "customer-stock"
                                  : "customer-out-stock"
                              }
                            >
                              {item.stockQuantity >
                              0
                                ? "Available"
                                : "Out of Stock"}
                            </span>

                          </div>

                        </article>

                      )
                    )}

                  </div>

                </div>

              )
            )

          )}

        </section>

      )}

      {/* STORE INFO */}

      {store && (

        <section className="store-contact-section">

          <div className="customer-container store-contact-grid">

            <div className="store-contact-info">

              <span className="store-contact-overline">
                VISIT OUR STORE
              </span>

              <h2>
                {store.storeName ||
                  "iPhoneFixit"}
              </h2>

              {store.address && (

                <div className="store-info-row">

                  <MapPin
                    size={17}
                  />

                  <span>
                    {
                      store.address
                    }
                  </span>

                </div>

              )}

              {store.contactNumber && (

                <div className="store-info-row">

                  <PhoneCall
                    size={17}
                  />

                  <span>
                    {
                      store.contactNumber
                    }
                  </span>

                </div>

              )}

              {(store.openingTime ||
                store.closingTime) && (

                <div className="store-info-row">

                  <Clock
                    size={17}
                  />

                  <span>
                    {store.openingTime ||
                      "--"}
                    {" - "}
                    {store.closingTime ||
                      "--"}
                  </span>

                </div>

              )}

            </div>

            <div className="store-contact-actions">

              {store.contactNumber && (

                <a
                  href={`tel:${store.contactNumber}`}
                >
                  <PhoneCall
                    size={16}
                  />
                  Call Store
                </a>

              )}

              {store.whatsappNumber && (

                <a
                  href={`https://wa.me/${getWhatsAppNumber(
                    store.whatsappNumber
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle
                    size={16}
                  />
                  WhatsApp
                </a>

              )}

              {store.googleMapsLink && (

                <a
                  href={
                    store.googleMapsLink
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink
                    size={16}
                  />
                  Directions
                </a>

              )}

            </div>

          </div>

        </section>

      )}

      <footer className="customer-footer">
        © 2026 iPhoneFixit · Professional Device Repair
      </footer>

    </div>
  );
}

function MiniStep({
  label,
  done = false,
  active = false,
}) {
  return (
    <div
      className={`mini-step ${
        done ? "done" : ""
      } ${
        active ? "active" : ""
      }`}
    >
      <span />

      <strong>
        {label}
      </strong>
    </div>
  );
}

function PublicInfo({
  title,
  value,
}) {
  return (
    <div className="public-info">
      <span>{title}</span>
      <strong>
        {value ?? "-"}
      </strong>
    </div>
  );
}

function Status({
  status,
}) {
  const safeStatus =
    status || "RECEIVED";

  return (
    <span
      className={`status large-status ${safeStatus.toLowerCase()}`}
    >
      {safeStatus}
    </span>
  );
}

export default TrackRepair;