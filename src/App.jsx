import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NewRepair from "./pages/NewRepair";
import AllRepairs from "./pages/AllRepairs";
import RepairDetails from "./pages/RepairDetails";
import Customers from "./pages/Customers";
import SubAdmins from "./pages/SubAdmins";
import TrackRepair from "./pages/TrackRepair";

function App() {
  return (
    <Routes>

      {/* Customer Website */}
      <Route
        path="/"
        element={<TrackRepair />}
      />

      <Route
        path="/track"
        element={<TrackRepair />}
      />

      {/* LOGIN - PUBLIC */}
      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      {/* ADMIN DASHBOARD */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/new-repair"
        element={
          <ProtectedRoute>
            <NewRepair />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/repairs"
        element={
          <ProtectedRoute>
            <AllRepairs />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/repair/:id"
        element={
          <ProtectedRoute>
            <RepairDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/customers"
        element={
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        }
      />

      {/* ADMIN ONLY */}
      <Route
        path="/admin/subadmins"
        element={
          <ProtectedRoute adminOnly>
            <SubAdmins />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default App;