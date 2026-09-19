import { useEffect, useRef, useState } from "react";
import { MapPin, Save } from "lucide-react";

import api from "../api/api";
import AdminLayout from "../components/AdminLayout";

const EMPTY_FORM = {
  storeName: "",
  address: "",
  contactNumber: "",
  whatsappNumber: "",
  email: "",
  openingTime: "",
  closingTime: "",
  googleMapsLink: "",
};

function getErrorMessage(error, fallback) {
  const message = error.response?.data?.error || error.response?.data?.message;
  return typeof message === "string" && message.trim() ? message : fallback;
}

function StoreSettings() {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const saveLock = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    let cancelled = false;
    mounted.current = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await api.get("/store", { signal: controller.signal });
        if (cancelled) return;

        const data = response.data;
        if (!data || typeof data !== "object" || Array.isArray(data)) {
          throw new Error("Invalid store response");
        }

        setForm(Object.fromEntries(
          Object.keys(EMPTY_FORM).map((key) => [key, String(data[key] ?? "")]),
        ));
        setLoaded(true);
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, "Unable to load store details. Please try again."));
        }
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
  }, [attempt]);

  const retry = () => {
    setError("");
    setLoading(true);
    setAttempt((current) => current + 1);
  };

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setMessage("");
    setError("");
  };

  const save = async (event) => {
    event.preventDefault();
    if (!loaded || loading || saveLock.current) return;

    saveLock.current = true;
    setSaving(true);
    setMessage("");
    setError("");

    try {
      await api.put("/admin/store", form);
      if (mounted.current) setMessage("Store details updated successfully.");
    } catch (err) {
      if (mounted.current) {
        setError(getErrorMessage(err, "Unable to update store. Please try again."));
      }
    } finally {
      saveLock.current = false;
      if (mounted.current) setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="page-heading">
        <div>
          <span className="page-overline">BUSINESS</span>
          <h1>Store Settings</h1>
          <p>Manage store address and contact information.</p>
        </div>
      </div>

      <section className="ui-card store-settings-card" aria-busy={loading || saving}>
        <div className="form-section-heading">
          <div className="form-section-icon"><MapPin size={19} /></div>
          <div>
            <h2>Store Information</h2>
            <p>Visible to customers.</p>
          </div>
        </div>

        {loading ? (
          <div className="screen-message" role="status">Loading store details...</div>
        ) : !loaded ? (
          <div>
            <div className="error-message" role="alert">{error}</div>
            <button type="button" className="btn btn-secondary" onClick={retry}>Try Again</button>
          </div>
        ) : (
          <form className="store-settings-form" onSubmit={save}>
            <div className="form-two">
              <Field label="Store Name" name="storeName" value={form.storeName} change={change} disabled={saving} />
              <Field label="Contact Number" name="contactNumber" type="tel" value={form.contactNumber} change={change} disabled={saving} />
              <Field label="WhatsApp Number" name="whatsappNumber" type="tel" value={form.whatsappNumber} change={change} disabled={saving} />
              <Field label="Email" name="email" type="email" value={form.email} change={change} disabled={saving} />
              <Field label="Opening Time" name="openingTime" type="time" step="1" value={form.openingTime} change={change} disabled={saving} />
              <Field label="Closing Time" name="closingTime" type="time" step="1" value={form.closingTime} change={change} disabled={saving} />
            </div>

            <div className="app-field">
              <label htmlFor="store-address">Store Address</label>
              <textarea id="store-address" name="address" rows={3} value={form.address} onChange={change} disabled={saving} />
            </div>

            <div className="app-field">
              <label htmlFor="store-googleMapsLink">Google Maps Link</label>
              <input id="store-googleMapsLink" name="googleMapsLink" value={form.googleMapsLink} onChange={change} disabled={saving} />
            </div>

            {message && <div className="success-message" role="status">{message}</div>}
            {error && <div className="error-message" role="alert">{error}</div>}

            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={17} />
              {saving ? "Saving..." : "Save Store Details"}
            </button>
          </form>
        )}
      </section>
    </AdminLayout>
  );
}

function Field({ label, name, value, change, type = "text", disabled, step }) {
  const id = `store-${name}`;
  return (
    <div className="app-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} name={name} value={value} onChange={change} disabled={disabled} step={step} />
    </div>
  );
}

export default StoreSettings;
