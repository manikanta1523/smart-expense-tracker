
import { useState, useEffect } from "react";
import Auth from "./components/Auth";
import "./App.css";

import {
  LayoutDashboard, Wallet, TrendingUp, TrendingDown,
  Receipt, Settings, LogOut, Plus, Search, Bell,
  Trash2, Users, BarChart3
} from "lucide-react";

import { Pie, Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

function App() {
  const [currentUser, setCurrentUser] = useState(() =>
    JSON.parse(localStorage.getItem("currentUser") || "null")
  );

  const [transactions, setTransactions] = useState(() =>
    JSON.parse(localStorage.getItem("transactions") || "[]")
  );

  const [view, setView] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "Expense",
    category: "Food",
    date: new Date().toISOString().slice(0, 10)
  });

  const registeredUsers = JSON.parse(
    localStorage.getItem("users") || "[]"
  );

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const login = (user) => {
    localStorage.setItem("currentUser", JSON.stringify(user));
    setCurrentUser(user);
    setView("dashboard");
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setView("dashboard");
  };

  if (!currentUser) {
    return <Auth onLogin={login} />;
  }

  const isAdmin = currentUser.role === "admin";

  const userTransactions = isAdmin
    ? transactions
    : transactions.filter(t => t.owner === currentUser.email);

  const income = userTransactions
    .filter(t => t.type === "Income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = userTransactions
    .filter(t => t.type === "Expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expenses;

  const addTransaction = (e) => {
    e.preventDefault();

    if (!form.title.trim() || Number(form.amount) <= 0) {
      alert("Enter valid transaction details");
      return;
    }

    const newTransaction = {
      ...form,
      id: Date.now(),
      amount: Number(form.amount),
      owner: currentUser.email
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setShowForm(false);

    setForm({
      title: "",
      amount: "",
      type: "Expense",
      category: "Food",
      date: new Date().toISOString().slice(0, 10)
    });
  };

  const deleteTransaction = (id) => {
    if (window.confirm("Delete this transaction?")) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const filteredTransactions = userTransactions.filter(t => {
    const matchesSearch = t.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType =
      view === "income" ? t.type === "Income" :
      view === "expenses" ? t.type === "Expense" : true;

    return matchesSearch && matchesType;
  });

  const categoryTotals = {};

  userTransactions
    .filter(t => t.type === "Expense")
    .forEach(t => {
      categoryTotals[t.category] =
        (categoryTotals[t.category] || 0) + Number(t.amount);
    });

  const pieData = {
    labels: ["Income", "Expenses"],
    datasets: [{
      data: [income, expenses],
      backgroundColor: ["#20bd83", "#ef6464"],
      borderWidth: 0
    }]
  };

  const barData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      label: "Expenses by Category (₹)",
      data: Object.values(categoryTotals),
      backgroundColor: "#20bd83",
      borderRadius: 6
    }]
  };

  const pageTitles = {
    dashboard: isAdmin ? "Admin Dashboard" : "User Dashboard",
    users: "User Management",
    transactions: "Transactions",
    income: "Income",
    expenses: "Expenses",
    reports: "Financial Reports",
    settings: "Settings"
  };

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="logo">₹ Smart<span>Track</span></h2>

        <p className="menu-title">MENU</p>

        <button
          className={`nav ${view === "dashboard" ? "active" : ""}`}
          onClick={() => setView("dashboard")}
        >
          <LayoutDashboard /> Dashboard
        </button>

        {isAdmin && (
          <button
            className={`nav ${view === "users" ? "active" : ""}`}
            onClick={() => setView("users")}
          >
            <Users /> Manage Users
          </button>
        )}

        <button
          className={`nav ${view === "transactions" ? "active" : ""}`}
          onClick={() => setView("transactions")}
        >
          <Wallet /> Transactions
        </button>

        <button
          className={`nav ${view === "income" ? "active" : ""}`}
          onClick={() => setView("income")}
        >
          <TrendingUp /> Income
        </button>

        <button
          className={`nav ${view === "expenses" ? "active" : ""}`}
          onClick={() => setView("expenses")}
        >
          <TrendingDown /> Expenses
        </button>

        <button
          className={`nav ${view === "reports" ? "active" : ""}`}
          onClick={() => setView("reports")}
        >
          <BarChart3 /> Reports
        </button>

        <button
          className={`nav ${view === "settings" ? "active" : ""}`}
          onClick={() => setView("settings")}
        >
          <Settings /> Settings
        </button>

        {isAdmin && <p className="admin-info">ADMIN PANEL</p>}

        <button className="sidebar-bottom" onClick={logout}>
          <LogOut /> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main">

        <header className="topbar">
          <div>
            <h2>{pageTitles[view]}</h2>
            <p>Welcome, {currentUser.name}!</p>
          </div>

          <div className="profile">
            <Bell />
            <div className="avatar">
              {currentUser.name?.[0]?.toUpperCase()}
            </div>
            <span>{currentUser.role}</span>
          </div>
        </header>

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <>
            <section className="welcome">
              <div>
                <h2>Manage Your Money Smarter!</h2>
                <p>Track your income, expenses and savings.</p>
              </div>

              {!isAdmin && (
                <button onClick={() => setShowForm(true)}>
                  <Plus size={18} /> Add Transaction
                </button>
              )}
            </section>

            <section className="cards">
              <StatCard title="Total Balance" value={balance} icon={<Wallet />} color="purple" />

              <StatCard title="Total Income" value={income} icon={<TrendingUp />} color="green" />

              <StatCard title="Total Expenses" value={expenses} icon={<TrendingDown />} color="red" />

              <div className="stat-card">
                <div className="stat-icon blue"><Receipt /></div>
                <p>Total Transactions</p>
                <h2>{userTransactions.length}</h2>
              </div>

              {isAdmin && (
                <div className="stat-card">
                  <div className="stat-icon purple"><Users /></div>
                  <p>Registered Users</p>
                  <h2>{registeredUsers.length}</h2>
                </div>
              )}
            </section>

            <section className="transactions">
              <div className="section-header">
                <div>
                  <h2>Recent Transactions</h2>
                  <p>Manage your financial activities</p>
                </div>

                {!isAdmin && (
                  <button onClick={() => setShowForm(true)}>
                    <Plus size={17} /> Add New
                  </button>
                )}
              </div>

              <TransactionTable
                data={userTransactions.slice(0, 5)}
                isAdmin={isAdmin}
                onDelete={deleteTransaction}
              />
            </section>
          </>
        )}

        {/* ADMIN USER MANAGEMENT */}
        {view === "users" && isAdmin && (
          <section className="transactions">
            <div className="section-header">
              <div>
                <h2>Registered Users</h2>
                <p>View registered SmartTrack users</p>
              </div>
            </div>

            <section className="cards">
              <div className="stat-card">
                <div className="stat-icon purple"><Users /></div>
                <p>Total Users</p>
                <h2>{registeredUsers.length}</h2>
              </div>

              <div className="stat-card">
                <div className="stat-icon blue"><Receipt /></div>
                <p>Total Transactions</p>
                <h2>{transactions.length}</h2>
              </div>
            </section>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Transactions</th>
                  </tr>
                </thead>

                <tbody>
                  {registeredUsers.map((user, index) => (
                    <tr key={user.email || index}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role || "user"}</td>
                      <td>
                        {transactions.filter(
                          t => t.owner === user.email
                        ).length}
                      </td>
                    </tr>
                  ))}

                  {registeredUsers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="empty">
                        No registered users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TRANSACTIONS / INCOME / EXPENSES */}
        {["transactions", "income", "expenses"].includes(view) && (
          <section className="transactions">
            <div className="section-header">
              <div>
                <h2>{pageTitles[view]}</h2>
                <p>Manage your financial records</p>
              </div>

              {!isAdmin && (
                <button onClick={() => setShowForm(true)}>
                  <Plus size={17} /> Add New
                </button>
              )}
            </div>

            <div className="search-box">
              <Search size={18} />
              <input
                placeholder="Search transactions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <TransactionTable
              data={filteredTransactions}
              isAdmin={isAdmin}
              onDelete={deleteTransaction}
            />
          </section>
        )}

        {/* REPORTS */}
        {view === "reports" && (
          <>
            <section className="cards">
              <StatCard title="Total Income" value={income} icon={<TrendingUp />} color="green" />

              <StatCard title="Total Expenses" value={expenses} icon={<TrendingDown />} color="red" />

              <StatCard title="Net Balance" value={balance} icon={<Wallet />} color="purple" />
            </section>

            <section className="cards">
              <div className="transactions">
                <h2>Income vs Expenses</h2>
                <div style={{ maxWidth: "350px", margin: "25px auto" }}>
                  <Pie
                    data={pieData}
                    options={{ responsive: true }}
                  />
                </div>
              </div>

              <div className="transactions">
                <h2>Expenses by Category</h2>
                <div style={{ marginTop: "30px" }}>
                  {Object.keys(categoryTotals).length > 0 ? (
                    <Bar
                      data={barData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: true }
                        }
                      }}
                    />
                  ) : (
                    <p className="empty">No expense data available.</p>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        {/* SETTINGS */}
        {view === "settings" && (
          <section className="transactions">
            <h2>Account Settings</h2>
            <p style={{ marginTop: "15px" }}>Name: {currentUser.name}</p>
            <p style={{ marginTop: "10px" }}>Email: {currentUser.email}</p>
            <p style={{ marginTop: "10px" }}>Role: {currentUser.role}</p>
          </section>
        )}

      </main>

      {/* ADD TRANSACTION MODAL */}
      {showForm && !isAdmin && (
        <div className="modal-overlay">
          <form className="transaction-form" onSubmit={addTransaction}>
            <h2>Add Transaction</h2>

            <label>Description</label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />

            <label>Amount</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              required
            />

            <label>Type</label>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
            >
              <option>Expense</option>
              <option>Income</option>
            </select>

            <label>Category</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              {["Food", "Travel", "Shopping", "Education", "Bills", "Salary", "Other"]
                .map(c => <option key={c}>{c}</option>)}
            </select>

            <label>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              required
            />

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button type="submit">Save Transaction</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <p>{title}</p>
      <h2>₹{Number(value).toLocaleString("en-IN")}</h2>
    </div>
  );
}

function TransactionTable({ data, isAdmin, onDelete }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            {isAdmin && <th>User</th>}
            <th>Category</th>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map(t => (
            <tr key={t.id}>
              <td>{t.title}</td>
              {isAdmin && <td>{t.owner || "Unknown"}</td>}
              <td>{t.category}</td>
              <td>{t.date}</td>
              <td>{t.type}</td>
              <td>₹{Number(t.amount).toLocaleString("en-IN")}</td>
              <td>
                {isAdmin ? (
                  <span>Admin</span>
                ) : (
                  <button
                    className="delete-btn"
                    onClick={() => onDelete(t.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td colSpan={isAdmin ? 7 : 6} className="empty">
                No transactions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
