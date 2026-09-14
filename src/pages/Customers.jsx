import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Users,
  LogIn,
} from "lucide-react";

import api from "../api/api";
import AdminLayout from "../components/AdminLayout";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response =
        await api.get("/customers");

      setCustomers(response.data);

    } catch (error) {
      console.error(error);
    }
  };

  const filtered =
    customers.filter((customer) => {
      const text =
        search.toLowerCase();

      return (
        customer.name
          ?.toLowerCase()
          .includes(text) ||
        customer.phoneNumber
          ?.includes(text)
      );
    });

  return (
    <AdminLayout>

      <div className="page-heading">

        <div>

          <span className="page-overline">
            CUSTOMER DATABASE
          </span>

          <h1>Customers</h1>

          <p>
            All customers who have submitted a device.
          </p>

        </div>

        <div className="page-heading-actions">

          <div className="heading-count">
            <Users size={18} />
            {customers.length}
          </div>

          <button
            className="admin-login-btn"
            onClick={() =>
              navigate("/admin/login")
            }
          >
            <LogIn size={17} />
            Admin Login
          </button>

        </div>

      </div>

      <section className="ui-card">

        <div className="table-toolbar">

          <div className="search-box">

            <Search size={17} />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search customer..."
            />

          </div>

          <span>
            {filtered.length} customers
          </span>

        </div>

        <div className="table-scroll">

          <table className="app-table">

            <thead>

              <tr>
                <th>Customer</th>
                <th>Phone Number</th>
                <th>Customer ID</th>
              </tr>

            </thead>

            <tbody>

              {filtered.map((customer) => (

                <tr key={customer.id}>

                  <td>

                    <div className="person-cell">

                      <div className="person-avatar">

                        {customer.name
                          ?.charAt(0)
                          ?.toUpperCase()}

                      </div>

                      <strong>
                        {customer.name}
                      </strong>

                    </div>

                  </td>

                  <td>
                    {customer.phoneNumber}
                  </td>

                  <td>
                    #{customer.id}
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

export default Customers;