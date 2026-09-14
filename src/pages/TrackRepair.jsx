import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  LogIn,
  Phone,
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
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  const searchRepair = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.trim();

    if (!/^\d{10,15}$/.test(cleanPhone)) {
      setError("Please enter a valid phone number.");
      setRepairs([]);
      setSearched(true);
      return;
    }

    setLoading(true);
    setSearched(true);
    setError("");
    setRepairs([]);

    try {
      const response = await api.get(`/repairs/phone/${encodeURIComponent(cleanPhone)}`);
      setRepairs(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Track repair error:", err);
      setRepairs([]);
      if (err.response?.status !== 404) {
        setError(err.response?.data?.error || "Unable to search repairs. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadBill = (repairId) => {
    window.open(`${apiUrl}/bills/${repairId}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="customer-site">
      <header className="customer-header">
        <div className="customer-container customer-nav-row">
          <div className="customer-brand">
            <div className="customer-brand-logo"><Smartphone size={18} /></div>
            iPhone<span>Fixit</span>
          </div>

          <div className="customer-nav-actions">
            <div className="secure-text"><ShieldCheck size={16} />Secure Repair Tracking</div>
            <button className="admin-entry-btn" type="button" onClick={() => navigate("/admin/login")}>
              <LogIn size={16} />
              Admin Login
            </button>
          </div>
        </div>
      </header>

      <section className="customer-hero">
        <div className="customer-container track-hero-grid">
          <div className="track-copy">
            <div className="track-tag"><Wrench size={14} />Live Repair Status</div>
            <h1>Know exactly where your iPhone repair stands.</h1>
            <p>Enter the mobile number used at the shop to view device details, repair status, final cost and your PDF bill.</p>

            <form className="track-search" onSubmit={searchRepair}>
              <Phone size={19} />
              <input
                type="tel"
                inputMode="numeric"
                maxLength={15}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/[^0-9]/g, ""));
                  setError("");
                }}
                placeholder="Enter mobile number"
                required
              />
              <button type="submit" disabled={loading}>
                <Search size={17} />
                {loading ? "Searching..." : "Track Repair"}
              </button>
            </form>

            {error && <div className="track-error">{error}</div>}
            <div className="track-note"><ShieldCheck size={14} />Only the number used during repair intake can access the repair record.</div>
          </div>

          <div className="track-visual" aria-hidden="true">
            <div className="hero-phone">
              <div className="hero-phone-top"></div>
              <div className="hero-phone-screen">
                <div className="visual-badge">Repair #1042</div>
                <div className="visual-device">iPhone 15 Pro</div>
                <div className="visual-line"></div>
                <MiniStep label="Received" done />
                <MiniStep label="Checking" done />
                <MiniStep label="Repairing" active />
                <MiniStep label="Ready" />
              </div>
            </div>
            <div className="floating-status-card">
              <CheckCircle2 size={18} />
              <div><strong>Live updates</strong><span>Simple customer tracking</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="customer-container tracking-results">
        {searched && !loading && repairs.length === 0 && !error && (
          <div className="no-results">
            <Smartphone size={38} />
            <h2>No repair found</h2>
            <p>Please check the phone number and try again.</p>
          </div>
        )}

        {repairs.length > 0 && (
          <div className="results-heading">
            <div>
              <span className="page-overline">YOUR REPAIRS</span>
              <h2>{repairs.length} repair{repairs.length > 1 ? "s" : ""} found</h2>
            </div>
          </div>
        )}

        {repairs.map((repair) => (
          <article className="public-repair-card" key={repair.id}>
            <div className="public-repair-header">
              <div>
                <span className="repair-id">REPAIR #{repair.id}</span>
                <h2>{repair.deviceModel || "iPhone Repair"}</h2>
                <p>{repair.customer?.name || "Customer"}</p>
              </div>
              <Status status={repair.status || "RECEIVED"} />
            </div>

            <div className="public-repair-body">
              <div className="public-phone-photo">
                {repair.phoneImageUrl ? (
                  <img src={`${backendUrl}${repair.phoneImageUrl}`} alt={repair.deviceModel || "Phone"} />
                ) : (
                  <div className="no-phone-image"><Smartphone size={36} /><span>No photo available</span></div>
                )}
              </div>

              <div className="public-details-grid">
                <PublicInfo title="Received" value={repair.receivedDate} />
                <PublicInfo title="Current Status" value={repair.status} />
                <PublicInfo title="Problem" value={repair.problem} />
                <PublicInfo title="Final Cost" value={repair.finalRepairCost != null ? `₹${Number(repair.finalRepairCost).toLocaleString("en-IN")}` : "Pending"} />
                <PublicInfo title="Delivered" value={repair.deliveryDate || "Pending"} />
                <PublicInfo title="Repair ID" value={`#${repair.id}`} />
              </div>
            </div>

            <div className="public-repair-footer">
              <span>Need help? Contact the shop with repair ID #{repair.id}.</span>
              {repair.finalRepairCost != null && (
                <button type="button" className="public-download-btn" onClick={() => downloadBill(repair.id)}>
                  <Download size={17} />
                  Download PDF Bill
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </article>
        ))}
      </section>

      <footer className="customer-footer">© 2026 iPhoneFixit · Professional Device Repair</footer>
    </div>
  );
}

function MiniStep({ label, done = false, active = false }) {
  return (
    <div className={`mini-step ${done ? "done" : ""} ${active ? "active" : ""}`}>
      <span></span>
      <strong>{label}</strong>
    </div>
  );
}

function PublicInfo({ title, value }) {
  return <div className="public-info"><span>{title}</span><strong>{value ?? "-"}</strong></div>;
}

function Status({ status }) {
  const safeStatus = status || "RECEIVED";
  return <span className={`status large-status ${safeStatus.toLowerCase()}`}>{safeStatus}</span>;
}

export default TrackRepair;
