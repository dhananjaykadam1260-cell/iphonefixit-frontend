import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Plus,
  Smartphone,
  Users,
  Wrench,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../api/api";
import AdminLayout from "../components/AdminLayout";

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadDashboard = useCallback(async () => {
    try {
      setError("");
      const response = await api.get("/dashboard");
      setData(response.data);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="screen-message">Loading dashboard...</div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="screen-message">{error || "Dashboard unavailable."}</div>
      </AdminLayout>
    );
  }

  const active =
    Number(data.receivedRepairs || 0) +
    Number(data.checkingRepairs || 0) +
    Number(data.repairingRepairs || 0) +
    Number(data.readyRepairs || 0);

  return (
    <AdminLayout>
      <div className="page-heading">
        <div>
          <span className="page-overline">SHOP OVERVIEW</span>
          <h1>Dashboard</h1>
          <p>Revenue, repair progress and customer activity.</p>
        </div>

        <button className="btn btn-primary" onClick={() => navigate("/admin/new-repair")}>
          <Plus size={17} />
          New Repair
        </button>
      </div>

      <div className="dashboard-cards">
        <DashboardCard icon={<IndianRupee />} title="Total Revenue" value={`₹${Number(data.totalRevenue || 0).toLocaleString("en-IN")}`} text="Delivered repairs" />
        <DashboardCard icon={<IndianRupee />} title="Today's Revenue" value={`₹${Number(data.todayRevenue || 0).toLocaleString("en-IN")}`} text="Delivered today" />
        <DashboardCard icon={<Wrench />} title="Active Repairs" value={active} text="Currently open" />
        <DashboardCard icon={<CheckCircle2 />} title="Delivered" value={data.deliveredRepairs || 0} text="Completed jobs" />
        <DashboardCard icon={<Users />} title="Customers" value={data.totalCustomers || 0} text="Customer records" />
        <DashboardCard icon={<Smartphone />} title="Total Repairs" value={data.totalRepairs || 0} text="All repair jobs" />
      </div>

      <div className="dashboard-main-grid">
        <section className="ui-card">
          <div className="card-heading">
            <div>
              <h2>Revenue</h2>
              <p>Last six months</p>
            </div>
          </div>

          <div className="chart-area">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.monthlyRevenue || []}>
                <defs>
                  <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6d5dfc" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6d5dfc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#6d5dfc" strokeWidth={3} fill="url(#dashboardRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="ui-card">
          <div className="card-heading">
            <div>
              <h2>Repair Pipeline</h2>
              <p>Current repair status</p>
            </div>
          </div>

          <div className="pipeline">
            <PipelineRow icon={<Clock3 size={16} />} name="Received" value={data.receivedRepairs} type="received" />
            <PipelineRow icon={<Clock3 size={16} />} name="Checking" value={data.checkingRepairs} type="checking" />
            <PipelineRow icon={<Wrench size={16} />} name="Repairing" value={data.repairingRepairs} type="repairing" />
            <PipelineRow icon={<CheckCircle2 size={16} />} name="Ready" value={data.readyRepairs} type="ready" />
            <PipelineRow icon={<CheckCircle2 size={16} />} name="Delivered" value={data.deliveredRepairs} type="delivered" />
          </div>
        </section>
      </div>

      <section className="ui-card">
        <div className="card-heading">
          <div>
            <h2>Recent Repairs</h2>
            <p>Recently added devices</p>
          </div>
          <button className="link-button" onClick={() => navigate("/admin/repairs")}>
            View all <ArrowRight size={16} />
          </button>
        </div>

        <div className="table-scroll">
          <table className="app-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Device</th>
                <th>Status</th>
                <th>Cost</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(data.recentRepairs || []).map((repair) => (
                <tr key={repair.id}>
                  <td>
                    <div className="person-cell">
                      <div className="person-avatar">{repair.customerName?.charAt(0)?.toUpperCase()}</div>
                      <div>
                        <strong>{repair.customerName}</strong>
                        <span>{repair.phoneNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td>{repair.deviceModel}</td>
                  <td><Status status={repair.status} /></td>
                  <td>{repair.finalRepairCost != null ? `₹${Number(repair.finalRepairCost).toLocaleString("en-IN")}` : "Pending"}</td>
                  <td>
                    <button className="btn-small" onClick={() => navigate(`/admin/repair/${repair.id}`)}>Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}

function DashboardCard({ icon, title, value, text }) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-icon">{icon}</div>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{text}</small>
    </div>
  );
}

function PipelineRow({ icon, name, value, type }) {
  return (
    <div className="pipeline-row">
      <div>
        <span className={`pipeline-icon ${type}`}>{icon}</span>
        <span>{name}</span>
      </div>
      <strong>{value || 0}</strong>
    </div>
  );
}

function Status({ status }) {
  const safeStatus = status || "RECEIVED";
  return <span className={`status ${safeStatus.toLowerCase()}`}>{safeStatus}</span>;
}

export default AdminDashboard;
