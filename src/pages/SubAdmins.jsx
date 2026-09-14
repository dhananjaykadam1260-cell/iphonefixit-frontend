import {
  useEffect,
  useState,
} from "react";

import {
  UserPlus,
  Users,
  Power,
  PowerOff,
} from "lucide-react";

import api from "../api/api";
import AdminLayout from "../components/AdminLayout";

function SubAdmins() {

  const [users, setUsers] =
    useState([]);

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      password: "",
    });

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {

    loadUsers();

  }, []);

  const loadUsers =
    async () => {

      try {

        const response =
          await api.get(
            "/admin/subadmins"
          );

        setUsers(
          response.data
        );

      } catch (error) {

        console.error(error);
      }
    };

  const change =
    (e) => {

      setForm({
        ...form,
        [e.target.name]:
          e.target.value,
      });
    };

  const create =
    async (e) => {

      e.preventDefault();

      setLoading(true);

      setMessage("");

      try {

        await api.post(
          "/admin/subadmins",
          form
        );

        setForm({
          name: "",
          email: "",
          password: "",
        });

        setMessage(
          "Subadmin created successfully."
        );

        loadUsers();

      } catch (error) {

        setMessage(
          error.response?.data?.error ||
          "Unable to create subadmin."
        );

      } finally {

        setLoading(false);
      }
    };

  const updateStatus =
    async (
      id,
      active
    ) => {

      try {

        await api.put(
          `/admin/subadmins/${id}/status`,
          null,
          {
            params: {
              active,
            },
          }
        );

        loadUsers();

      } catch (error) {

        console.error(error);
      }
    };

  return (
    <AdminLayout>

      <div className="page-heading">

        <div>

          <span className="page-overline">
            STAFF MANAGEMENT
          </span>

          <h1>
            Subadmins
          </h1>

          <p>
            Create and manage shop staff.
          </p>

        </div>

        <div className="heading-count">

          <Users size={18} />

          {users.length}

        </div>

      </div>

      <div className="subadmin-layout">

        <section className="ui-card">

          <div className="card-heading">

            <div>

              <h2>
                New Subadmin
              </h2>

              <p>
                Create staff login access.
              </p>

            </div>

            <UserPlus
              size={20}
            />

          </div>

          <form
            className="subadmin-form"
            onSubmit={create}
          >

            <div className="app-field">

              <label>Name</label>

              <input
                name="name"
                value={form.name}
                onChange={change}
                placeholder="Staff name"
                required
              />

            </div>

            <div className="app-field">

              <label>Email</label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={change}
                placeholder="staff@iphonefixit.com"
                required
              />

            </div>

            <div className="app-field">

              <label>Password</label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={change}
                placeholder="Minimum 6 characters"
                required
              />

            </div>

            {message && (

              <div className="success-message">
                {message}
              </div>

            )}

            <button
              className="btn btn-primary full-button"
              disabled={loading}
            >

              <UserPlus size={17} />

              {loading
                ? "Creating..."
                : "Create Subadmin"}

            </button>

          </form>

        </section>

        <section className="ui-card">

          <div className="card-heading">

            <div>

              <h2>
                Shop Staff
              </h2>

              <p>
                Active and disabled staff.
              </p>

            </div>

          </div>

          <div className="subadmin-list">

            {users.map(
              (user) => (

                <div
                  className="subadmin-item"
                  key={user.id}
                >

                  <div className="person-cell">

                    <div className="person-avatar">

                      {user.name
                        ?.charAt(0)
                        ?.toUpperCase()}

                    </div>

                    <div>

                      <strong>
                        {user.name}
                      </strong>

                      <span>
                        {user.email}
                      </span>

                    </div>

                  </div>

                  <div className="staff-actions">

                    <span
                      className={
                        user.active
                          ? "staff-active"
                          : "staff-disabled"
                      }
                    >

                      {user.active
                        ? "Active"
                        : "Disabled"}

                    </span>

                    <button
                      className={
                        user.active
                          ? "staff-disable-btn"
                          : "staff-enable-btn"
                      }
                      onClick={() =>
                        updateStatus(
                          user.id,
                          !user.active
                        )
                      }
                    >

                      {user.active
                        ? <PowerOff size={16} />
                        : <Power size={16} />}

                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        </section>

      </div>

    </AdminLayout>
  );
}

export default SubAdmins;