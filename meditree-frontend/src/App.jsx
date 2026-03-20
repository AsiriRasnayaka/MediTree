import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import AddPatient from "./components/AddPatient";
import QueueView from "./components/QueueView";
import AlertPanel from "./components/AlertPanel";
import { getAlerts } from "./services/api";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [alertCount, setAlertCount] = useState(0);

  // Check alerts count every 30 seconds for the nav badge
  useEffect(() => {
    checkAlerts();
    const interval = setInterval(checkAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  async function checkAlerts() {
    try {
      const res = await getAlerts();
      setAlertCount(res.data.length);
    } catch {
      // Backend might not be running yet
    }
  }

  function renderPage() {
    if (page === "dashboard") return <Dashboard />;
    if (page === "add")       return <AddPatient />;
    if (page === "queue")     return <QueueView />;
    if (page === "alerts")    return <AlertPanel />;
  }

  return (
    <div className="app">
      {/* Top Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="nav-logo">
            <svg viewBox="0 0 20 20" fill="white" width="14" height="14">
              <path d="M10 2a4 4 0 100 8 4 4 0 000-8zM4 14c0-2.5 2.7-4.5 6-4.5s6 2 6 4.5v1.5H4V14z"/>
            </svg>
          </div>
          <div>
            <div className="brand-name">MediTree</div>
            <div className="brand-sub">Smart Patient Triage System</div>
          </div>
        </div>

        <div className="nav-links">
          <button
            className={`nav-btn ${page === "dashboard" ? "active" : ""}`}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`nav-btn ${page === "queue" ? "active" : ""}`}
            onClick={() => setPage("queue")}
          >
            Queue
          </button>
          <button
            className={`nav-btn ${page === "add" ? "active" : ""}`}
            onClick={() => setPage("add")}
          >
            Add Patient
          </button>
          <button
            className={`nav-btn ${page === "alerts" ? "active" : ""}`}
            onClick={() => { setPage("alerts"); checkAlerts(); }}
          >
            Alerts
            {alertCount > 0 && (
              <span className="nav-badge">{alertCount}</span>
            )}
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
