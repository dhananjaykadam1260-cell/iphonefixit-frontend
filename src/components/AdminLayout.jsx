import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Smartphone,
  UserCog,
  Users,
  Wrench,
  X,
} from "lucide-react";

function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
  const email = localStorage.getItem("email");

  const closeMenu = () => setOpen(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="admin-app">
      <header className="mobile-topbar">
        <div className="brand-wrap">
          <div className="brand-logo">
            <Smartphone size={18} />
          </div>
          <div className="brand-name">
            iPhone<span>Fixit</span>
          </div>
        </div>

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={23} />
        </button>
      </header>

      {open && <div className="sidebar-backdrop" onClick={closeMenu} />}

      <aside className={`admin-sidebar ${open ? "show-sidebar" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-wrap">
            <div className="brand-logo">
              <Smartphone size={18} />
            </div>
            <div className="brand-name">
              iPhone<span>Fixit</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-close-btn"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className="menu-label">WORKSPACE</div>

        <nav className="sidebar-menu">
          <NavLink to="/admin" end onClick={closeMenu}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink to="/admin/new-repair" onClick={closeMenu}>
            <Plus size={18} />
            New Repair
          </NavLink>

          <NavLink to="/admin/repairs" onClick={closeMenu}>
            <Wrench size={18} />
            All Repairs
          </NavLink>

          <NavLink to="/admin/customers" onClick={closeMenu}>
            <Users size={18} />
            Customers
          </NavLink>

          {role === "ROLE_ADMIN" && (
            <NavLink to="/admin/subadmins" onClick={closeMenu}>
              <UserCog size={18} />
              Subadmins
            </NavLink>
          )}

          <NavLink to="/track" onClick={closeMenu}>
            <ExternalLink size={18} />
            Customer Website
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-add-btn"
            onClick={() => {
              navigate("/admin/new-repair");
              closeMenu();
            }}
          >
            <Plus size={18} />
            Add Repair
          </button>

          <div className="logged-user">
            <strong>{name || "User"}</strong>
            <span>{role === "ROLE_ADMIN" ? "Administrator" : "Subadmin"}</span>
            {email && <small>{email}</small>}
          </div>

          <button type="button" className="logout-btn" onClick={logout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-page">{children}</main>
    </div>
  );
}

export default AdminLayout;
