import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Loader2,
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

import "./TrackRepair.css";

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

          if (!groups[category]) {
            groups[category] = [];
          }

          groups[category].push(
            item
          );

          return groups;
        },
        {}
      );
    }, [filteredStoreItems]);

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
          err.response?.status !==
          404
        ) {
          setError(
            err.response?.data
              ?.error ||
              err.response?.data
                ?.message ||
              "Unable to search repairs. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

  const downloadBill =
    (repairId) => {
      window.open(
        `${apiUrl}/bills/${repairId}`,
        "_blank",
        "noopener,noreferrer"
      );
    };

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
        cleaned.length === 10
      ) {
        cleaned =
          `91${cleaned}`;
      }

      return cleaned;
    };

  const formatDate = (value) => {
    if (!value) {
      return "Pending";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="customer-site">

      <header className="customer-header">
        <div className="customer-container customer-nav-row">

          <button
            type="button"
            className="customer-brand customer-brand-button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            <div className="customer-brand-logo">
              <Smartphone size={19} />
            </div>

            <div>
              iPhone
              <span>Fixit</span>
            </div>
          </button>

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

      <main>

        <section className="customer-hero">

          <div className="customer-container track-hero-grid">

            <div className="track-copy">

              <div className="track-tag">
                <Wrench size={14} />
                Live Repair Tracking
              </div>

              <h1>
                Track your iPhone
                repair in real time.
              </h1>

              <p className="track-hero-description">
                Enter the mobile
                number used at the
                store to instantly
                check your repair
                status, device details,
                cost and invoice.
              </p>

              <form
                className="track-search"
                onSubmit={
                  searchRepair
                }
              >
                <div className="track-input-wrap">

                  <Phone
                    size={19}
                    className="track-input-icon"
                  />

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
                    aria-label="Mobile number"
                    required
                  />

                </div>

                <button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2
                      size={17}
                      className="track-spinner"
                    />
                  ) : (
                    <Search
                      size={17}
                    />
                  )}

                  {loading
                    ? "Searching..."
                    : "Track Repair"}
                </button>
              </form>

              {error && (
                <div className="track-error">
                  <AlertCircle
                    size={17}
                  />

                  <span>
                    {error}
                  </span>
                </div>
              )}

              <div className="track-note">
                <ShieldCheck
                  size={16}
                />

                <div>
                  <strong>
                    Private & secure
                  </strong>

                  <span>
                    Only the phone
                    number registered
                    during repair intake
                    can access the
                    repair record.
                  </span>
                </div>
              </div>

            </div>

            <div
              className="track-visual"
              aria-hidden="true"
            >

              <div className="hero-glow" />

              <div className="hero-phone">

                <div className="hero-phone-top" />

                <div className="hero-phone-screen">

                  <div className="hero-phone-statusbar">
                    <span>9:41</span>
                    <span>
                      ● ● ●
                    </span>
                  </div>

                  <div className="visual-badge">
                    Repair #1042
                  </div>

                  <div className="visual-device">
                    iPhone 15 Pro
                  </div>

                  <div className="visual-device-sub">
                    Screen Replacement
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

                <div className="floating-status-icon">
                  <CheckCircle2
                    size={18}
                  />
                </div>

                <div>
                  <strong>
                    Live updates
                  </strong>

                  <span>
                    Repair status
                    updated instantly
                  </span>
                </div>

              </div>

            </div>

          </div>

        </section>

        <section className="customer-container tracking-results">

          {searched &&
            !loading &&
            repairs.length === 0 &&
            !error && (

              <div className="no-results">

                <div className="no-results-icon">
                  <Smartphone
                    size={35}
                  />
                </div>

                <h2>
                  No repair found
                </h2>

                <p>
                  We couldn't find a
                  repair linked to this
                  phone number. Please
                  check the number and
                  try again.
                </p>

              </div>
            )}

          {repairs.length > 0 && (

            <div className="results-heading">

              <div>

                <span className="public-section-label">
                  Your Repairs
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

                <p>
                  Latest repair
                  information from
                  iPhoneFixit.
                </p>

              </div>

            </div>

          )}

          <div className="public-repair-list">

            {repairs.map(
              (repair) => (

                <article
                  className="public-repair-card"
                  key={repair.id}
                >

                  <div className="public-repair-header">

                    <div>

                      <span className="repair-id">
                        Repair #
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
                          loading="lazy"
                        />

                      ) : (

                        <div className="no-phone-image">

                          <Smartphone
                            size={38}
                          />

                          <strong>
                            Device Photo
                          </strong>

                          <span>
                            No photo
                            available
                          </span>

                        </div>

                      )}

                    </div>

                    <div className="public-details-area">

                      <div className="public-details-grid">

                        <PublicInfo
                          title="Received"
                          value={
                            formatDate(
                              repair.receivedDate
                            )
                          }
                        />

                        <PublicInfo
                          title="Current Status"
                          value={
                            formatStatus(
                              repair.status
                            )
                          }
                        />

                        <PublicInfo
                          title="Problem"
                          value={
                            repair.problem ||
                            "-"
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
                          highlight={
                            repair.finalRepairCost !=
                            null
                          }
                        />

                        <PublicInfo
                          title="Delivered"
                          value={
                            repair.deliveryDate
                              ? formatDate(
                                  repair.deliveryDate
                                )
                              : "Pending"
                          }
                        />

                        <PublicInfo
                          title="Repair ID"
                          value={`#${repair.id}`}
                        />

                      </div>

                      <RepairProgress
                        status={
                          repair.status ||
                          "RECEIVED"
                        }
                      />

                    </div>

                  </div>

                  <div className="public-repair-footer">

                    <div className="repair-support-text">
                      <MessageCircle
                        size={16}
                      />

                      <span>
                        Need help?
                        Contact the
                        store with
                        repair ID{" "}
                        <strong>
                          #{repair.id}
                        </strong>
                      </span>
                    </div>

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

          </div>

        </section>

        {items.length > 0 && (

          <section className="store-public-wrapper">

            <div className="customer-container store-public-section">

              <div className="public-section-heading">

                <span className="public-section-label">
                  Our Store
                </span>

                <h2>
                  Accessories &
                  Repair Products
                </h2>

                <p>
                  Browse available
                  products, accessories
                  and replacement parts
                  currently stocked at
                  our store.
                </p>

              </div>

              <div className="public-store-toolbar">

                <div className="public-store-search">

                  <Search
                    size={18}
                  />

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

                <div className="public-store-count">
                  <Package
                    size={16}
                  />

                  {
                    filteredStoreItems.length
                  }{" "}
                  products
                </div>

              </div>

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
                  All Products
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

                  <div className="store-empty-icon">
                    <Package
                      size={34}
                    />
                  </div>

                  <strong>
                    No products found
                  </strong>

                  <span>
                    Try another search
                    or choose a
                    different category.
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
                            Category
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
                          (item) => {

                            const inStock =
                              Number(
                                item.stockQuantity ||
                                0
                              ) > 0;

                            return (
                              <article
                                className={`store-item-card ${
                                  !inStock
                                    ? "store-item-out"
                                    : ""
                                }`}
                                key={
                                  item.id
                                }
                              >

                                {!inStock && (
                                  <div className="store-out-overlay">
                                    Out of Stock
                                  </div>
                                )}

                                <div className="store-product-icon">

                                  <Package
                                    size={24}
                                  />

                                </div>

                                <div className="store-product-content">

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

                                    <small className="store-brand">
                                      {
                                        item.brand
                                      }
                                    </small>

                                  )}

                                  <p>
                                    {item.description ||
                                      "Available at our store."}
                                  </p>

                                </div>

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
                                      inStock
                                        ? "customer-stock"
                                        : "customer-out-stock"
                                    }
                                  >
                                    {inStock
                                      ? "In Stock"
                                      : "Out of Stock"}
                                  </span>

                                </div>

                              </article>
                            );
                          }
                        )}

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          </section>

        )}

        {store && (

          <section className="store-contact-section">

            <div className="customer-container store-contact-grid">

              <div className="store-contact-info">

                <span className="store-contact-overline">
                  Visit Our Store
                </span>

                <h2>
                  {store.storeName ||
                    "iPhoneFixit"}
                </h2>

                <p className="store-contact-description">
                  Need repair help or
                  looking for an
                  accessory? Contact
                  our store directly.
                </p>

                <div className="store-info-list">

                  {store.address && (

                    <div className="store-info-row">

                      <div className="store-info-icon">
                        <MapPin
                          size={18}
                        />
                      </div>

                      <div>
                        <small>
                          Address
                        </small>

                        <span>
                          {
                            store.address
                          }
                        </span>
                      </div>

                    </div>

                  )}

                  {store.contactNumber && (

                    <div className="store-info-row">

                      <div className="store-info-icon">
                        <PhoneCall
                          size={18}
                        />
                      </div>

                      <div>
                        <small>
                          Contact
                        </small>

                        <span>
                          {
                            store.contactNumber
                          }
                        </span>
                      </div>

                    </div>

                  )}

                  {(store.openingTime ||
                    store.closingTime) && (

                    <div className="store-info-row">

                      <div className="store-info-icon">
                        <Clock
                          size={18}
                        />
                      </div>

                      <div>
                        <small>
                          Working Hours
                        </small>

                        <span>
                          {store.openingTime ||
                            "--"}
                          {" - "}
                          {store.closingTime ||
                            "--"}
                        </span>
                      </div>

                    </div>

                  )}

                </div>

              </div>

              <div className="store-contact-actions">

                <span>
                  Get in touch
                </span>

                <h3>
                  We're here to help.
                </h3>

                {store.contactNumber && (

                  <a
                    className="contact-action contact-call"
                    href={`tel:${store.contactNumber}`}
                  >
                    <PhoneCall
                      size={18}
                    />

                    <div>
                      <strong>
                        Call Store
                      </strong>

                      <small>
                        Speak with our
                        repair team
                      </small>
                    </div>

                    <ArrowRight
                      size={17}
                    />
                  </a>

                )}

                {store.whatsappNumber && (

                  <a
                    className="contact-action contact-whatsapp"
                    href={`https://wa.me/${getWhatsAppNumber(
                      store.whatsappNumber
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle
                      size={18}
                    />

                    <div>
                      <strong>
                        WhatsApp
                      </strong>

                      <small>
                        Send us a
                        message
                      </small>
                    </div>

                    <ArrowRight
                      size={17}
                    />
                  </a>

                )}

                {store.googleMapsLink && (

                  <a
                    className="contact-action contact-map"
                    href={
                      store.googleMapsLink
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink
                      size={18}
                    />

                    <div>
                      <strong>
                        Directions
                      </strong>

                      <small>
                        Open in Google
                        Maps
                      </small>
                    </div>

                    <ArrowRight
                      size={17}
                    />
                  </a>

                )}

              </div>

            </div>

          </section>

        )}

      </main>

      <footer className="customer-footer">

        <div className="customer-container customer-footer-inner">

          <div className="customer-footer-brand">
            <Smartphone
              size={17}
            />

            <strong>
              iPhone
              <span>
                Fixit
              </span>
            </strong>
          </div>

          <p>
            © 2026 iPhoneFixit.
            Professional Device
            Repair.
          </p>

        </div>

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
        done
          ? "done"
          : ""
      } ${
        active
          ? "active"
          : ""
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
  highlight = false,
}) {
  return (
    <div
      className={`public-info ${
        highlight
          ? "public-info-highlight"
          : ""
      }`}
    >
      <span>
        {title}
      </span>

      <strong>
        {value ?? "-"}
      </strong>
    </div>
  );
}

function RepairProgress({
  status,
}) {
  const statuses = [
    "RECEIVED",
    "CHECKING",
    "REPAIRING",
    "READY",
    "DELIVERED",
  ];

  const currentIndex =
    Math.max(
      statuses.indexOf(
        status
      ),
      0
    );

  return (
    <div className="public-progress">

      <div className="public-progress-heading">
        <span>
          Repair Progress
        </span>

        <strong>
          {formatStatus(
            status
          )}
        </strong>
      </div>

      <div className="public-progress-track">

        {statuses.map(
          (
            step,
            index
          ) => {

            const completed =
              index <
              currentIndex;

            const active =
              index ===
              currentIndex;

            return (
              <div
                className={`public-progress-step ${
                  completed
                    ? "completed"
                    : ""
                } ${
                  active
                    ? "active"
                    : ""
                }`}
                key={step}
              >
                <div className="progress-step-marker">
                  {completed ? (
                    <CheckCircle2
                      size={14}
                    />
                  ) : (
                    <span />
                  )}
                </div>

                <small>
                  {formatStatus(
                    step
                  )}
                </small>
              </div>
            );
          }
        )}

      </div>

    </div>
  );
}

function Status({
  status,
}) {
  const safeStatus =
    status ||
    "RECEIVED";

  return (
    <span
      className={`status large-status ${safeStatus.toLowerCase()}`}
    >
      {formatStatus(
        safeStatus
      )}
    </span>
  );
}

function formatStatus(
  status
) {
  if (!status) {
    return "Received";
  }

  return status
    .toLowerCase()
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

export default TrackRepair;