import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Camera,
  Save,
  Smartphone,
  User,
  Wrench,
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

  const [image, setImage] =
    useState(null);

  const [preview, setPreview] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("error");

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const change = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const changePhone = (e) => {
    const value =
      e.target.value.replace(
        /[^0-9]/g,
        ""
      );

    setForm((current) => ({
      ...current,
      phoneNumber: value,
    }));
  };

  const selectImage = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setMessage(
        "Please select a valid image."
      );

      setMessageType("error");

      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setMessage(
        "Image must be smaller than 10 MB."
      );

      setMessageType("error");

      return;
    }

    if (preview) {
      URL.revokeObjectURL(
        preview
      );
    }

    setImage(file);

    setPreview(
      URL.createObjectURL(
        file
      )
    );

    setMessage("");
  };

  const findOrCreateCustomer =
    async () => {

      const phoneNumber =
        form.phoneNumber.trim();

      try {
        const response =
          await api.get(
            `/customers/phone/${encodeURIComponent(
              phoneNumber
            )}`
          );

        return response.data;

      } catch (error) {

        const status =
          error.response?.status;

        /*
         * Your backend currently may return
         * 400 or 404 when customer does not exist.
         *
         * Only then create a new customer.
         */
        if (
          status !== 400 &&
          status !== 404
        ) {
          throw error;
        }

        const response =
          await api.post(
            "/customers",
            {
              name:
                form.name.trim(),

              phoneNumber,
            }
          );

        return response.data;
      }
    };

  const submit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("error");

    const name =
      form.name.trim();

    const phoneNumber =
      form.phoneNumber.trim();

    const deviceModel =
      form.deviceModel.trim();

    const serialNumber =
      form.serialNumber.trim();

    const problem =
      form.problem.trim();

    if (!name) {
      setMessage(
        "Please enter customer name."
      );

      return;
    }

    if (
      !/^[0-9]{10,15}$/.test(
        phoneNumber
      )
    ) {
      setMessage(
        "Please enter a valid phone number."
      );

      return;
    }

    if (!deviceModel) {
      setMessage(
        "Please enter device model."
      );

      return;
    }

    if (!problem) {
      setMessage(
        "Please enter repair problem."
      );

      return;
    }

    if (!image) {
      setMessage(
        "Please add a phone photo."
      );

      return;
    }

    setLoading(true);

    try {

      /*
       * STEP 1:
       * Find existing customer
       * or create new customer.
       */
      const customer =
        await findOrCreateCustomer();

      if (!customer?.id) {
        throw new Error(
          "Customer ID was not returned by server."
        );
      }

      /*
       * STEP 2:
       * Build multipart request.
       */
      const data =
        new FormData();

      data.append(
        "deviceModel",
        deviceModel
      );

      /*
       * Keep serialNumber in request
       * even when it is blank.
       */
      data.append(
        "serialNumber",
        serialNumber
      );

      data.append(
        "problem",
        problem
      );

      data.append(
        "image",
        image
      );

      /*
       * STEP 3:
       * Create repair.
       *
       * Do NOT manually set
       * Content-Type multipart/form-data.
       * Axios/browser creates the
       * boundary automatically.
       */
      const response =
        await api.post(
          `/repairs/customer/${customer.id}/with-image`,
          data
        );

      if (!response.data?.id) {
        throw new Error(
          "Repair was created but no repair ID was returned."
        );
      }

      setMessageType(
        "success"
      );

      setMessage(
        "Repair created successfully."
      );

      navigate(
        `/admin/repair/${response.data.id}`
      );

    } catch (error) {

      console.error(
        "CREATE REPAIR ERROR:",
        error
      );

      console.error(
        "STATUS:",
        error.response?.status
      );

      console.error(
        "BACKEND RESPONSE:",
        error.response?.data
      );

      let errorMessage =
        "Unable to create repair.";

      if (
        error.response?.data?.error
      ) {
        errorMessage =
          error.response.data.error;

      } else if (
        error.response?.data?.message
      ) {
        errorMessage =
          error.response.data.message;

      } else if (
        typeof error.response?.data ===
        "string"
      ) {
        errorMessage =
          error.response.data;

      } else if (
        error.response?.status
      ) {
        errorMessage =
          `Unable to create repair. Server returned ${error.response.status}.`;

      } else if (
        error.message
      ) {
        errorMessage =
          error.message;
      }

      setMessageType(
        "error"
      );

      setMessage(
        errorMessage
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

          <h1>
            New Repair
          </h1>

          <p>
            Add the customer, device,
            reported problem and intake photo.
          </p>

        </div>

      </div>

      <form
        className="new-repair-layout"
        onSubmit={submit}
      >

        <div>

          {/* CUSTOMER */}

          <section className="ui-card form-section-card">

            <div className="form-section-heading">

              <div className="form-section-icon">
                <User size={19} />
              </div>

              <div>

                <h2>
                  Customer Details
                </h2>

                <p>
                  Who owns this device?
                </p>

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
                value={
                  form.phoneNumber
                }
                change={
                  changePhone
                }
                placeholder="9876543210"
                type="tel"
                inputMode="numeric"
                maxLength={15}
              />

            </div>

          </section>

          {/* DEVICE */}

          <section className="ui-card form-section-card">

            <div className="form-section-heading">

              <div className="form-section-icon">
                <Smartphone
                  size={19}
                />
              </div>

              <div>

                <h2>
                  Device Details
                </h2>

                <p>
                  Information about
                  the phone.
                </p>

              </div>

            </div>

            <div className="form-two">

              <Field
                label="iPhone Model"
                name="deviceModel"
                value={
                  form.deviceModel
                }
                change={change}
                placeholder="iPhone 16 Pro"
              />

              <Field
                label="Serial Number / IMEI"
                name="serialNumber"
                value={
                  form.serialNumber
                }
                change={change}
                placeholder="Optional"
                required={false}
              />

            </div>

          </section>

          {/* PROBLEM */}

          <section className="ui-card form-section-card">

            <div className="form-section-heading">

              <div className="form-section-icon">

                <Wrench
                  size={19}
                />

              </div>

              <div>

                <h2>
                  Repair Problem
                </h2>

                <p>
                  Describe what is wrong
                  with the device.
                </p>

              </div>

            </div>

            <div className="app-field">

              <label>
                Reported Problem
              </label>

              <textarea
                name="problem"
                value={form.problem}
                onChange={change}
                placeholder="Example: Battery issue, display damaged..."
                required
              />

            </div>

          </section>

        </div>

        {/* RIGHT SIDE */}

        <aside>

          <section className="ui-card photo-card">

            <div className="form-section-heading">

              <div className="form-section-icon">

                <Camera
                  size={19}
                />

              </div>

              <div>

                <h2>
                  Phone Photo
                </h2>

                <p>
                  Photo before starting repair.
                </p>

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

                  <Camera
                    size={30}
                  />

                  <strong>
                    Take or upload photo
                  </strong>

                  <span>
                    JPG, PNG, WEBP
                    or phone camera
                  </span>

                </div>

              )}

              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={
                  selectImage
                }
              />

            </label>

          </section>

          {message && (

            <div
              className={
                messageType ===
                "success"
                  ? "success-message"
                  : "error-message"
              }
            >
              {message}
            </div>

          )}

          <button
            type="submit"
            className="btn btn-primary submit-repair-btn"
            disabled={loading}
          >

            <Save size={17} />

            {loading
              ? "Creating Repair..."
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
  inputMode,
  maxLength,
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
        placeholder={placeholder}
        required={required}
        inputMode={inputMode}
        maxLength={maxLength}
      />

    </div>
  );
}

export default NewRepair;