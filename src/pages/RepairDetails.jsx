import { useEffect, useState } from "react";
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

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:8080";

  useEffect(() => {
    loadRepair();
  }, [id]);

  const loadRepair = async () => {
    try {
      const response =
        await api.get(`/repairs/${id}`);

      setRepair(response.data);

      setStatus(response.data.status);

      setCost(
        response.data.finalRepairCost ?? ""
      );

    } catch (error) {
      console.error(error);
    }
  };

  const saveStatus = async () => {
    try {
      await api.put(
        `/repairs/${id}/status`,
        null,
        {
          params: { status },
        }
      );

      setMessage("Repair status updated.");

      loadRepair();

    } catch {
      setMessage("Unable to update status.");
    }
  };

  const saveCost = async () => {
    if (!cost) {
      setMessage("Please enter final repair cost.");
      return;
    }

    try {
      await api.put(
        `/repairs/${id}/cost`,
        null,
        {
          params: { cost },
        }
      );

      setMessage("Final repair cost saved.");

      loadRepair();

    } catch {
      setMessage("Unable to save cost.");
    }
  };

  const downloadBill = () => {
    window.open(
      `${import.meta.env.VITE_API_URL}/bills/${id}`,
      "_blank"
    );
  };

  const shareWhatsApp = async () => {
    try {
      const response =
        await api.get(`/whatsapp/share/${id}`);

      window.open(
        response.data.whatsappUrl,
        "_blank"
      );

    } catch {
      setMessage("Unable to open WhatsApp sharing.");
    }
  };

  if (!repair) {
    return (
      <AdminLayout>

        <div className="screen-message">
          Loading repair...
        </div>

      </AdminLayout>
    );
  }

  return (
    <AdminLayout>

      <div className="page-heading">

        <div>

          <span className="page-overline">
            REPAIR #{repair.id}
          </span>

          <h1>{repair.deviceModel}</h1>

          <p>
            {repair.customer?.name} · {repair.customer?.phoneNumber}
          </p>

        </div>

        <Status status={repair.status} />

      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      <div className="repair-details-layout">

        <section className="ui-card">

          <div className="card-heading">

            <div>
              <h2>Device Information</h2>
              <p>Phone received for repair</p>
            </div>

            <Smartphone size={20} />

          </div>

          {repair.phoneImageUrl && (

            <div className="repair-photo">

              <img
                src={`${backendUrl}${repair.phoneImageUrl}`}
                alt="Phone"
              />

            </div>

          )}

          <div className="details-info-grid">

            <Info
              title="Device Model"
              value={repair.deviceModel}
            />

            <Info
              title="Serial / IMEI"
              value={repair.serialNumber || "-"}
            />

            <Info
              title="Received Date"
              value={repair.receivedDate}
            />

            <Info
              title="Delivery Date"
              value={repair.deliveryDate || "Pending"}
            />

          </div>

          <div className="problem-box">

            <span>REPORTED PROBLEM</span>

            <p>{repair.problem}</p>

          </div>

        </section>

        <div>

          <section className="ui-card control-box">

            <div className="card-heading">

              <div>
                <h2>Customer</h2>
              </div>

              <User size={19} />

            </div>

            <Info
              title="Name"
              value={repair.customer?.name}
            />

            <Info
              title="Phone"
              value={repair.customer?.phoneNumber}
            />

          </section>

          <section className="ui-card control-box">

            <h2>Repair Status</h2>

            <select
              className="app-select"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
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
              className="btn btn-primary full-button"
              onClick={saveStatus}
            >
              <Save size={16} />
              Update Status
            </button>

          </section>

          <section className="ui-card control-box">

            <h2>Final Repair Cost</h2>

            <div className="money-field">

              <span>₹</span>

              <input
                type="number"
                min="0"
                value={cost}
                onChange={(e) =>
                  setCost(e.target.value)
                }
                placeholder="0"
              />

            </div>

            <button
              className="btn btn-secondary full-button"
              onClick={saveCost}
            >
              <Save size={16} />
              Save Cost
            </button>

          </section>

          <section className="ui-card control-box">

            <h2>Bill & Sharing</h2>

            <button
              className="btn btn-primary full-button"
              disabled={repair.finalRepairCost == null}
              onClick={downloadBill}
            >
              <Download size={17} />
              Download PDF
            </button>

            <button
              className="btn whatsapp-button full-button"
              onClick={shareWhatsApp}
            >
              <MessageCircle size={17} />
              Share on WhatsApp
            </button>

          </section>

        </div>

      </div>

    </AdminLayout>
  );
}

function Info({ title, value }) {
  return (
    <div className="info-item">

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

export default RepairDetails;