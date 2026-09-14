import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";

import api from "../api/api";
import AdminLayout from "../components/AdminLayout";

function AllRepairs() {
  const [repairs, setRepairs] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadRepairs = useCallback(async () => {
    try {
      setError("");
      const response = await api.get("/repairs");
      setRepairs(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load repairs.");
    }
  }, []);

  useEffect(() => {
    loadRepairs();
  }, [loadRepairs]);

  const filtered = repairs.filter((repair) => {
    const text = search.toLowerCase();
    return (
      repair.customer?.name?.toLowerCase().includes(text) ||
      repair.customer?.phoneNumber?.includes(text) ||
      repair.deviceModel?.toLowerCase().includes(text) ||
      String(repair.id).includes(text)
    );
  });

  return (
    <AdminLayout>
      <div className="page-heading">
        <div>
          <span className="page-overline">REPAIR MANAGEMENT</span>
          <h1>All Repairs</h1>
          <p>Search and manage every repair job.</p>
        </div>

        <button className="btn btn-primary" onClick={() => navigate("/admin/new-repair")}>
          <Plus size={17} />
          New Repair
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <section className="ui-card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={17} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ID, name, phone or device..." />
          </div>
          <span>{filtered.length} repairs</span>
        </div>

        <div className="table-scroll">
          <table className="app-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Device</th>
                <th>Problem</th>
                <th>Status</th>
                <th>Cost</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((repair) => (
                <tr key={repair.id}>
                  <td><strong>#{repair.id}</strong></td>
                  <td>
                    <div className="person-cell">
                      <div className="person-avatar">{repair.customer?.name?.charAt(0)?.toUpperCase()}</div>
                      <div>
                        <strong>{repair.customer?.name}</strong>
                        <span>{repair.customer?.phoneNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td>{repair.deviceModel}</td>
                  <td className="issue-table-cell">{repair.problem}</td>
                  <td><Status status={repair.status} /></td>
                  <td>{repair.finalRepairCost != null ? `₹${Number(repair.finalRepairCost).toLocaleString("en-IN")}` : "Pending"}</td>
                  <td><button className="btn-small" onClick={() => navigate(`/admin/repair/${repair.id}`)}>Manage</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}

function Status({ status }) {
  const safeStatus = status || "RECEIVED";
  return <span className={`status ${safeStatus.toLowerCase()}`}>{safeStatus}</span>;
}

export default AllRepairs;
