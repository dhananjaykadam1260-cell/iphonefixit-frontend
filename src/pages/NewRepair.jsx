import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Camera,
  User,
  Smartphone,
  Wrench,
  Save,
} from "lucide-react";

import api from "../api/api";
import AdminLayout from "../components/AdminLayout";

function NewRepair() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    deviceModel: "",
    serialNumber: "",
    problem: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const change = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const selectImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);

    setPreview(
      URL.createObjectURL(file)
    );
  };

  const findOrCreateCustomer = async () => {
    try {
      const response =
        await api.get(`/customers/phone/${form.phoneNumber}`);

      return response.data;
    } catch {
      const response =
        await api.post("/customers", {
          name: form.name,
          phoneNumber: form.phoneNumber,
        });

      return response.data;
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!image) {
      setMessage("Please add phone photo.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const customer =
        await findOrCreateCustomer();

      const data = new FormData();

      data.append("deviceModel", form.deviceModel);
      data.append("serialNumber", form.serialNumber);
      data.append("problem", form.problem);
      data.append("image", image);

      const response =
        await api.post(
          `/repairs/customer/${customer.id}/with-image`,
          data
        );

      navigate(`/admin/repair/${response.data.id}`);

    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.error ||
        "Unable to create repair."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>

      <div className="page-heading">

        <div>

          <span className="page-overline">
            CREATE JOB
          </span>

          <h1>New Repair</h1>

          <p>
            Add the customer, device and repair problem.
          </p>

        </div>

      </div>

      <form
        className="new-repair-layout"
        onSubmit={submit}
      >

        <div>

          <section className="ui-card form-section-card">

            <div className="form-section-heading">

              <div className="form-section-icon">
                <User size={19} />
              </div>

              <div>
                <h2>Customer Details</h2>
                <p>Who owns this device?</p>
              </div>

            </div>

            <div className="form-two">

              <Field
                label="Customer Name"
                name="name"
                value={form.name}
                change={change}
                placeholder="Enter customer name"
              />

              <Field
                label="Phone Number"
                name="phoneNumber"
                value={form.phoneNumber}
                change={change}
                placeholder="9876543210"
                type="tel"
              />

            </div>

          </section>

          <section className="ui-card form-section-card">

            <div className="form-section-heading">

              <div className="form-section-icon">
                <Smartphone size={19} />
              </div>

              <div>
                <h2>Device Details</h2>
                <p>Information about the phone.</p>
              </div>

            </div>

            <div className="form-two">

              <Field
                label="iPhone Model"
                name="deviceModel"
                value={form.deviceModel}
                change={change}
                placeholder="iPhone 15 Pro"
              />

              <Field
                label="Serial Number / IMEI"
                name="serialNumber"
                value={form.serialNumber}
                change={change}
                placeholder="Optional"
                required={false}
              />

            </div>

          </section>

          <section className="ui-card form-section-card">

            <div className="form-section-heading">

              <div className="form-section-icon">
                <Wrench size={19} />
              </div>

              <div>
                <h2>Repair Problem</h2>
                <p>Describe what is wrong with the device.</p>
              </div>

            </div>

            <div className="app-field">

              <label>Reported Problem</label>

              <textarea
                name="problem"
                value={form.problem}
                onChange={change}
                placeholder="Example: Display damaged, touch not working..."
                required
              />

            </div>

          </section>

        </div>

        <aside>

          <section className="ui-card photo-card">

            <div className="form-section-heading">

              <div className="form-section-icon">
                <Camera size={19} />
              </div>

              <div>
                <h2>Phone Photo</h2>
                <p>Photo before starting repair.</p>
              </div>

            </div>

            <label className="upload-box">

              {preview ? (
                <img
                  src={preview}
                  alt="Phone preview"
                />
              ) : (
                <div className="upload-empty">

                  <Camera size={30} />

                  <strong>
                    Take or upload photo
                  </strong>

                  <span>
                    JPG, PNG or phone camera
                  </span>

                </div>
              )}

              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={selectImage}
              />

            </label>

          </section>

          {message && (
            <div className="error-message">
              {message}
            </div>
          )}

          <button
            className="btn btn-primary submit-repair-btn"
            disabled={loading}
          >

            <Save size={17} />

            {loading
              ? "Creating..."
              : "Create Repair"}

          </button>

        </aside>

      </form>

    </AdminLayout>
  );
}

function Field({
  label,
  name,
  value,
  change,
  placeholder,
  type = "text",
  required = true,
}) {
  return (
    <div className="app-field">

      <label>{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={change}
        placeholder={placeholder}
        required={required}
      />

    </div>
  );
}

export default NewRepair;