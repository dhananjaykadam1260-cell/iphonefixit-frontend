import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LockKeyhole,
  Mail,
  Smartphone,
  LogIn,
} from "lucide-react";

import api from "../api/api";

function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/admin", {
        replace: true,
      });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await api.post(
        "/auth/login",
        form
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "role",
        response.data.role
      );

      localStorage.setItem(
        "name",
        response.data.name
      );

      localStorage.setItem(
        "email",
        response.data.email
      );

      navigate("/admin", {
        replace: true,
      });

    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.error ||
        "Invalid email or password."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-brand">

          <div className="login-logo">
            <Smartphone size={24} />
          </div>

          <h1>
            iPhone<span>Fixit</span>
          </h1>

        </div>

        <div className="login-heading">

          <h2>Welcome back</h2>

          <p>
            Sign in to manage repair jobs.
          </p>

        </div>

        <form
          className="login-form"
          onSubmit={handleLogin}
        >

          <label>Email</label>

          <div className="login-input">

            <Mail size={18} />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@iphonefixit.com"
              autoComplete="email"
              required
            />

          </div>

          <label>Password</label>

          <div className="login-input">

            <LockKeyhole size={18} />

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />

          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >

            <LogIn size={17} />

            {loading
              ? "Signing in..."
              : "Sign In"}

          </button>

        </form>

      </div>

    </div>
  );
}

export default AdminLogin;