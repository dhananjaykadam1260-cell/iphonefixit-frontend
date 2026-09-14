import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useParams } from "react-router-dom";

import {
  Download,
  MessageCircle,
  Save,
  Smartphone,
  User,
} from "lucide-react";

import api from "../api/api";
import AdminLayout from "../components/AdminLayout";

function RepairDetails() {
  const { id } = useParams();

  const [repair, setRepair] = useState(null);

  const [status, setStatus] = useState("");
  const [cost, setCost] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Backend base URL for uploaded images
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:8080";

  // API base URL for PDF download
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api";

  const loadRepair = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(`/repairs/${id}`);

      setRepair(response.data);

      setStatus(
        response.data.status ||
        "RECEIVED"
      );

      setCost(
        response.data.finalRepairCost ??
        ""
      );

    } catch (error) {
      console.error(
        "Load repair error:",
        error
      );

      setError(
        error.response?.data?.error ||
        "Unable to load repair details."
      );

    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRepair();
  }, [loadRepair]);

  const saveStatus = async () => {
    try {
      setMessage("");
      setError("");

      await api.put(
        `/repairs/${id}/status`,
        null,
        {
          params: {
            status,
          },
        }
      );

      setMessage(
        "Repair status updated successfully."
      );

      await loadRepair();

    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      setError(
        error.response?.data?.error ||
        "Unable to update status."
      );
    }
  };

  const saveCost = async () => {
    if (
      cost === "" ||
      Number(cost) < 0
    ) {
      setError(
        "Please enter a valid repair cost."
      );

      return;
    }

    try {
      setMessage("");
      setError("");

      await api.put(
        `/repairs/${id}/cost`,
        null,
        {
          params: {
            cost: Number(cost),
          },
        }
      );

      setMessage(
        "Final repair cost saved successfully."
      );

      await loadRepair();

    } catch (error) {
      console.error(
        "Cost update error:",
        error
      );

      setError(
        error.response?.data?.error ||
        "Unable to save repair cost."
      );
    }
  };

  const downloadBill = () => {
    if (
      repair?.finalRepairCost == null
    ) {
      setError(
        "Please add final repair cost before downloading the bill."
      );

      return;
    }

    window.open(
      `${apiUrl}/bills/${id}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareWhatsApp = async () => {
    try {
      setMessage("");
      setError("");

      const response =
        await api.get(
          `/whatsapp/share/${id}`
        );

      if (
        !response.data?.whatsappUrl
      ) {
        setError(
          "WhatsApp link was not generated."
        );

        return;
      }

      window.open(
        response.data.whatsappUrl,
        "_blank",
        "noopener,noreferrer"
      );

    } catch (error) {
      console.error(
        "WhatsApp error:",
        error
      );

      setError(
        error.response?.data?.error ||
        "Unable to open WhatsApp sharing."
      );
    }
  };

  if (loading) {
    return (
      <AdminLayout>

        <div className="screen-message">
          Loading repair...
        </div>

      </AdminLayout>
    );
  }

  if (error && !repair) {
    return (
      <AdminLayout>

        <div className="screen-message">
          {error}
        </div>

      </AdminLayout>
    );
  }

  if (!repair) {
    return (
      <AdminLayout>

        <div className="screen-message">
          Repair not found.
        </div>

      </AdminLayout>
    );
  }

  return (
    <AdminLayout>

      {/* PAGE HEADING */}

      <div className="page-heading">

        <div>

          <span className="page-overline">
            REPAIR #{repair.id}
          </span>

          <h1>
            {repair.deviceModel}
          </h1>

          <p>
            {repair.customer?.name ||
              "Unknown Customer"}
            {" · "}
            {repair.customer?.phoneNumber ||
              "-"}
          </p>

        </div>

        <Status
          status={
            repair.status ||
            "RECEIVED"
          }
        />

      </div>

      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="repair-details-layout">

        {/* LEFT SIDE */}

        <section className="ui-card">

          <div className="card-heading">

            <div>

              <h2>
                Device Information
              </h2>

              <p>
                Phone received for repair
              </p>

            </div>

            <Smartphone size={20} />

          </div>

          {/* PHONE IMAGE */}

          {repair.phoneImageUrl ? (

            <div className="repair-photo">

              <img
                src={`${backendUrl}${repair.phoneImageUrl}`}
                alt={`${repair.deviceModel} repair`}
                onError={(e) => {
                  e.currentTarget.style.display =
                    "none";
                }}
              />

            </div>

          ) : (

            <div className="repair-photo">

              <div className="screen-message">
                No phone photo available
              </div>

            </div>

          )}

          {/* DEVICE DETAILS */}

          <div className="details-info-grid">

            <Info
              title="Device Model"
              value={repair.deviceModel}
            />

            <Info
              title="Serial / IMEI"
              value={
                repair.serialNumber ||
                "-"
              }
            />

            <Info
              title="Received Date"
              value={
                repair.receivedDate ||
                "-"
              }
            />

            <Info
              title="Delivery Date"
              value={
                repair.deliveryDate ||
                "Pending"
              }
            />

          </div>

          {/* PROBLEM */}

          <div className="problem-box">

            <span>
              REPORTED PROBLEM
            </span>

            <p>
              {repair.problem ||
                "No problem description provided."}
            </p>

          </div>

        </section>

        {/* RIGHT SIDE */}

        <div>

          {/* CUSTOMER */}

          <section className="ui-card control-box">

            <div className="card-heading">

              <div>
                <h2>Customer</h2>
              </div>

              <User size={19} />

            </div>

            <Info
              title="Name"
              value={
                repair.customer?.name
              }
            />

            <Info
              title="Phone"
              value={
                repair.customer
                  ?.phoneNumber
              }
            />

          </section>

          {/* STATUS */}

          <section className="ui-card control-box">

            <h2>
              Repair Status
            </h2>

            <select
              className="app-select"
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
            >

              <option value="RECEIVED">
                Received
              </option>

              <option value="CHECKING">
                Checking
              </option>

              <option value="REPAIRING">
                Repairing
              </option>

              <option value="READY">
                Ready
              </option>

              <option value="DELIVERED">
                Delivered
              </option>

            </select>

            <button
              type="button"
              className="btn btn-primary full-button"
              onClick={saveStatus}
            >

              <Save size={16} />

              Update Status

            </button>

          </section>

          {/* FINAL COST */}

          <section className="ui-card control-box">

            <h2>
              Final Repair Cost
            </h2>

            <div className="money-field">

              <span>₹</span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(e) =>
                  setCost(
                    e.target.value
                  )
                }
                placeholder="0"
              />

            </div>

            <button
              type="button"
              className="btn btn-secondary full-button"
              onClick={saveCost}
            >

              <Save size={16} />

              Save Cost

            </button>

          </section>

          {/* BILL & WHATSAPP */}

          <section className="ui-card control-box">

            <h2>
              Bill & Sharing
            </h2>

            <button
              type="button"
              className="btn btn-primary full-button"
              disabled={
                repair.finalRepairCost ==
                null
              }
              onClick={downloadBill}
            >

              <Download size={17} />

              Download PDF

            </button>

            <button
              type="button"
              className="btn whatsapp-button full-button"
              onClick={
                shareWhatsApp
              }
            >

              <MessageCircle
                size={17}
              />

              Share on WhatsApp

            </button>

          </section>

        </div>

      </div>

    </AdminLayout>
  );
}

function Info({
  title,
  value,
}) {
  return (
    <div className="info-item">

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

export default RepairDetails;