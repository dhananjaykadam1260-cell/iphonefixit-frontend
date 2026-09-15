import {
  useEffect,
  useState,
} from "react";

import {
  MapPin,
  Save,
} from "lucide-react";

import api from "../api/api";
import AdminLayout from "../components/AdminLayout";

function StoreSettings() {
  const [form, setForm] =
    useState({
      storeName: "",
      address: "",
      contactNumber: "",
      whatsappNumber: "",
      email: "",
      openingTime: "",
      closingTime: "",
      googleMapsLink: "",
    });

  const [message, setMessage] =
    useState("");

  useEffect(() => {

    const load = async () => {

      const response =
        await api.get(
          "/store"
        );

      setForm({
        storeName:
          response.data.storeName ||
          "",

        address:
          response.data.address ||
          "",

        contactNumber:
          response.data.contactNumber ||
          "",

        whatsappNumber:
          response.data.whatsappNumber ||
          "",

        email:
          response.data.email ||
          "",

        openingTime:
          response.data.openingTime ||
          "",

        closingTime:
          response.data.closingTime ||
          "",

        googleMapsLink:
          response.data.googleMapsLink ||
          "",
      });
    };

    load();

  }, []);

  const change = (e) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const save = async (e) => {
    e.preventDefault();

    try {

      await api.put(
        "/admin/store",
        form
      );

      setMessage(
        "Store details updated."
      );

    } catch {

      setMessage(
        "Unable to update store."
      );
    }
  };

  return (
    <AdminLayout>

      <div className="page-heading">

        <div>

          <span className="page-overline">
            BUSINESS
          </span>

          <h1>
            Store Settings
          </h1>

          <p>
            Manage store address
            and contact information.
          </p>

        </div>

      </div>

      <section className="ui-card store-settings-card">

        <div className="form-section-heading">

          <div className="form-section-icon">
            <MapPin size={19} />
          </div>

          <div>
            <h2>
              Store Information
            </h2>

            <p>
              Visible to customers.
            </p>
          </div>

        </div>

        <form
          className="store-settings-form"
          onSubmit={save}
        >

          <div className="form-two">

            <Field
              label="Store Name"
              name="storeName"
              value={
                form.storeName
              }
              change={change}
            />

            <Field
              label="Contact Number"
              name="contactNumber"
              value={
                form.contactNumber
              }
              change={change}
            />

            <Field
              label="WhatsApp Number"
              name="whatsappNumber"
              value={
                form.whatsappNumber
              }
              change={change}
            />

            <Field
              label="Email"
              name="email"
              type="email"
              value={form.email}
              change={change}
            />

            <Field
              label="Opening Time"
              name="openingTime"
              type="time"
              value={
                form.openingTime
              }
              change={change}
            />

            <Field
              label="Closing Time"
              name="closingTime"
              type="time"
              value={
                form.closingTime
              }
              change={change}
            />

          </div>

          <div className="app-field">

            <label>
              Store Address
            </label>

            <textarea
              name="address"
              value={form.address}
              onChange={change}
            />

          </div>

          <div className="app-field">

            <label>
              Google Maps Link
            </label>

            <input
              name="googleMapsLink"
              value={
                form.googleMapsLink
              }
              onChange={change}
            />

          </div>

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          <button
            className="btn btn-primary"
          >
            <Save size={17} />
            Save Store Details
          </button>

        </form>

      </section>

    </AdminLayout>
  );
}

function Field({
  label,
  name,
  value,
  change,
  type = "text",
}) {
  return (
    <div className="app-field">

      <label>
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={change}
      />

    </div>
  );
}

export default StoreSettings;