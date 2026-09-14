import { useCallback, useEffect, useState } from "react";
import { Search, Users } from "lucide-react";

import api from "../api/api";
import AdminLayout from "../components/AdminLayout";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const loadCustomers = useCallback(async () => {
    try {
      setError("");
      const response = await api.get("/customers");
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load customers.");
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filtered = customers.filter((customer) => {
    const text = search.toLowerCase();
    return customer.name?.toLowerCase().includes(text) || customer.phoneNumber?.includes(text);
  });

  return (
    <AdminLayout>
      <div className="page-heading">
        <div>
          <span className="page-overline">CUSTOMER DATABASE</span>
          <h1>Customers</h1>
          <p>All customers who have submitted a device.</p>
        </div>

        <div className="heading-count">
          <Users size={18} />
          {customers.length}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <section className="ui-card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={17} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer..." />
          </div>
          <span>{filtered.length} customers</span>
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
                      <div className="person-avatar">{customer.name?.charAt(0)?.toUpperCase()}</div>
                      <strong>{customer.name}</strong>
                    </div>
                  </td>
                  <td>{customer.phoneNumber}</td>
                  <td>#{customer.id}</td>
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
