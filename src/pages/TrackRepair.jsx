import { useState } from "react";

import {
  Search,
  Smartphone,
  Download,
  ShieldCheck,
  Wrench,
  Phone,
} from "lucide-react";

import api from "../api/api";

function TrackRepair() {
  const [phone, setPhone] = useState("");
  const [repairs, setRepairs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  // Backend URL for uploaded images
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:8080";

  // API URL for bill download
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api";

  const searchRepair = async (e) => {
    e.preventDefault();

    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      setError("Please enter your phone number.");
      return;
    }

    if (!/^[0-9]{10,15}$/.test(cleanPhone)) {
      setError(
        "Please enter a valid phone number."
      );
      return;
    }

    setLoading(true);
    setSearched(true);
    setError("");
    setRepairs([]);

    try {
      const response = await api.get(
        `/repairs/phone/${encodeURIComponent(
          cleanPhone
        )}`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setRepairs(data);

    } catch (error) {
      console.error(
        "Track repair error:",
        error
      );

      setRepairs([]);

      if (
        error.response?.status !== 404
      ) {
        setError(
          error.response?.data?.error ||
            "Unable to search repairs. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  const downloadBill = (repairId) => {
    window.open(
      `${apiUrl}/bills/${repairId}`,
      "_blank",
      "noopener,noreferrer"
    );
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

          <div className="secure-text">
            <ShieldCheck size={16} />
            Secure Repair Tracking
          </div>

        </div>

      </header>

      {/* HERO */}
      <section className="customer-hero">

        <div className="customer-container">

          <div className="track-tag">

            <Wrench size={14} />

            Repair Status

          </div>

          <h1>
            Track your iPhone repair.
          </h1>

          <p>
            Enter the mobile number used when
            your device was submitted to the shop.
          </p>

          <form
            className="track-search"
            onSubmit={searchRepair}
          >

            <Phone size={19} />

            <input
              type="tel"
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
              inputMode="numeric"
              maxLength={15}
              required
            />

            <button
              type="submit"
              disabled={loading}
            >

              <Search size={17} />

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

        </div>

      </section>

      {/* RESULTS */}
      <section className="customer-container tracking-results">

        {searched &&
          !loading &&
          repairs.length === 0 &&
          !error && (

            <div className="no-results">

              <Smartphone size={36} />

              <h2>
                No repair found
              </h2>

              <p>
                Please check your phone number
                and try again.
              </p>

            </div>

          )}

        {repairs.map((repair) => (

          <article
            className="public-repair-card"
            key={repair.id}
          >

            {/* HEADER */}

            <div className="public-repair-header">

              <div>

                <span className="repair-id">
                  REPAIR #{repair.id}
                </span>

                <h2>
                  {repair.deviceModel ||
                    "iPhone Repair"}
                </h2>

              </div>

              <Status
                status={
                  repair.status ||
                  "RECEIVED"
                }
              />

            </div>

            {/* BODY */}

            <div className="public-repair-body">

              {repair.phoneImageUrl ? (

                <div className="public-phone-photo">

                  <img
                    src={`${backendUrl}${repair.phoneImageUrl}`}
                    alt={
                      repair.deviceModel ||
                      "Phone"
                    }
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />

                </div>

              ) : (

                <div className="public-phone-photo">

                  <div className="no-phone-image">

                    <Smartphone size={35} />

                    <span>
                      No photo available
                    </span>

                  </div>

                </div>

              )}

              <div className="public-details-grid">

                <PublicInfo
                  title="Customer"
                  value={
                    repair.customer?.name
                  }
                />

                <PublicInfo
                  title="Received"
                  value={
                    repair.receivedDate
                  }
                />

                <PublicInfo
                  title="Problem"
                  value={
                    repair.problem
                  }
                />

                <PublicInfo
                  title="Repair Status"
                  value={
                    repair.status
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

              </div>

            </div>

            {/* BILL */}

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

                <Download size={18} />

                Download PDF Bill

              </button>

            )}

          </article>

        ))}

      </section>

      <footer className="customer-footer">

        © 2026 iPhoneFixit · Professional
        Device Repair

      </footer>

    </div>
  );
}

function PublicInfo({
  title,
  value,
}) {
  return (
    <div className="public-info">

      <span>
        {title}
      </span>

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