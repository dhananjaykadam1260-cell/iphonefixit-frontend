import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, MessageCircle, Save, Smartphone, User } from "lucide-react";

import api from "../api/api";
import AdminLayout from "../components/AdminLayout";

function RepairDetails() {
  const { id } = useParams();
  // A different route starts a fresh form without carrying over old drafts.
  return <RepairDetailsForm key={id} id={id} />;
}

function RepairDetailsForm({ id }) {
  const [repair, setRepair] = useState(null);
  const [status, setStatus] = useState("");
  const [cost, setCost] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [sharing, setSharing] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const saveLock = useRef(false);
  const shareLock = useRef(false);
  const mounted = useRef(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await api.get(`/repairs/${id}`, { signal: controller.signal });
        if (cancelled) return;
        setRepair(response.data);
        setStatus(response.data?.status || "RECEIVED");
        setCost(response.data?.finalRepairCost ?? "");
      } catch (err) {
        if (!cancelled) setError(errorText(err, "Unable to load repair details."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
      mounted.current = false;
      controller.abort();
    };
  }, [id]);

  const saveField = async (field, value) => {
    if (saveLock.current) return;
    saveLock.current = true;
    setSaving(field);
    setMessage("");
    setError("");
    setWhatsappUrl("");

    try {
      await api.put(`/repairs/${id}/${field}`, null, { params: { [field]: value } });
      if (!mounted.current) return;

      // Reflect the confirmed write even if the subsequent refresh fails.
      setRepair((current) => ({
        ...current,
        [field === "status" ? "status" : "finalRepairCost"]: value,
      }));
      setMessage(field === "status"
        ? "Repair status updated successfully."
        : "Final repair cost saved successfully.");

      try {
        const response = await api.get(`/repairs/${id}`);
        if (mounted.current) {
          // Refresh server details, including delivery date, without resetting drafts.
          setRepair(response.data);
        }
      } catch {
        if (mounted.current) {
          setError("Your change was saved, but the latest details could not be refreshed. Reload to verify them.");
        }
      }
    } catch (err) {
      if (mounted.current) {
        setError(errorText(err, field === "status" ? "Unable to update status." : "Unable to save repair cost."));
      }
    } finally {
      saveLock.current = false;
      if (mounted.current) setSaving("");
    }
  };

  const saveStatus = async () => {
    if (!["RECEIVED", "CHECKING", "REPAIRING", "READY", "DELIVERED"].includes(status)) {
      setError("Please select a valid repair status.");
      return;
    }
    await saveField("status", status);
  };

  const saveCost = async () => {
    const numericCost = Number(cost);
    if (String(cost).trim() === "" || !Number.isFinite(numericCost) || numericCost < 0) {
      setMessage("");
      setError("Please enter a valid repair cost.");
      return;
    }

    await saveField("cost", numericCost);
  };

  const downloadBill = () => {
    if (repair?.finalRepairCost == null) {
      setError("Please add final repair cost before downloading the bill.");
      return;
    }
    window.open(`${apiUrl}/bills/${id}`, "_blank", "noopener,noreferrer");
  };

  const shareWhatsApp = async () => {
    if (shareLock.current || saveLock.current) return;
    shareLock.current = true;
    setSharing(true);
    setMessage("");
    setError("");
    setWhatsappUrl("");

    // Open synchronously during the click, before awaiting the API.
    // Detach opener manually so the handle remains available for navigation.
    let popup = null;
    try {
      popup = window.open("about:blank", "_blank");
      if (popup) {
        popup.opener = null;
        popup.document.title = "Preparing WhatsApp sharing";
        popup.document.body.textContent = "Preparing your repair details…";
      }
      const response = await api.get(`/whatsapp/share/${id}`);
      if (!mounted.current) {
        if (popup && !popup.closed) popup.close();
        return;
      }
      const url = new URL(response.data?.whatsappUrl);
      if (url.protocol !== "https:" || !["wa.me", "api.whatsapp.com", "web.whatsapp.com", "www.whatsapp.com"].includes(url.hostname)) {
        throw new Error("Invalid WhatsApp URL");
      }
      setWhatsappUrl(url.href);
      if (popup && !popup.closed) {
        popup.location.replace(url.href);
      } else {
        setMessage("Use the Open WhatsApp link below to continue sharing.");
      }
    } catch (err) {
      if (popup && !popup.closed) popup.close();
      if (mounted.current) setError(errorText(err, "Unable to open WhatsApp sharing."));
    } finally {
      shareLock.current = false;
      if (mounted.current) setSharing(false);
    }
  };

  if (loading) {
    return <AdminLayout><div className="screen-message">Loading repair...</div></AdminLayout>;
  }

  if (!repair) {
    return <AdminLayout><div className="screen-message">{error || "Repair not found."}</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="page-heading">
        <div>
          <span className="page-overline">REPAIR #{repair.id}</span>
          <h1>{repair.deviceModel}</h1>
          <p>{repair.customer?.name || "Unknown Customer"} · {repair.customer?.phoneNumber || "-"}</p>
        </div>
        <Status status={repair.status || "RECEIVED"} />
      </div>

      {message && <div className="success-message" role="status">{message}</div>}
      {error && <div className="error-message" role="alert">{error}</div>}

      <div className="repair-details-layout">
        <section className="ui-card">
          <div className="card-heading">
            <div><h2>Device Information</h2><p>Phone received for repair</p></div>
            <Smartphone size={20} />
          </div>

          <div className="repair-photo">
            {repair.phoneImageUrl ? (
              <img src={`${backendUrl}${repair.phoneImageUrl}`} alt={repair.deviceModel || "Phone"} />
            ) : (
              <div className="empty-photo"><Smartphone size={34} /><span>No phone photo available</span></div>
            )}
          </div>

          <div className="details-info-grid">
            <Info title="Device Model" value={repair.deviceModel} />
            <Info title="Serial / IMEI" value={repair.serialNumber || "-"} />
            <Info title="Received Date" value={repair.receivedDate || "-"} />
            <Info title="Delivery Date" value={repair.deliveryDate || "Pending"} />
          </div>

          <div className="problem-box">
            <span>REPORTED PROBLEM</span>
            <p>{repair.problem || "No problem description provided."}</p>
          </div>
        </section>

        <div>
          <section className="ui-card control-box">
            <div className="card-heading"><div><h2>Customer</h2></div><User size={19} /></div>
            <Info title="Name" value={repair.customer?.name} />
            <Info title="Phone" value={repair.customer?.phoneNumber} />
          </section>

          <section className="ui-card control-box">
            <h2>Repair Status</h2>
            <select aria-label="Repair status" className="app-select" value={status} disabled={Boolean(saving) || sharing} onChange={(e) => setStatus(e.target.value)}>
              <option value="RECEIVED">Received</option>
              <option value="CHECKING">Checking</option>
              <option value="REPAIRING">Repairing</option>
              <option value="READY">Ready</option>
              <option value="DELIVERED">Delivered</option>
            </select>
            <button type="button" className="btn btn-primary full-button" disabled={Boolean(saving) || sharing} onClick={saveStatus}><Save size={16} />{saving === "status" ? "Updating..." : "Update Status"}</button>
          </section>

          <section className="ui-card control-box">
            <h2>Final Repair Cost</h2>
            <div className="money-field"><span>₹</span><input aria-label="Final repair cost" type="number" min="0" step="0.01" value={cost} disabled={Boolean(saving) || sharing} onChange={(e) => setCost(e.target.value)} placeholder="0" /></div>
            <button type="button" className="btn btn-secondary full-button" disabled={Boolean(saving) || sharing} onClick={saveCost}><Save size={16} />{saving === "cost" ? "Saving..." : "Save Cost"}</button>
          </section>

          <section className="ui-card control-box">
            <h2>Bill & Sharing</h2>
            <button type="button" className="btn btn-primary full-button" disabled={repair.finalRepairCost == null || Boolean(saving)} onClick={downloadBill}><Download size={17} />Download PDF</button>
            <button type="button" className="btn whatsapp-button full-button" disabled={Boolean(saving) || sharing} onClick={shareWhatsApp}><MessageCircle size={17} />{sharing ? "Preparing..." : "Share on WhatsApp"}</button>
            {whatsappUrl && <a className="btn btn-secondary full-button" href={whatsappUrl} target="_blank" rel="noopener noreferrer">Open WhatsApp</a>}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}

function errorText(err, fallback) {
  const text = err.response?.data?.error || err.response?.data?.message;
  return typeof text === "string" ? text : fallback;
}

function Info({ title, value }) {
  return <div className="info-item"><span>{title}</span><strong>{value ?? "-"}</strong></div>;
}

function Status({ status }) {
  const safeStatus = status || "RECEIVED";
  return <span className={`status large-status ${safeStatus.toLowerCase()}`}>{safeStatus}</span>;
}

export default RepairDetails;
