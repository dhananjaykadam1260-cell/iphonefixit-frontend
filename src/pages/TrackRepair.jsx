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

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:8080";

  const searchRepair = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSearched(true);

    try {
      const response =
        await api.get(
          `/repairs/phone/${phone}`
        );

      setRepairs(response.data);

    } catch {
      setRepairs([]);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-site">

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
              onChange={(e) =>
                setPhone(e.target.value)
              }
              placeholder="Enter mobile number"
              required
            />

            <button>
              <Search size={17} />

              {loading
                ? "Searching..."
                : "Track Repair"}
            </button>

          </form>

        </div>

      </section>

      <section className="customer-container tracking-results">

        {searched &&
          !loading &&
          repairs.length === 0 && (

            <div className="no-results">

              <Smartphone size={36} />

              <h2>
                No repair found
              </h2>

              <p>
                Please check your phone number and try again.
              </p>

            </div>

          )}

        {repairs.map((repair) => (

          <article
            className="public-repair-card"
            key={repair.id}
          >

            <div className="public-repair-header">

              <div>

                <span className="repair-id">
                  REPAIR #{repair.id}
                </span>

                <h2>
                  {repair.deviceModel}
                </h2>

              </div>

              <Status
                status={repair.status}
              />

            </div>

            <div className="public-repair-body">

              {repair.phoneImageUrl && (

                <div className="public-phone-photo">

                  <img
                    src={`${backendUrl}${repair.phoneImageUrl}`}
                    alt="Phone"
                  />

                </div>

              )}

              <div className="public-details-grid">

                <PublicInfo
                  title="Customer"
                  value={repair.customer?.name}
                />

                <PublicInfo
                  title="Received"
                  value={repair.receivedDate}
                />

                <PublicInfo
                  title="Problem"
                  value={repair.problem}
                />

                <PublicInfo
                  title="Repair Status"
                  value={repair.status}
                />

                <PublicInfo
                  title="Final Cost"
                  value={
                    repair.finalRepairCost != null
                      ? `₹${Number(
                          repair.finalRepairCost
                        ).toLocaleString("en-IN")}`
                      : "Pending"
                  }
                />

                <PublicInfo
                  title="Delivered"
                  value={repair.deliveryDate || "Pending"}
                />

              </div>

            </div>

            {repair.finalRepairCost != null && (

              <button
                className="public-download-btn"
                onClick={() =>
                  window.open(
                    `${import.meta.env.VITE_API_URL}/bills/${repair.id}`,
                    "_blank"
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
        © 2026 iPhoneFixit · Professional Device Repair
      </footer>

    </div>
  );
}

function PublicInfo({ title, value }) {
  return (
    <div className="public-info">

      <span>{title}</span>

      <strong>
        {value || "-"}
      </strong>

    </div>
  );
}

function Status({ status }) {
  return (
    <span className={`status large-status ${status?.toLowerCase()}`}>
      {status}
    </span>
  );
}

export default TrackRepair;