import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AllRepairs from "./pages/AllRepairs";
import Customers from "./pages/Customers";
import NewRepair from "./pages/NewRepair";
import RepairDetails from "./pages/RepairDetails";
import SubAdmins from "./pages/SubAdmins";
import TrackRepair from "./pages/TrackRepair";

function App() {
  return (
    <Routes>
      <Route path="/" element={<TrackRepair />} />
      <Route path="/track" element={<TrackRepair />} />
      <Route path="/admin/login" element={<AdminLogin />} />

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

      <Route
        path="/admin/subadmins"
        element={
          <ProtectedRoute adminOnly>
            <SubAdmins />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
